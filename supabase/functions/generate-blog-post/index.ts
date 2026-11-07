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
    const { topic, tone, category, keywords, targetWordCount, section, room, style, articleFormat, availableCategories, existingContent, products } = await req.json();
    const ROOMS = ["living-room","bedroom","kitchen","bathroom","dining","home-office","entryway","small-spaces","outdoor"];
    const STYLES = ["modern","minimalist","japandi","scandinavian","organic-modern","contemporary","traditional","quiet-luxury","warm-minimalism"];
    const SECTIONS = ["decor-ideas","rooms","style-guides"];
    const cats: string[] = Array.isArray(availableCategories) ? availableCategories : [];

    // Rank #1 floor: never generate thin articles
    const wordCountTarget = Math.max(1800, Math.min(2800, targetWordCount || 2000));
    const MIN_WORDS = 1200;
    const countWords = (html: string) => String(html || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const baseUrl = "https://isabellehartinteriors.com";

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

    const MONEY = ["product-roundup", "buying-guide", "comparison", "gift-guide"];
    const isMoney = MONEY.includes(articleFormat);
    const withTag = (u: string) => { try { const x = new URL(u); if (/amazon\./.test(x.hostname)) x.searchParams.set("tag", "roomrefine-20"); return x.toString(); } catch { return u; } };
    const productList = (Array.isArray(products) ? products : []).slice(0, 15).map((p: any) => ({
      name: String(p.name || "").slice(0, 200),
      price: String(p.price || "").slice(0, 40),
      image_url: String(p.image_url || ""),
      url: withTag(p.affiliate_url || `https://www.amazon.com/s?k=${encodeURIComponent(p.search_query || p.name || "")}`),
      rating: p.rating || "",
      why: String(p.why || "").slice(0, 200),
    })).filter((p: any) => p.name);

    const FORMAT_BLUEPRINTS: Record<string, string> = {
      "idea-roundup": `IDEA ROUNDUP (Pinterest traffic engine): Title starts with a number ("25 Small Living Room Ideas…"). After the cheat sheet, write that many numbered ideas as H2s ("1. Idea name"). Each idea: 90-150 words — what it is, why it works, how to copy it (measurement/colour/material), plus a one-line "Steal this:" tip. Group nothing; keep it scannable. Then Mistakes + FAQ.`,
      "product-roundup": `PRODUCT ROUNDUP (affiliate money post): Intro + "How we chose" (criteria: price, reviews, materials, size, style). Then a quick "At a glance" table (Award | Product | Price). Then one H2 per product using the PRODUCT CARD HTML below, followed by 120-200 words: who it's for, what we like, what to know, styling tip. Award badges like "Best Overall", "Best Budget", "Best for Small Spaces", "Splurge Pick". End with a buying-guide H2 (what to look for) + FAQ.`,
      "room-guide": `ROOM-BY-ROOM GUIDE: Organise by zones of the room (layout, lighting, textiles, storage, decor, colour). Include a layout/measurement table (clearances in inches and cm). Designer's notes, budget tiers, renter options.`,
      "seasonal": `SEASONAL / HOLIDAY DECOR: Numbered ideas grouped by room or area (entryway, mantel, table, living room, outdoor). Include a "Timeline: when to start" box, a budget/no-buy section using things already at home, and how to transition decor after the season. Respect cultural accuracy (e.g. Ramadan, Eid, Christmas).`,
      "buying-guide": `BUYING GUIDE (How to choose X): Answer in the first 2 sentences. Include a sizing/spec cheat table (e.g. rug sizes per room, lamp heights, curtain lengths) with inches and cm, step-by-step decision process, materials compared (pros/cons table), budget tiers, mistakes. If products are supplied, add "Our top picks" using PRODUCT CARDS.`,
      "comparison": `COMPARISON (X vs Y): Verdict in the first 2-3 sentences. Then a scorecard table using <table class="comparison-scorecard"> with rows: Look & feel, Durability, Maintenance, Light control/comfort, Price, Best room, Winner. Then H2s for each criterion, "Choose X if… / Choose Y if…" lists, and picks for each side as PRODUCT CARDS if products are supplied.`,
      "style-guide": `STYLE GUIDE (What is X?): Definition in the first 2 sentences, origins/history, the 6-8 defining elements, colour palette table, materials, key furniture pieces, how to get the look on a budget, X vs similar styles table, mistakes.`,
      "diy": `DIY / TUTORIAL: Snapshot box at top (Time, Cost, Skill level, Renter-friendly yes/no). "What you'll need" list, numbered H2 steps with exact measurements, pro tips, troubleshooting, and variations for renters/small budgets.`,
      "gift-guide": `GIFT GUIDE: Group by budget H2s (Under $25, Under $50, Under $100, Splurge) or by recipient type. Each gift as a PRODUCT CARD with a one-paragraph "why they'll love it". Add gifting tips + FAQ.`,
      "mistakes": `MISTAKES / CHECKLIST: Numbered H2 mistakes, each with: why it happens, what to do instead (specific fix with numbers). End with a printable-style checklist <ul>.`,
    };
    const formatBlock = FORMAT_BLUEPRINTS[articleFormat] ? `\n\nARTICLE FORMAT FOR THIS POST (OVERRIDES the generic body order where they conflict; keep TOC, cheat sheet, FAQ):\n${FORMAT_BLUEPRINTS[articleFormat]}` : "";

    const productBlock = isMoney ? `\n\nAFFILIATE PRODUCTS ARE ALLOWED IN THIS POST. ${productList.length ? `Feature EXACTLY these products, in a sensible order, using their exact URLs:\n${JSON.stringify(productList)}` : "No products supplied: recommend realistic product TYPES and link each to an Amazon search URL https://www.amazon.com/s?k=QUERY&tag=roomrefine-20."}
PRODUCT CARD HTML (use for every product):
<div class="product-pick-card"><span class="pick-badge">Best Overall</span>${"${IMG}"}<h3>Product name</h3><p class="pick-meta">≈ $price · ★ rating</p><ul class="pick-pros"><li>Pro</li><li>Pro</li></ul><p class="pick-cons"><strong>Keep in mind:</strong> con</p><a class="pick-button" href="URL" target="_blank" rel="nofollow sponsored noopener">Check price on Amazon</a></div>
Replace \${IMG} with <img src="IMAGE_URL" alt="descriptive alt" loading="lazy"> only when an image_url is supplied, otherwise omit it. Prices are approximate — say "check current price". Never invent star ratings when not supplied; omit the ★ part instead. Be honest: every product gets a real "Keep in mind".` : "";
    const editorialRule = isMoney
      ? "CONTENT FOCUS: This is a helpful, honest buying article. Product links are allowed ONLY in product cards/at-a-glance table as specified; the rest stays editorial. Internal links to our articles are encouraged."
      : "CONTENT FOCUS (STRICT): This is an editorial article, not a sales page. Do NOT embed products, product cards, \"Shop\" buttons, Amazon or affiliate links. Do not push readers to buy. Mention generic item types (e.g. \"a linen throw\") only as styling advice. The only links allowed are internal links to our own articles.";

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

${editorialRule}

RANK #1 EDITORIAL BLUEPRINT (MANDATORY ORDER — match and beat the top-ranking home decor articles):
1. Editorial hook (2-3 sentences) that answers the query directly in the first 50 words (featured-snippet ready) and contains the primary keyword.
2. Table of Contents (format above).
3. "Quick Cheat Sheet" card right after the TOC:
<div class="blog-cheatsheet" style="margin: 24px 0; padding: 20px; border: 1px solid #e8dcc4; border-radius: 12px;"><p style="font-weight: 600; margin-bottom: 8px;">✨ Quick Cheat Sheet</p><ul><li>…</li></ul></div>
   (4-6 bullets: the single most useful takeaways, with concrete numbers — sizes, distances, colour names, budgets.)
4. Chapter-by-chapter body: each H2 is one idea/room zone. Under each H2 give: why it works (designer reasoning), how to do it (specific steps/measurements), and a "Designer's note" blockquote in at least two sections.
5. "Material & Colour Palette" H2: a small HTML <table> listing 4-6 materials/colours (name, where to use it, why it works).
6. "Mistakes to Avoid" H2 with 3-5 bullets.
7. FAQ section (format above), 5-7 real "People Also Ask" questions.
8. Warm closing CTA paragraph inviting readers to explore a related internal article.
QUALITY BAR: never generic filler, no repeated sentences, every section must contain at least one specific, verifiable detail (measurement, ratio, material, colour name, light temperature, price range). Use 3-5 contextual internal links to our existing articles where relevant.

LENGTH IS NON-NEGOTIABLE: the article MUST be at least ${wordCountTarget} words. Write 5-7 H2 chapters and EACH chapter body must be at least 250 words (multiple paragraphs, plus H3 sub-points where useful). Include real paint names (e.g. Farrow & Ball, Benjamin Moore shade names), exact measurements in inches and cm, bulb temperatures in Kelvin, and named materials. A short outline or 1-2 sentences per heading is a FAILED answer.

${formatBlock}${productBlock}

You MUST return structured data using the "generate_blog_post" tool.`;

    const expandBlock = existingContent
      ? `\n\nRE-EXPAND MODE: Below is a thin existing draft. Keep its topic, angle and headings where good, but rewrite and expand it into a complete ${wordCountTarget}+ word Rank #1 guide following the full blueprint. Existing draft:\n"""\n${String(existingContent).slice(0, 12000)}\n"""`
      : "";

    const userPrompt = `Write a comprehensive, Google-ranking blog post about: "${topic}"
${tone ? `Tone: ${tone} (but ALWAYS maintain the warm, elegant Isabelle Hart Interiors brand voice underneath)` : ""}
${category ? `Category: ${category}` : ""}
${keywords ? `Primary and secondary keywords to target: ${keywords}` : ""}
Target word count: ${wordCountTarget} words MINIMUM (not an approximation — anything under ${MIN_WORDS} words will be rejected)

IMPORTANT REQUIREMENTS:
1. Include a Table of Contents after the intro paragraph with anchor links to all H2s
2. Include 5-7 FAQ questions at the end in proper FAQ markup
3. Cover this topic more comprehensively than any competitor — add unique angles, specific tips, and expert insights
4. Every image must have descriptive, keyword-rich alt text
5. Maintain warm, conversational brand voice throughout (audience: women 25-45 who want beautiful affordable homes)
6. ${isMoney ? "Feature the products as specified with honest pros/cons" : "Do NOT promote or link to any products — focus 100% on teaching and inspiring around the topic"}
7. The content should feel like advice from a trusted friend, not a corporate blog
8. Each H2 chapter: at least 250 words with specific paint names, measurements and materials${expandBlock}`;

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
              content: { type: "string", description: `Full blog post in semantic HTML. Target ${wordCountTarget} words. MUST include: 1) Table of Contents after intro, 2) H2 headings with id attributes, 3) Internal links to our articles (product cards only when the format allows), 4) FAQ section at the end with 5-7 questions, 5) Descriptive alt text on ALL images, 6) Key Takeaways section, 7) CTA paragraph.` },
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

    async function callLovable(msgs: any[] = messages) {
      if (!LOVABLE_API_KEY) return null;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", max_tokens: 16000, messages: msgs, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
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
        body: JSON.stringify({ model, max_tokens: 8192, messages, tools: toolsDef, tool_choice: { type: "function", function: { name: "generate_blog_post" } } }),
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

    let blogPost: any = anthropicDirect;

    if (!blogPost) {
      if (!response || !response.ok) {
        return new Response(JSON.stringify({
          error: "No AI provider available. Configure an API key in Admin → Settings → AI API tab.",
        }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== "generate_blog_post") {
        throw new Error("AI did not return structured blog data");
      }
      blogPost = JSON.parse(toolCall.function.arguments);
    }

    // Validator: thin output gets one forced expansion pass
    if (countWords(blogPost.content) < MIN_WORDS) {
      console.log("Thin draft detected:", countWords(blogPost.content), "words — expanding");
      try {
        const retry = await callLovable([
          ...messages,
          { role: "assistant", content: `Draft (too short):\n${String(blogPost.content).slice(0, 8000)}` },
          { role: "user", content: `That draft is only ${countWords(blogPost.content)} words and is REJECTED. Rewrite it as a full ${wordCountTarget}+ word article. Every H2 chapter must have 250+ words with paint names, measurements, materials, a Designer's note, plus the cheat sheet, palette table, mistakes and FAQ. Return via the generate_blog_post tool.` },
        ]);
        if (retry) {
          const rd = await retry.json();
          const tc = rd.choices?.[0]?.message?.tool_calls?.[0];
          if (tc) {
            const expanded = JSON.parse(tc.function.arguments);
            if (countWords(expanded.content) > countWords(blogPost.content)) blogPost = expanded;
          }
        }
      } catch (e) { console.error("Expansion retry failed:", e); }
    }

    if (!SECTIONS.includes(blogPost.section)) blogPost.section = section && section !== "auto" ? section : "decor-ideas";
    if (!ROOMS.includes(blogPost.room)) blogPost.room = "";
    if (!STYLES.includes(blogPost.style)) blogPost.style = "";
    // Strip any affiliate/Amazon links the model might still add
    blogPost.content = isMoney
      ? String(blogPost.content || "").replace(/href="(https?:\/\/[^"]*amazon\.[^"]*)"/gi, (_m: string, u: string) => `href="${withTag(u.replace(/&amp;/g, "&"))}"`)
      : String(blogPost.content || "")
      .replace(/<div class="product-embed"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, "")
      .replace(/<a [^>]*href="[^"]*(amazon\.|amzn\.)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$2");
    blogPost.word_count = countWords(blogPost.content);

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
