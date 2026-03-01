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

    const systemPrompt = `You are an expert SEO content writer for a premium home decor and interior design blog called "RoomRefine". 

Your writing style is:
- Professional yet warm and approachable
- Detailed and actionable with practical tips
- SEO-optimized with natural keyword integration
- Uses proper HTML formatting for rich text editors

When generating a blog post, you MUST return a JSON response using the "generate_blog_post" tool.

Guidelines:
- Title: Catchy, under 60 characters, includes main keyword
- Meta Title: SEO-optimized, under 60 characters
- Meta Description: Compelling, under 160 characters, includes call-to-action
- Excerpt: 1-2 sentences summarizing the post (plain text, no HTML)
- Content: Well-structured HTML with h2, h3, p, ul/li tags. Include 800-1500 words.
- Read Time: Estimate based on word count (e.g., "5 min read")
- Image Prompt: A detailed prompt to generate a beautiful, photorealistic featured image for this blog post. Describe the scene, lighting, colors, and mood. Always specify "interior design photography" or "home decor photography" style.`;

    const userPrompt = `Write a blog post about: "${topic}"
${tone ? `Tone: ${tone}` : ""}
${category ? `Category: ${category}` : ""}
${keywords ? `Target keywords: ${keywords}` : ""}

Generate a complete, SEO-optimized blog post with all required fields.`;

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
                        "Full blog post content in HTML with h2, h3, p, ul/li tags",
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
