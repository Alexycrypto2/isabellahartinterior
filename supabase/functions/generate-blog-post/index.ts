import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite SEO content strategist and professional copywriter for "RoomRefine", a premium home decor and interior design brand.

Your mission is to write blog posts that RANK ON PAGE 1 OF GOOGLE. Every post must follow proven SEO frameworks.

WRITING PRINCIPLES:
- Write at a Grade 8 reading level for maximum accessibility
- Use short paragraphs (2-3 sentences max) for mobile readability
- Open with a compelling hook that addresses the reader's pain point
- Include actionable, specific advice (not generic fluff)
- Use power words: "proven", "essential", "stunning", "transform", "effortless"
- Write in second person ("you") to create personal connection
- Include internal linking suggestions as [LINK: anchor text] placeholders

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

You MUST return structured data using the "generate_blog_post" tool.`;

    const userPrompt = `Write a comprehensive, Google-ranking blog post about: "${topic}"
${tone ? `Tone: ${tone}` : ""}
${category ? `Category: ${category}` : ""}
${keywords ? `Primary and secondary keywords to target: ${keywords}` : ""}

Remember: This post should be the BEST resource on this topic. Make it comprehensive, actionable, and optimized to outrank competitors.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_blog_post",
                description: "Generate a complete SEO-optimized blog post",
                parameters: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "Blog post title, under 60 chars",
                    },
                    slug: {
                      type: "string",
                      description:
                        "URL-friendly slug derived from title, lowercase with hyphens",
                    },
                    excerpt: {
                      type: "string",
                      description:
                        "1-2 sentence summary, plain text, no HTML",
                    },
                    content: {
                      type: "string",
                      description:
                        "Full blog post in semantic HTML (h2, h3, p, ul/li, strong, em, blockquote). 1200-2000 words. Include Key Takeaways section and CTA.",
                    },
                    meta_title: {
                      type: "string",
                      description: "SEO meta title, under 60 chars",
                    },
                    meta_description: {
                      type: "string",
                      description:
                        "SEO meta description, under 160 chars",
                    },
                    read_time: {
                      type: "string",
                      description: 'Estimated read time, e.g. "5 min read"',
                    },
                    image_prompt: {
                      type: "string",
                      description:
                        "Detailed prompt for generating a featured image",
                    },
                  },
                  required: [
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "meta_title",
                    "meta_description",
                    "read_time",
                    "image_prompt",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_blog_post" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI usage credits exhausted. Please top up in Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Extract tool call result
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
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
