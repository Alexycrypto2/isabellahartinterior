import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getCustomTextConfig() {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
    if (!data) return null;
    const val = data.value as Record<string, any>;
    const key = val.text_api_key || val.api_key;
    return {
      priority: val.priority || "custom",
      api_key: key || null,
      provider: val.text_provider || val.provider || "openai",
      model: val.text_model || val.model || "",
      endpoint: val.text_endpoint || "",
    };
  } catch (_e) { return null; }
}

async function callCustomText(cfg: any, systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!cfg?.api_key) return null;
  const provider = cfg.provider || "openai";
  if (provider === "anthropic") {
    const r = await fetch(cfg.endpoint || "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": cfg.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: cfg.model || "claude-sonnet-4-20250514", max_tokens: 800, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j.content?.[0]?.text?.trim() || null;
  }
  const url = provider === "google" && cfg.endpoint
    ? cfg.endpoint
    : provider === "custom" && cfg.endpoint
    ? cfg.endpoint
    : "https://api.openai.com/v1/chat/completions";
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.api_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model || (provider === "google" ? "gemini-2.0-flash" : "gpt-4o-mini"),
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.choices?.[0]?.message?.content?.trim() || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    
    if (body.healthCheck) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, description, category, price, type } = body;
    
    if (!title || !description) {
      return new Response(JSON.stringify({ error: "Title and description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const customCfg = await getCustomTextConfig();
    const priority = customCfg?.priority || "custom";
    const hasCustomKey = !!customCfg?.api_key;

    const systemPrompt = `You are a Pinterest marketing expert for Isabelle Hart Interiors, a home decor brand. Generate ONE perfect Pinterest pin description that will drive clicks and saves.

Rules:
- Maximum 500 characters total
- Start with an emotional hook that stops scrollers
- Include 3-5 relevant hashtags at the end
- Include a clear CTA (Shop now, Read more, Save for later, etc.)
- Use keywords naturally for Pinterest SEO
- Match the warm, elegant brand voice
- Make it feel aspirational and actionable
- Do NOT use markdown formatting, return plain text only`;

    const contentType = type === 'product' ? 'product' : 'blog post';
    const priceInfo = price ? ` Price: ${price}.` : '';
    const categoryInfo = category ? ` Category: ${category}.` : '';
    
    const userPrompt = `Generate a Pinterest pin description for this ${contentType}:
Title: ${title}
Description: ${description}${categoryInfo}${priceInfo}

Return ONLY the pin description text, nothing else. Max 500 characters.`;

    const callLovable = async (): Promise<string | null> => {
      if (!LOVABLE_API_KEY) return null;
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        }),
      });
      if (r.status === 429) throw Object.assign(new Error("Rate limit exceeded. Please try again in a moment."), { status: 429 });
      if (r.status === 402) { console.log("Lovable credits exhausted, will try custom key"); return null; }
      if (!r.ok) { console.error("AI gateway error:", r.status, await r.text()); return null; }
      const j = await r.json();
      return j.choices?.[0]?.message?.content?.trim() || null;
    };

    let pinDescription: string | null = null;
    try {
      if (priority === "custom" && hasCustomKey) {
        pinDescription = await callCustomText(customCfg, systemPrompt, userPrompt);
        if (!pinDescription) pinDescription = await callLovable();
      } else {
        pinDescription = await callLovable();
        if (!pinDescription && hasCustomKey) pinDescription = await callCustomText(customCfg, systemPrompt, userPrompt);
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }

    if (!pinDescription) {
      return new Response(JSON.stringify({
        error: "No AI provider available. Add your API key in Admin → Settings → AI API.",
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ pin_description: pinDescription.slice(0, 500) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Pin description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
