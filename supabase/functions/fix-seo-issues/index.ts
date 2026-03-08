import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AiConfig = {
  provider: string;
  api_key?: string;
  model?: string;
  endpoint?: string;
  priority?: "custom" | "lovable";
};

type AttemptResult =
  | { ok: true; data: Record<string, unknown>; provider: string }
  | { ok: false; provider: string; status?: number; error: string };

function getProviderUrl(provider: string, customEndpoint?: string) {
  if (provider === "custom" && customEndpoint) return customEndpoint;
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "google":
      return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    default:
      return "https://api.openai.com/v1/chat/completions";
  }
}

function getDefaultModel(provider: string) {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "google":
      return "gemini-2.0-flash";
    default:
      return "gpt-4o-mini";
  }
}

function parseMaybeJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidSeoPayload(data: Record<string, unknown> | null): data is Record<string, unknown> {
  return !!(
    data &&
    typeof data.title === "string" &&
    typeof data.meta_title === "string" &&
    typeof data.meta_description === "string" &&
    typeof data.excerpt === "string" &&
    typeof data.content === "string" &&
    typeof data.slug === "string"
  );
}

function getStructuredToolSchema() {
  return [
    {
      type: "function",
      function: {
        name: "apply_seo_updates",
        description: "Return optimized blog data after applying SEO fixes.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            meta_title: { type: "string" },
            meta_description: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
            slug: { type: "string" },
            fixes_applied: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "title",
            "meta_title",
            "meta_description",
            "excerpt",
            "content",
            "slug",
            "fixes_applied",
          ],
          additionalProperties: false,
        },
      },
    },
  ];
}

async function parseOpenAiCompatibleResponse(resp: Response) {
  const data = await resp.json();

  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.name === "apply_seo_updates") {
    const args = toolCall.function.arguments;
    if (typeof args === "string") {
      return parseMaybeJson(args);
    }
  }

  const text = data?.choices?.[0]?.message?.content;
  if (typeof text === "string") {
    return parseMaybeJson(text);
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blogData, failedChecks, mode, keywords } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    async function getCustomAiConfig(): Promise<AiConfig | null> {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "ai_api")
          .single();

        if (!data?.value) return null;

        const val = data.value as Record<string, any>;
        const key = val.text_api_key || val.api_key;

        return {
          provider: val.text_provider || val.provider || "openai",
          api_key: key,
          model: val.text_model || val.model,
          endpoint: val.text_endpoint,
          priority: (val.priority || "custom") as "custom" | "lovable",
        };
      } catch {
        return null;
      }
    }

    const issuesList = (failedChecks || [])
      .map((c: any) => `- ${c.label}: ${c.fix || "Needs fixing"}`)
      .join("\n");

    const primaryKeyword = keywords ? String(keywords).split(",")[0].trim() : "";

    const systemPrompt = `You are an expert SEO content optimizer. You will receive a blog post and a list of SEO issues to fix.

${mode === "optimize"
  ? `MODE: AUTO-OPTIMIZE — Fix ALL issues AND improve everything to achieve a 90+ SEO score. Be aggressive about improvements:
