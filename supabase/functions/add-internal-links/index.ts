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
    const { content, currentSlug, mode } = await req.json();
    // mode: "links" (default) | "products" | "both"
    const activeMode = mode || "links";

    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const baseUrl = "https://roomeefine.lovable.app";

    // Fetch posts and products in parallel
    const [postsResult, productsResult] = await Promise.all([
      supabase.from("blog_posts").select("title, slug, category, excerpt").eq("published", true).order("created_at", { ascending: false }).limit(50),
      supabase.from("products").select("name, slug, price, original_price, image_url, affiliate_url, category, badge, rating, reviews").eq("is_active", true).order("is_featured", { ascending: false }).limit(40),
    ]);

    const existingPosts = (postsResult.data || []).filter(p => p.slug !== currentSlug);
    const products = productsResult.data || [];

    // Build internal links section
    const internalLinksSection = (activeMode === "links" || activeMode === "both") && existingPosts.length > 0
      ? `\nINTERNAL LINKS — Add 3-5 internal links:
EXISTING BLOG POSTS:
${existingPosts.map(p => `- "${p.title}" (${p.category}) → ${baseUrl}/blog/${p.slug}`).join("\n")}

LINK RULES:
- Use <a href="URL">descriptive anchor text</a>
- Insert naturally within existing sentences
- Space throughout content, don't cluster
- Only link genuinely related posts
- Don't link already-linked posts`
      : "";

    const productSection = (activeMode === "products" || activeMode === "both") && products.length > 0
      ? `\nPRODUCT EMBEDS — Insert 2-4 product cards inline where the content mentions that type of product:

PRODUCT EMBED FORMAT (use this exact HTML):
<div class="product-embed" style="margin: 24px 0; padding: 16px; border: 1px solid #e5e5e5; border-radius: 12px; display: flex; align-items: center; gap: 16px; background: #fafafa;">
  <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="flex-shrink: 0;">
    <img src="IMAGE_URL" alt="PRODUCT_NAME" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;" />
  </a>
  <div>
    <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="font-weight: 600; font-size: 16px; color: #1a1a1a; text-decoration: none;">PRODUCT_NAME</a>
    <div style="margin-top: 4px; font-size: 14px; color: #666;">PRICE · ⭐ RATING (REVIEWS reviews)</div>
    <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; margin-top: 8px; padding: 6px 16px; background: #1a1a1a; color: #fff; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 500;">Shop on Amazon →</a>
  </div>
</div>

ALSO: Link the first mention of each product keyword in surrounding text to its affiliate URL.

AVAILABLE PRODUCTS:
${products.map(p => `- "${p.name}" | ${p.category} | ${p.price}${p.original_price ? ` (was ${p.original_price})` : ""} | Rating: ${p.rating || "N/A"} (${p.reviews || 0}) | Image: ${p.image_url || "none"} | Link: ${p.affiliate_url}`).join("\n")}

PRODUCT RULES:
- Match products to what the content discusses (lamp → embed lamp product, etc.)
- Place embeds AFTER paragraphs that mention the product type
- Don't cluster all embeds together — spread them naturally
- Use EXACT affiliate_url and image_url from the catalog`
      : "";

    if (!internalLinksSection && !productSection) {
      return new Response(JSON.stringify({ content, linksAdded: 0, productsAdded: 0, message: "No posts or products available to add." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an SEO and monetization specialist. Your task is to enhance an existing blog post by adding content WITHOUT removing or rewriting anything.
${internalLinksSection}
${productSection}

CRITICAL RULES:
- Do NOT remove, rewrite, or alter any existing content
- ONLY add links and/or product embeds
- Return ONLY the modified HTML content — no explanations`;

    const userPrompt = `Enhance this blog post content. Return only the modified HTML:\n\n${content}`;

    // AI config helper
    async function getCustomAiConfig() {
      try {
        const { data } = await supabase.from("site_settings").select("value").eq("key", "ai_api").single();
        if (data?.value) {
          const val = data.value as any;
          const key = val.text_api_key || val.api_key;
          if (key) return { provider: val.text_provider || val.provider || "openai", api_key: key, model: val.text_model || val.model, endpoint: val.text_endpoint };
        }
      } catch {}
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

    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) { console.log("Credits exhausted, trying fallback..."); response = null; }
    }

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
          const linksAdded = Math.max(0, (modifiedContent.match(/<a href=/g) || []).length - (content.match(/<a href=/g) || []).length);
          const productsAdded = (modifiedContent.match(/class="product-embed"/g) || []).length - (content.match(/class="product-embed"/g) || []).length;
          return new Response(JSON.stringify({ content: modifiedContent, linksAdded, productsAdded: Math.max(0, productsAdded) }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        response = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${customConfig.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages }),
        });
      } else if (!response || response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add API key in Settings → AI API." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      console.error("AI error:", response!.status, errorText);
      throw new Error("AI error");
    }

    const data = await response!.json();
    const modifiedContent = data.choices?.[0]?.message?.content || content;

    const originalLinkCount = (content.match(/<a href=/g) || []).length;
    const newLinkCount = (modifiedContent.match(/<a href=/g) || []).length;
    const linksAdded = Math.max(0, newLinkCount - originalLinkCount);
    const originalProductCount = (content.match(/class="product-embed"/g) || []).length;
    const newProductCount = (modifiedContent.match(/class="product-embed"/g) || []).length;
    const productsAdded = Math.max(0, newProductCount - originalProductCount);

    return new Response(JSON.stringify({ content: modifiedContent, linksAdded, productsAdded }), {
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
