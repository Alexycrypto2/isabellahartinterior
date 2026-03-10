import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    const weekStr = `${today.getFullYear()}-W${String(Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 604800000)).padStart(2, "0")}`;

    const systemPrompt = `You are a home decor market research expert. Your job is to identify 10 products that are CURRENTLY trending on Amazon in the Home & Kitchen / Home Decor category. Focus on:
- Amazon Bestsellers in Home Decor
- Most Wished For items
- Movers & Shakers (biggest rank jumps)
- Products going viral on social media (TikTok, Instagram, Pinterest)

For each product, provide:
1. product_name: The specific product name/type (e.g., "LED Strip Lights with Remote Control")
2. price_range: Estimated price range on Amazon (e.g., "$15-25")
3. trending_reason: Why it's trending (bestseller rank jump, viral on TikTok, seasonal demand, etc.)
4. pinterest_title: A catchy Pinterest pin title for this product (SEO-optimized, under 100 chars)
5. category: One of: Lighting, Decor & Accents, Textiles, Furniture, Storage, Wall Art, Candles & Fragrance, Plants & Planters, Rugs, Kitchen Decor
6. search_query: The Amazon search query to find this product

Return ONLY valid JSON array of 10 objects. No markdown, no explanation.`;

    const userPrompt = `It is ${today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. 

Research and identify the top 10 trending home decor products on Amazon right now. Consider current season (${today.toLocaleDateString("en-US", { month: "long" })}), upcoming holidays, social media trends, and recent bestseller movements.

Return a JSON array of 10 objects with keys: product_name, price_range, trending_reason, pinterest_title, category, search_query.`;

    console.log("Calling AI to discover trending products...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let products: any[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Failed to parse trending products from AI");
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products returned from AI");
    }

    // Add rank to each product
    products = products.slice(0, 10).map((p: any, i: number) => ({
      rank: i + 1,
      product_name: p.product_name || "Unknown Product",
      price_range: p.price_range || "N/A",
      trending_reason: p.trending_reason || "Trending on Amazon",
      pinterest_title: p.pinterest_title || p.product_name,
      category: p.category || "Decor & Accents",
      search_query: p.search_query || p.product_name,
    }));

    // Save to site_settings
    await supabase.from("site_settings").upsert({
      key: "trending_amazon_products",
      value: { products, week: weekStr, generated_at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

    console.log(`Saved ${products.length} trending products for ${weekStr}`);

    return new Response(JSON.stringify({ success: true, products, week: weekStr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("discover-trending-products error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