- Ensure meta description is exactly 145-155 characters
- Ensure title is exactly 50-60 characters
- Ensure word count is at least 1500 words (add substantial new sections if needed)
- Ensure at least 4-6 H2 headings and 2+ H3 subheadings
- Add lists, blockquotes, bold text wherever natural
- If FAQ section is missing or has fewer than 5 questions, add/expand it
- If Table of Contents is missing, add it
- Ensure ALL keyword placements are optimal`
  : `MODE: FIX SEO ISSUES — Fix ONLY the specific failing items listed below. Do NOT rewrite or change passing sections.`}

ISSUES TO FIX:
${issuesList}

${primaryKeyword ? `Primary keyword: "${primaryKeyword}"` : ""}

CRITICAL RULES:
1. Preserve all existing HTML structure, internal links, product embeds, and formatting that is already correct
2. Keep the same writing voice and tone
3. For content changes, return the FULL updated HTML content (not just changed parts)
4. For blockquotes, find the most impactful sentence and wrap it in <blockquote> tags
5. For keyword placement in first 100 words, naturally weave it into opening paragraph
6. Meta description must read naturally as a compelling search snippet`;

    const userPrompt = `Here is the current blog post data:

TITLE: ${blogData.title}
META TITLE: ${blogData.meta_title}
META DESCRIPTION: ${blogData.meta_description}
EXCERPT: ${blogData.excerpt}
SLUG: ${blogData.slug}

CONTENT:
${blogData.content}

Please apply the SEO updates.`;

    const tools = getStructuredToolSchema();
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    async function attemptLovable(): Promise<AttemptResult> {
      if (!LOVABLE_API_KEY) {
        return { ok: false, provider: "lovable", error: "Missing built-in AI key." };
      }

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          tools,
          tool_choice: { type: "function", function: { name: "apply_seo_updates" } },
          temperature: 0.3,
          max_tokens: 16000,
        }),
      });

      if (resp.status === 429) {
        return { ok: false, provider: "lovable", status: 429, error: "Rate limit exceeded. Please retry in a moment." };
      }
      if (resp.status === 402) {
        return { ok: false, provider: "lovable", status: 402, error: "Built-in AI credits are exhausted." };
      }

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Lovable AI error:", resp.status, errText);
        return { ok: false, provider: "lovable", status: resp.status, error: "Built-in AI request failed." };
      }

      const parsed = await parseOpenAiCompatibleResponse(resp);
      if (!isValidSeoPayload(parsed)) {
        return { ok: false, provider: "lovable", error: "Built-in AI returned invalid structured output." };
      }

      return { ok: true, data: parsed, provider: "lovable" };
    }

    async function attemptCustom(config: AiConfig): Promise<AttemptResult> {
      if (!config.api_key) {
        return { ok: false, provider: "custom", error: "Custom AI key missing." };
      }

      const provider = config.provider || "openai";
      const url = getProviderUrl(provider, config.endpoint);
      const model = config.model || getDefaultModel(provider);

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          tools,
          tool_choice: { type: "function", function: { name: "apply_seo_updates" } },
          temperature: 0.3,
          max_tokens: 16000,
        }),
      });

      if (resp.status === 429) {
        const errText = await resp.text();
        console.warn("Custom API error:", resp.status, errText);
        return { ok: false, provider: "custom", status: 429, error: "Custom AI provider is rate limited." };
      }
      if (resp.status === 402) {
        const errText = await resp.text();
        console.warn("Custom API error:", resp.status, errText);
        return { ok: false, provider: "custom", status: 402, error: "Custom AI provider billing/credits issue." };
      }
      if (!resp.ok) {
        const errText = await resp.text();
        console.warn("Custom API error:", resp.status, errText);
        return { ok: false, provider: "custom", status: resp.status, error: "Custom AI request failed." };
      }

      const parsed = await parseOpenAiCompatibleResponse(resp);
      if (!isValidSeoPayload(parsed)) {
        return { ok: false, provider: "custom", error: "Custom AI returned invalid structured output." };
      }

      return { ok: true, data: parsed, provider: "custom" };
    }

    const customConfig = await getCustomAiConfig();
    const priority = customConfig?.priority || "custom";

    const attempts: AttemptResult[] = [];

    if (priority === "custom" && customConfig?.api_key) {
      attempts.push(await attemptCustom(customConfig));
      if (!attempts[attempts.length - 1].ok) {
        attempts.push(await attemptLovable());
      }
    } else {
      attempts.push(await attemptLovable());
      if (!attempts[attempts.length - 1].ok && customConfig?.api_key) {
        attempts.push(await attemptCustom(customConfig));
      }
    }

    const success = attempts.find((a) => a.ok) as Extract<AttemptResult, { ok: true }> | undefined;
    if (success) {
      const usedFallback = attempts.length > 1;
      const providerLabel = success.provider === "custom" ? "Your API Key" : "Built-in AI";
      const responseData = {
        ...success.data,
        _provider: providerLabel,
        _fallback: usedFallback,
      };
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errors = attempts.filter((a) => !a.ok) as Extract<AttemptResult, { ok: false }>[];
    const has402 = errors.find((e) => e.status === 402);
    const has429 = errors.find((e) => e.status === 429);

    const status = has402 ? 402 : has429 ? 429 : 500;
    const message = has402
      ? "AI credits are exhausted. Add credits or switch provider in AI settings."
      : has429
        ? "AI is currently rate limited. Please retry in a minute."
        : "SEO optimization failed across all AI providers.";

    return new Response(
      JSON.stringify({
        error: message,
        details: errors.map((e) => `${e.provider}: ${e.error}`),
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Fix SEO error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
