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
    const { content, currentSlug } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Fetch existing published posts
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("title, slug, category, excerpt")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    const existingPosts = (posts || []).filter(p => p.slug !== currentSlug);

    if (existingPosts.length === 0) {
      return new Response(JSON.stringify({ content, linksAdded: 0, message: "No other published posts to link to yet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = "https://roomeefine.lovable.app";

    const systemPrompt = `You are an SEO specialist. Your task is to add internal links to an existing blog post.

EXISTING BLOG POSTS ON THE SITE:
${existingPosts.map(p => `- "${p.title}" (Category: ${p.category}) → ${baseUrl}/blog/${p.slug}`).join("\n")}

RULES:
1. Add 3-5 internal links to the content where they fit naturally
2. Use HTML anchor tags: <a href="URL">descriptive anchor text</a>
3. Use descriptive anchor text with relevant keywords — never "click here"
4. Insert links naturally within existing sentences or add brief transitional phrases
5. Space links throughout the content — don't cluster them in one section
6. Only link to posts that are genuinely related to the surrounding context
7. Do NOT remove, rewrite, or alter any existing content — only add links
8. Do NOT add links to posts that are already linked in the content
9. Return ONLY the modified HTML content — no explanations or wrapper text`;

    const userPrompt = `Add internal links to this blog post content. Return only the modified HTML:\n\n${content}`;

    // Fetch custom AI config for fallback
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
            };
          }
        }
      } catch { /* no config */ }
      return null;
    }

    function getProviderUrl(provider: string, customEndpoint?: string) {
      if (provider === "custom" && customEndpoint) return customEndpoint;
      switch (provider) {
        case "openai": return "https://api.openai.com/v1/chat/completions";
        case "google": return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        case "anthropic": return "https://api.anthropic.com/v1/messages";
        default: return "https://api.openai.com/v1/chat/completions";
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    let response: Response | null = null;

    // Try Lovable AI first
    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        console.log("Credits exhausted, trying fallback...");
        response = null;
      }
    }

    // Fallback
    if (!response || !response.ok) {
      const customConfig = await getCustomAiConfig();
      if (customConfig) {
        const provider = customConfig.provider || "openai";
        const model = customConfig.model || (provider === "openai" ? "gpt-4o-mini" : provider === "google" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514");
        const url = getProviderUrl(provider, customConfig.endpoint);

        if (provider === "anthropic") {
          const resp = await fetch(url, {
            method: "POST",
            headers: { "x-api-key": customConfig.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
            body: JSON.stringify({ model, max_tokens: 8192, system: systemPrompt, messages: [{ role: "user", content: userPrompt }] }),
          });
          if (!resp.ok) throw new Error("Fallback AI error");
          const data = await resp.json();
          const modifiedContent = data.content?.[0]?.text || content;
          const linksAdded = (modifiedContent.match(/<a href=/g) || []).length - (content.match(/<a href=/g) || []).length;
          return new Response(JSON.stringify({ content: modifiedContent, linksAdded: Math.max(0, linksAdded) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        response = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${customConfig.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages }),
        });
      } else if (!response || response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add API key in Settings → AI API." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      console.error("AI error:", response!.status, errorText);
      throw new Error("AI error");
    }

    const data = await response!.json();
    const modifiedContent = data.choices?.[0]?.message?.content || content;

    // Count new links added
    const originalLinkCount = (content.match(/<a href=/g) || []).length;
    const newLinkCount = (modifiedContent.match(/<a href=/g) || []).length;
    const linksAdded = Math.max(0, newLinkCount - originalLinkCount);

    return new Response(JSON.stringify({ content: modifiedContent, linksAdded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("add-internal-links error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
