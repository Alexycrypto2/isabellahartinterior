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
    const { topic, tone, category, keywords } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const baseUrl = "https://roomeefine.lovable.app";

    // Fetch existing published blog posts for internal linking
    async function getExistingPosts() {
      try {
        const { data } = await supabase
          .from("blog_posts")
          .select("title, slug, category, excerpt")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(50);
        return data || [];
      } catch { return []; }
    }

    // Fetch active products for inline embedding
    async function getProducts() {
      try {
        const { data } = await supabase
          .from("products")
          .select("name, slug, price, original_price, image_url, affiliate_url, category, badge, rating, reviews")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .limit(40);
        return data || [];
      } catch { return []; }
    }

    const [existingPosts, products] = await Promise.all([getExistingPosts(), getProducts()]);

    // Fetch custom AI API settings from site_settings
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
      } catch { /* no custom config */ }
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

    function getDefaultModel(provider: string) {
      switch (provider) {
        case "openai": return "gpt-4o-mini";
        case "google": return "gemini-2.0-flash";
        case "anthropic": return "claude-sonnet-4-20250514";
        default: return "gpt-4o-mini";
      }
    }

    // Build internal links reference for AI
    const internalLinksRef = existingPosts.length > 0
      ? `\n\nINTERNAL LINKING (CRITICAL FOR SEO):
You MUST include 3-5 internal links to existing blog posts where relevant. Use actual HTML anchor tags with the full URL.

EXISTING BLOG POSTS ON THE SITE:
${existingPosts.map(p => `- "${p.title}" (Category: ${p.category}) → ${baseUrl}/blog/${p.slug}`).join("\n")}

INTERNAL LINKING RULES:
- Insert links naturally within paragraphs — never list them separately
- Use descriptive anchor text (not "click here") that includes relevant keywords
- Link to posts in the same or related categories first
- Space links throughout the content — don't cluster them
- Format: <a href="${baseUrl}/blog/slug">descriptive anchor text</a>
- Example: "For more tips, check out our guide on <a href="${baseUrl}/blog/hygge-styling">creating a hygge-inspired living space</a>."`
      : "";

    // Build product embedding reference for AI
    const productEmbedRef = products.length > 0
      ? `\n\nINLINE PRODUCT EMBEDS (CRITICAL — THIS IS WHAT MAKES OUR BLOG MONETIZABLE):
When you mention a product type (e.g., lamp, rug, throw pillow, bookshelf), you MUST embed the matching product from our catalog inline in the content.

PRODUCT EMBED FORMAT — use this exact HTML structure:
<div class="product-embed" style="margin: 24px 0; padding: 16px; border: 1px solid #e5e5e5; border-radius: 12px; display: flex; align-items: center; gap: 16px; background: #fafafa;">
  <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="flex-shrink: 0;">
    <img src="IMAGE_URL" alt="PRODUCT_NAME" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;" />
  </a>
  <div>
    <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="font-weight: 600; font-size: 16px; color: #1a1a1a; text-decoration: none;">PRODUCT_NAME</a>
    <div style="margin-top: 4px; font-size: 14px; color: #666;">PRICE${" · "}⭐ RATING (REVIEWS reviews)</div>
    <a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow" style="display: inline-block; margin-top: 8px; padding: 6px 16px; background: #1a1a1a; color: #fff; border-radius: 20px; font-size: 13px; text-decoration: none; font-weight: 500;">Shop on Amazon →</a>
  </div>
</div>

ALSO: When you first mention a product keyword (like "lamp" or "throw blanket") in a paragraph, link that WORD directly to the affiliate URL:
<a href="AFFILIATE_URL" target="_blank" rel="noopener noreferrer nofollow">product keyword</a>

AVAILABLE PRODUCTS FROM OUR CATALOG:
${products.map(p => `- "${p.name}" | Category: ${p.category} | Price: ${p.price}${p.original_price ? ` (was ${p.original_price})` : ""} | Rating: ${p.rating || "N/A"} (${p.reviews || 0} reviews) | Image: ${p.image_url || "none"} | Affiliate: ${p.affiliate_url}`).join("\n")}

PRODUCT EMBED RULES:
- Embed 2-4 products throughout the article, placed naturally after paragraphs that mention the product type
- Match products to what you're discussing (e.g., talking about lighting → embed a lamp product)
- NEVER embed products in a list at the end — they must be woven into the content
- Also hyperlink the first mention of each product keyword in your text to its affiliate URL
- Each embed must use the EXACT affiliate_url and image_url from the catalog above`
      : ""
    ;

    const systemPrompt = `You are an elite SEO content strategist and professional copywriter for "RoomRefine", a premium home decor and interior design brand.

Your mission is to write blog posts that RANK ON PAGE 1 OF GOOGLE. Every post must follow proven SEO frameworks.

WRITING PRINCIPLES:
- Write at a Grade 8 reading level for maximum accessibility
- Use short paragraphs (2-3 sentences max) for mobile readability
- Open with a compelling hook that addresses the reader's pain point
- Include actionable, specific advice (not generic fluff)
- Use power words: "proven", "essential", "stunning", "transform", "effortless"
- Write in second person ("you") to create personal connection

SEO STRUCTURE (MANDATORY):
- Title: Include primary keyword near the beginning, under 60 chars, use numbers or power words
- H2 headings: 4-6 per post, each containing secondary keywords naturally
- H3 subheadings: Use under H2s for detailed breakdowns
- First 100 words: Must contain the primary keyword naturally
- Content: 1200-2000 words, comprehensive enough to be the definitive resource
- Include a "Key Takeaways" or "Quick Tips" section with bullet points
- End with a strong call-to-action paragraph
- Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>

META SEO RULES:
- Meta Title: Primary keyword + benefit/number, exactly 50-60 chars
- Meta Description: Include keyword, a benefit, and a CTA. Exactly 140-155 chars
- Slug: Short, keyword-rich, 3-5 words max

IMAGE PROMPT RULES:
- Describe a photorealistic interior design scene that matches the topic
- Specify: room type, lighting (natural golden hour preferred), camera angle, color palette, styling details
- Always include: "editorial interior design photography, high-end magazine quality, 4K, shallow depth of field"
${internalLinksRef}
${productEmbedRef}

You MUST return structured data using the "generate_blog_post" tool.`;

    const userPrompt = `Write a comprehensive, Google-ranking blog post about: "${topic}"
${tone ? `Tone: ${tone}` : ""}
${category ? `Category: ${category}` : ""}
${keywords ? `Primary and secondary keywords to target: ${keywords}` : ""}

Remember: This post should be the BEST resource on this topic. Make it comprehensive, actionable, and optimized to outrank competitors. MOST IMPORTANTLY: embed real product images and affiliate links inline when mentioning product types.`;

    const toolsDef = [
      {
        type: "function",
        function: {
          name: "generate_blog_post",
          description: "Generate a complete SEO-optimized blog post with inline product embeds",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Blog post title, under 60 chars" },
              slug: { type: "string", description: "URL-friendly slug derived from title, lowercase with hyphens" },
              excerpt: { type: "string", description: "1-2 sentence summary, plain text, no HTML" },
              content: { type: "string", description: "Full blog post in semantic HTML (h2, h3, p, ul/li, strong, em, blockquote). 1200-2000 words. MUST include inline product embeds with images and affiliate links where products are mentioned. Include Key Takeaways section and CTA." },
              meta_title: { type: "string", description: "SEO meta title, under 60 chars" },
              meta_description: { type: "string", description: "SEO meta description, under 160 chars" },
              read_time: { type: "string", description: 'Estimated read time, e.g. "5 min read"' },
              image_prompt: { type: "string", description: "Detailed prompt for generating a featured image" },
            },
            required: ["title", "slug", "excerpt", "content", "meta_title", "meta_description", "read_time", "image_prompt"],
            additionalProperties: false,
          },
        },
      },
    ];

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Try Lovable AI first
    let response: Response | null = null;

    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        console.log("Lovable AI credits exhausted, trying custom API key fallback...");
        response = null;
      }
    }

    // Fallback to custom API key
    if (!response || !response.ok) {
      const customConfig = await getCustomAiConfig();
      if (customConfig) {
        const provider = customConfig.provider || "openai";
        const model = customConfig.model || getDefaultModel(provider);
        const url = getProviderUrl(provider, customConfig.endpoint);

        if (provider === "anthropic") {
          const anthropicResp = await fetch(url, {
            method: "POST",
            headers: {
              "x-api-key": customConfig.api_key,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              max_tokens: 8192,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
              tools: toolsDef.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })),
              tool_choice: { type: "tool", name: "generate_blog_post" },
            }),
          });

          if (!anthropicResp.ok) {
            const errText = await anthropicResp.text();
            console.error("Anthropic fallback error:", anthropicResp.status, errText);
            throw new Error("Fallback AI provider error");
          }

          const anthropicData = await anthropicResp.json();
          const toolUse = anthropicData.content?.find((b: any) => b.type === "tool_use");
          if (!toolUse) throw new Error("Anthropic did not return tool result");

          return new Response(JSON.stringify(toolUse.input), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // OpenAI / Google (OpenAI-compatible)
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${customConfig.api_key}`,
        };

        response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ model, messages, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
        });
      } else if (!response || response.status === 402) {
        return new Response(JSON.stringify({
          error: "AI credits exhausted. Add your own API key in Admin → Settings → AI API tab as a fallback.",
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      console.error("AI error:", response!.status, errorText);
      throw new Error(`AI error: ${response!.status}`);
    }

    const data = await response!.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_blog_post") {
      throw new Error("AI did not return structured blog data");
    }

    const blogPost = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(blogPost), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-blog-post error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
