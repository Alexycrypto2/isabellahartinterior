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
    const { topic, category, content } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch existing products to avoid duplicates
    const { data: existingProducts } = await supabase
      .from("products")
      .select("name, slug")
      .limit(200);

    const existingNames = (existingProducts || []).map((p: any) => p.name.toLowerCase());
    const existingSlugs = (existingProducts || []).map((p: any) => p.slug);

    const systemPrompt = `You are a product research specialist for "Isabelle Hart Interiors", a premium home decor and interior design affiliate store.

Given a blog topic, suggest 3-4 real, trending Amazon products that would be relevant to readers. These should be REAL product types that exist on Amazon (not made-up items).

For each product, provide:
- A realistic product name (like what you'd find on Amazon)
- A category from: Lighting, Furniture, Decor, Textiles, Storage, Wall Art, Planters, Rugs
- A realistic price point
- A brief product description (1-2 sentences)
- An Amazon search URL that would find this product type

IMPORTANT: 
- Products should be trending, popular items that match the blog topic
- Do NOT suggest products with these exact names (already in our shop): ${existingNames.slice(0, 30).join(", ")}
- Use realistic Amazon pricing
- Focus on products readers would actually want to buy after reading the article`;

    const userPrompt = `Blog topic: "${topic}"
${category ? `Blog category: ${category}` : ""}
${content ? `Blog content excerpt: ${content.substring(0, 500)}` : ""}

Suggest 3-4 relevant Amazon products that would complement this blog post.`;

    const toolsDef = [
      {
        type: "function",
        function: {
          name: "suggest_products",
          description: "Return product suggestions for the blog post",
          parameters: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Product name, realistic Amazon-style" },
                    category: { type: "string", description: "Product category" },
                    price: { type: "string", description: "Price like $29.99" },
                    original_price: { type: "string", description: "Original price if on sale, like $39.99, or null" },
                    description: { type: "string", description: "1-2 sentence product description" },
                    amazon_search_query: { type: "string", description: "Amazon search query to find this type of product" },
                    image_prompt: { type: "string", description: "Detailed prompt to generate a realistic product photo. Describe the product on a clean white background, studio lighting, high-quality product photography style." },
                  },
                  required: ["name", "category", "price", "description", "amazon_search_query", "image_prompt"],
                  additionalProperties: false,
                },
              },
            },
            required: ["products"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: toolsDef,
        tool_choice: { type: "function", function: { name: "suggest_products" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return product suggestions");

    const { products } = JSON.parse(toolCall.function.arguments);

    // Generate images and insert products into DB
    const insertedProducts = [];

    for (const product of products) {
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Skip if slug already exists
      if (existingSlugs.includes(slug)) continue;

      // Generate product image using AI
      let imageUrl = "";
      try {
        const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: product.image_prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const base64Image = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64Image) {
            // Upload to storage
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const fileName = `products/${slug}-${Date.now()}.png`;

            const { error: uploadError } = await supabase.storage
              .from("blog-images")
              .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

            if (!uploadError) {
              const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(fileName);
              imageUrl = urlData.publicUrl;
            }
          }
        }
      } catch (imgErr) {
        console.warn(`Image generation failed for ${product.name}:`, imgErr);
      }

      // Build Amazon affiliate URL
      const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(product.amazon_search_query)}&tag=roomrefine-20`;

      // Insert into products table as draft
      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert({
          name: product.name,
          slug,
          description: product.description,
          price: product.price,
          original_price: product.original_price || null,
          category: product.category,
          image_url: imageUrl || null,
          affiliate_url: amazonUrl,
          is_active: false,
          is_featured: false,
          badge: "New",
        })
        .select()
        .single();

      if (!insertError && inserted) {
        insertedProducts.push(inserted);
      } else {
        console.warn(`Failed to insert product ${product.name}:`, insertError);
      }
    }

    return new Response(JSON.stringify({ products: insertedProducts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("discover-blog-products error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
