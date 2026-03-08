import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, category, price, type } = await req.json();
    
    if (!title || !description) {
      return new Response(JSON.stringify({ error: "Title and description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Pinterest marketing expert for RoomRefine, a home decor brand. Generate ONE perfect Pinterest pin description that will drive clicks and saves.

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const pinDescription = data.choices?.[0]?.message?.content?.trim() || "";

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
