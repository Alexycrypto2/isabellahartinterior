import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blogData, failedChecks, mode, keywords } = await req.json();
    // mode: "fix" = only fix red items, "optimize" = fix red + improve yellow to push score to 90+

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check custom AI config for priority
    async function getCustomAiConfig() {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "ai_api")
          .single();
        if (data?.value) {
          const val = data.value as any;
          const key = val.text_api_key || val.api_key;
          if (key) {
            return {
              provider: val.text_provider || val.provider || "openai",
              api_key: key,
              model: val.text_model || val.model,
              endpoint: val.text_endpoint,
              priority: val.priority || "custom",
            };
          }
          return { priority: val.priority || "custom" } as any;
        }
      } catch {}
      return null;
    }

    function getProviderUrl(provider: string, customEndpoint?: string) {
      if (provider === "custom" && customEndpoint) return customEndpoint;
      switch (provider) {
        case "openai": return "https://api.openai.com/v1/chat/completions";
        case "google": return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        default: return "https://api.openai.com/v1/chat/completions";
      }
    }

    function getDefaultModel(provider: string) {
      switch (provider) {
        case "openai": return "gpt-4o-mini";
        case "google": return "gemini-2.0-flash";
        default: return "gpt-4o-mini";
      }
    }

    const issuesList = failedChecks.map((c: any) => `- ${c.label}: ${c.fix || "Needs fixing"}`).join("\n");

    const primaryKeyword = keywords ? keywords.split(",")[0].trim() : "";

    const systemPrompt = `You are an expert SEO content optimizer. You will receive a blog post and a list of SEO issues to fix.

${mode === "optimize" ? `MODE: AUTO-OPTIMIZE — Fix ALL issues AND improve everything to achieve a 90+ SEO score. Be aggressive about improvements:
- Ensure meta description is exactly 145-155 characters
- Ensure title is exactly 50-60 characters
- Ensure word count is at least 1500 words (add substantial new sections if needed)
- Ensure at least 4-6 H2 headings and 2+ H3 subheadings
- Add lists, blockquotes, bold text wherever natural
- If FAQ section is missing or has fewer than 5 questions, add/expand it
- If Table of Contents is missing, add it
- Ensure ALL keyword placements are optimal` : `MODE: FIX SEO ISSUES — Fix ONLY the specific failing items listed below. Do NOT rewrite or change passing sections.`}

ISSUES TO FIX:
${issuesList}

${primaryKeyword ? `Primary keyword: "${primaryKeyword}"` : ""}

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code fences
2. Preserve all existing HTML structure, internal links, product embeds, and formatting that is already correct
3. Keep the same writing voice and tone
4. For content changes, return the FULL updated HTML content (not just the changed parts)
5. For blockquotes, find the most impactful sentence and wrap it in <blockquote> tags
6. For keyword placement in first 100 words, naturally weave it into the opening paragraph
7. For word count issues, add a genuinely useful new section with H2 heading
8. Meta description must read naturally as a compelling search snippet

Return JSON with these fields (include ALL fields even if unchanged):
{
  "title": "...",
  "meta_title": "...",
  "meta_description": "...",
  "excerpt": "...",
  "content": "... full HTML content ...",
  "slug": "...",
  "fixes_applied": ["description of each fix applied"]
}`;

    const userPrompt = `Here is the current blog post data:

TITLE: ${blogData.title}
META TITLE: ${blogData.meta_title}
META DESCRIPTION: ${blogData.meta_description}
EXCERPT: ${blogData.excerpt}
SLUG: ${blogData.slug}

CONTENT:
${blogData.content}

Please fix the issues listed above and return the corrected JSON.`;

    const customConfig = await getCustomAiConfig();
    let result: any = null;

    // Try custom API first if priority is "custom"
    if (customConfig?.priority === "custom" && customConfig?.api_key) {
      try {
        const url = getProviderUrl(customConfig.provider, customConfig.endpoint);
        const model = customConfig.model || getDefaultModel(customConfig.provider);
        const headers: Record<string, string> = { "Content-Type": "application/json" };

        if (customConfig.provider === "google") {
          headers["Authorization"] = `Bearer ${customConfig.api_key}`;
        } else {
          headers["Authorization"] = `Bearer ${customConfig.api_key}`;
        }

        const resp = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 16000,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            result = JSON.parse(cleaned);
          }
        } else {
          const errText = await resp.text();
          console.warn("Custom API error:", resp.status, errText);
        }
      } catch (e) {
        console.warn("Custom API failed, falling back:", e);
      }
    }

    // Fallback to Lovable AI
    if (!result && LOVABLE_API_KEY) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 8000,
          }),
        });

        if (resp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (resp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds or switch to your own API key in settings." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            result = JSON.parse(cleaned);
          }
        }
      } catch (e) {
        console.error("Lovable AI failed:", e);
      }
    }

    // Try custom API as fallback if Lovable was primary
    if (!result && customConfig?.priority !== "custom" && customConfig?.api_key) {
      try {
        const url = getProviderUrl(customConfig.provider, customConfig.endpoint);
        const model = customConfig.model || getDefaultModel(customConfig.provider);

        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${customConfig.api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 8000,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
            result = JSON.parse(cleaned);
          }
        }
      } catch (e) {
        console.error("Custom API fallback failed:", e);
      }
    }

    if (!result) {
      throw new Error("All AI providers failed. Please check your API configuration.");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fix SEO error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
