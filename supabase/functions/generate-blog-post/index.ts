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
    const { topic, tone, category, keywords, targetWordCount, section, room, style, articleFormat, availableCategories } = await req.json();
    const ROOMS = ["living-room","bedroom","kitchen","bathroom","dining","home-office","entryway","small-spaces","outdoor"];
    const STYLES = ["modern","minimalist","japandi","scandinavian","organic-modern","contemporary","traditional","quiet-luxury","warm-minimalism"];
    const SECTIONS = ["decor-ideas","rooms","style-guides"];
    const cats: string[] = Array.isArray(availableCategories) ? availableCategories : [];

    const wordCountTarget = Math.max(800, Math.min(3000, targetWordCount || 1500));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const baseUrl = "https://isabellehartinterior.store";

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

    const existingPosts = await getExistingPosts();

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

    const placementRef = `
EDITORIAL PLACEMENT (our site is an editorial home decor BLOG & media brand, NOT a store):
Sections: decor-ideas (inspiration & idea roundups — main Pinterest traffic engine), rooms (room-by-room library guides), style-guides (deep explanations of a design style).
Rooms (slugs): ${ROOMS.join(", ")}. Styles (slugs): ${STYLES.join(", ")}.
Blog categories available: ${cats.join(", ") || "any fitting name"}.
- Section: ${section && section !== "auto" ? `MUST be "${section}"` : "choose the best fit for the topic and search intent"}
- Room: ${room === "none" ? "return empty string" : room && room !== "auto" ? `MUST be "${room}"` : "choose the most relevant room slug, or empty string if none"}
- Style: ${style === "none" ? "return empty string" : style && style !== "auto" ? `MUST be "${style}"` : "choose the most relevant style slug, or empty string if none"}
- Category: ${category && category !== "auto" ? `MUST be "${category}"` : "choose the best matching category from the list"}
- Article format: ${articleFormat && articleFormat !== "auto" ? articleFormat : "choose the format that best matches what currently ranks for this query (listicle, how-to, ultimate-guide, style-explainer, comparison, mistakes)"}
Explain your placement choice in one sentence in recommendation_reason.`;

    const systemPrompt = `You are an elite SEO content strategist and professional copywriter for "Isabelle Hart Interiors", a premium home decor and interior design brand.

BRAND VOICE (ALWAYS APPLY — DO NOT DEVIATE):
- Tone: Warm, elegant, and conversational — like a trusted friend who happens to be an interior designer
- Target audience: Women 25-45 who want beautiful, affordable homes
- Language: Second person ("you"), encouraging, aspirational yet practical
- Avoid: Cold corporate language, overly technical jargon, condescending tone
- Channel: Think Joanna Gaines meets a best friend chat over coffee
- Sound like a respected interiors magazine editor (Architectural Digest meets a warm friend) — confident, specific, never salesy; avoid filler clichés

Your mission is to write blog posts that RANK ON PAGE 1 OF GOOGLE. Every post must follow proven SEO frameworks.

WRITING PRINCIPLES:
- Write at a Grade 6-8 reading level for maximum accessibility
- Use short paragraphs (2-3 sentences max) for mobile readability
- Open with a compelling hook that addresses the reader's pain point
- Include actionable, specific advice (not generic fluff)
- Use power words: "proven", "essential", "stunning", "transform", "effortless"

SEO STRUCTURE (MANDATORY):
- Title: Include primary keyword near the beginning, under 60 chars, use numbers or power words
- H2 headings: 4-6 per post, each containing secondary keywords naturally
- H3 subheadings: Use under H2s for detailed breakdowns
- First 100 words: Must contain the primary keyword naturally
- Content: Target exactly ${wordCountTarget} words (±10%), comprehensive enough to be the definitive resource
- Include a "Key Takeaways" or "Quick Tips" section with bullet points
- End with a strong call-to-action paragraph
- Use semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>

AUTO TABLE OF CONTENTS (MANDATORY):
- After the first introductory paragraph, insert a Table of Contents
- Use this exact HTML structure:
<div class="blog-toc" style="margin: 24px 0; padding: 20px; background: #f8f8f8; border-radius: 12px; border-left: 4px solid #c9a96e;">
  <p style="font-weight: 600; margin-bottom: 12px; font-size: 15px;">📋 In This Article</p>
  <ul style="list-style: none; padding: 0; margin: 0;">
    <li style="margin-bottom: 8px;"><a href="#section-slug" style="color: #c9a96e; text-decoration: none; font-size: 14px;">→ Heading Text</a></li>
  </ul>
</div>
- Add matching id attributes to each H2: <h2 id="section-slug">Heading Text</h2>
- Include ALL H2 headings in the TOC

FAQ SECTION (MANDATORY — ALWAYS AT THE END):
- Generate 5-7 FAQ questions based on what people actually search about this topic
- Use "People Also Ask" style questions (how, what, why, can, does, is)
- Place after the main content, before the CTA paragraph
- Use this exact HTML structure:
<div class="blog-faq" style="margin: 32px 0; padding: 24px; background: #fafaf8; border-radius: 12px;">
  <h2 id="frequently-asked-questions">Frequently Asked Questions</h2>
  <div class="faq-item" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
    <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Question text?</h3>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Answer text (2-3 sentences, concise and helpful).</p>
  </div>
</div>

AUTOMATIC ALT TEXT (MANDATORY):
- Every <img> tag MUST have a descriptive, SEO-friendly alt attribute
- Alt text format: "[Product/Item name] - [brief description] for [room type] [style keyword]"
- Example: alt="Boho macrame wall hanging - handcrafted cotton decor for living room bohemian styling"
- Never use generic alt text like "image" or "photo" or leave alt empty

META SEO RULES:
- Meta Title: Primary keyword + benefit/number, exactly 50-60 chars
- Meta Description: Include keyword, a benefit, and a CTA. Exactly 140-155 chars
- Slug: Short, keyword-rich, 3-5 words max

IMAGE PROMPT RULES:
- Describe a photorealistic interior design scene that matches the topic
- Specify: room type, lighting (natural golden hour preferred), camera angle, color palette, styling details
- Always include: "editorial interior design photography, high-end magazine quality, 4K, shallow depth of field"
${internalLinksRef}
${placementRef}

COMPETITOR RESEARCH APPROACH:
Before writing, reason about the search intent and the top 10 Google results for "${topic}". Your content MUST:
- Demonstrate E-E-A-T: first-hand styling experience, designer reasoning ("why this works"), precise measurements, materials, colour names and proportions
- Answer the core query directly in the first 2-3 sentences (featured-snippet ready), then go deep
- Use descriptive, scannable H2/H3s that mirror real searches and long-tail variations
- Include at least one comparison table or step list where useful, plus a short "Designer's note" blockquote
- Cover budget, renters/small-space, and mistakes-to-avoid angles where relevant
- Cover every angle competitors would cover PLUS unique insights they miss
- Include more specific, actionable advice than typical articles
- Add unique value: expert tips, cost breakdowns, before/after scenarios, seasonal considerations
- Be more comprehensive and better structured than any existing article on this topic
- Address common misconceptions and provide nuanced answers
- Give specific measurements and approximate price ranges as guidance only

CONTENT FOCUS (STRICT): This is an editorial article, not a sales page. Do NOT embed products, product cards, "Shop" buttons, Amazon or affiliate links. Do not push readers to buy. Mention generic item types (e.g. "a linen throw") only as styling advice. The only links allowed are internal links to our own articles.

You MUST return structured data using the "generate_blog_post" tool.`;

    const userPrompt = `Write a comprehensive, Google-ranking blog post about: "${topic}"
${tone ? `Tone: ${tone} (but ALWAYS maintain the warm, elegant Isabelle Hart Interiors brand voice underneath)` : ""}
${category ? `Category: ${category}` : ""}
${keywords ? `Primary and secondary keywords to target: ${keywords}` : ""}
Target word count: ${wordCountTarget} words

IMPORTANT REQUIREMENTS:
1. Include a Table of Contents after the intro paragraph with anchor links to all H2s
2. Include 5-7 FAQ questions at the end in proper FAQ markup
3. Cover this topic more comprehensively than any competitor — add unique angles, specific tips, and expert insights
4. Every image must have descriptive, keyword-rich alt text
5. Maintain warm, conversational brand voice throughout (audience: women 25-45 who want beautiful affordable homes)
6. Do NOT promote or link to any products — focus 100% on teaching and inspiring around the topic
7. The content should feel like advice from a trusted friend, not a corporate blog`;

    const toolsDef = [
      {
        type: "function",
        function: {
          name: "generate_blog_post",
          description: "Generate a complete SEO-optimized editorial blog post with FAQ schema, table of contents and editorial placement",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Blog post title, under 60 chars" },
              slug: { type: "string", description: "URL-friendly slug derived from title, lowercase with hyphens" },
              excerpt: { type: "string", description: "1-2 sentence summary, plain text, no HTML" },
              content: { type: "string", description: `Full blog post in semantic HTML. Target ${wordCountTarget} words. MUST include: 1) Table of Contents after intro, 2) H2 headings with id attributes, 3) Internal links to our articles (no product embeds or affiliate links), 4) FAQ section at the end with 5-7 questions, 5) Descriptive alt text on ALL images, 6) Key Takeaways section, 7) CTA paragraph.` },
              meta_title: { type: "string", description: "SEO meta title, under 60 chars" },
              meta_description: { type: "string", description: "SEO meta description, under 160 chars" },
              read_time: { type: "string", description: 'Estimated read time, e.g. "5 min read"' },
              image_prompt: { type: "string", description: "Detailed prompt for generating a featured image" },
              faq_schema: {
                type: "array",
                description: "Array of FAQ items for JSON-LD schema markup",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string", description: "The FAQ question" },
                    answer: { type: "string", description: "The FAQ answer, plain text" },
                  },
                  required: ["question", "answer"],
                  additionalProperties: false,
                },
              },
              featured_image_alt: { type: "string", description: "SEO-friendly alt text for the featured image, descriptive and keyword-rich" },
              section: { type: "string", description: "decor-ideas, rooms or style-guides" },
              category: { type: "string", description: "Blog category name" },
              room: { type: "string", description: "Room slug or empty string" },
              style: { type: "string", description: "Style slug or empty string" },
              recommendation_reason: { type: "string", description: "One sentence on why this placement fits" },
              pinterest_title: { type: "string", description: "Clickable Pinterest pin title under 100 chars" },
              pinterest_description: { type: "string", description: "Natural Pinterest description, 200-400 chars, keyword-rich" },
              newsletter_cta: { type: "string", description: "Short newsletter invitation tied to the topic" },
            },
            required: ["section", "category", "room", "style", "recommendation_reason", "pinterest_title", "pinterest_description", "newsletter_cta", "title", "slug", "excerpt", "content", "meta_title", "meta_description", "read_time", "image_prompt", "faq_schema", "featured_image_alt"],
            additionalProperties: false,
          },
        },
      },
    ];

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Determine AI priority
    const customConfig = await getCustomAiConfig();
    const priority = customConfig?.priority || "custom";
    const hasCustomKey = customConfig?.api_key;

    async function callLovable() {
      if (!LOVABLE_API_KEY) return null;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
      });
      if (resp.status === 429) {
        throw { status: 429, message: "Rate limit exceeded. Please try again in a moment." };
      }
      if (resp.status === 402) {
        console.log("Lovable AI credits exhausted");
        return null;
      }
      if (!resp.ok) return null;
      return resp;
    }

    async function callCustom() {
      if (!hasCustomKey) return null;
      const provider = customConfig.provider || "openai";
      const model = customConfig.model || getDefaultModel(provider);
      const url = getProviderUrl(provider, customConfig.endpoint);

      if (provider === "anthropic") {
        const anthropicResp = await fetch(url, {
          method: "POST",
          headers: { "x-api-key": customConfig.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
          body: JSON.stringify({
            model, max_tokens: 8192, system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            tools: toolsDef.map(t => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters })),
            tool_choice: { type: "tool", name: "generate_blog_post" },
          }),
        });
        if (!anthropicResp.ok) return null;
        const anthropicData = await anthropicResp.json();
        const toolUse = anthropicData.content?.find((b: any) => b.type === "tool_use");
        if (!toolUse) return null;
        return { anthropicResult: toolUse.input };
      }

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${customConfig.api_key}` },
        body: JSON.stringify({ model, messages, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
      });
      if (!resp.ok) return null;
      return resp;
    }

    let response: Response | null = null;
    let anthropicDirect: any = null;

    try {
      if (priority === "custom" && hasCustomKey) {
        // Custom first, Lovable fallback
        const customResult = await callCustom();
        if (customResult && 'anthropicResult' in customResult) {
          anthropicDirect = customResult.anthropicResult;
        } else if (customResult) {
          response = customResult as Response;
        } else {
          response = await callLovable();
        }
      } else {
        // Lovable first, custom fallback
        response = await callLovable();
        if (!response) {
          const customResult = await callCustom();
          if (customResult && 'anthropicResult' in customResult) {
            anthropicDirect = customResult.anthropicResult;
          } else if (customResult) {
            response = customResult as Response;
          }
        }
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    if (anthropicDirect) {
      return new Response(JSON.stringify(anthropicDirect), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response || !response.ok) {
      return new Response(JSON.stringify({
        error: "No AI provider available. Configure an API key in Admin → Settings → AI API tab.",
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    if (!SECTIONS.includes(blogPost.section)) blogPost.section = section && section !== "auto" ? section : "decor-ideas";
    if (!ROOMS.includes(blogPost.room)) blogPost.room = "";
    if (!STYLES.includes(blogPost.style)) blogPost.style = "";
    // Strip any affiliate/Amazon links the model might still add
    blogPost.content = String(blogPost.content || "")
      .replace(/<div class="product-embed"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, "")
      .replace(/<a [^>]*href="[^"]*(amazon\.|amzn\.)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$2");

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
