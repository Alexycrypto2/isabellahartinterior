import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to your app domains
const allowedOrigins = [
  "https://roomeefine.lovable.app",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, '')))
    ? origin 
    : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

const products = [
  { id: "rattan-pendant-lamp", name: "Boho Rattan Pendant Light", category: "lighting", price: "$89.99", description: "Hand-woven rattan pendant lamp that adds warmth and texture" },
  { id: "ceramic-vase-pampas", name: "Ceramic Vase with Dried Pampas", category: "decor", price: "$45.99", description: "Elegant two-tone ceramic vase with pampas grass" },
  { id: "chunky-knit-blanket", name: "Luxury Chunky Knit Throw", category: "textiles", price: "$59.99", description: "Ultra-soft cable knit throw blanket in cream" },
  { id: "gold-round-mirror", name: "Gold Frame Round Wall Mirror", category: "decor", price: "$78.99", description: "Minimalist round mirror with elegant gold frame" },
  { id: "floating-wall-shelf", name: "Natural Wood Floating Shelves Set", category: "storage", price: "$42.99", description: "Set of 2 solid wood floating shelves" },
  { id: "linen-pillow-set", name: "Linen Throw Pillow Covers (Set of 4)", category: "textiles", price: "$34.99", description: "Premium linen pillow covers in cream and sage" },
];

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    console.log("Processing recommendation request for room:", preferences?.room);

    const systemPrompt = `You are a home decor product recommendation assistant. Based on user preferences, recommend the best products from our catalog.

Available products:
${products.map(p => `- ${p.id}: ${p.name} (${p.category}) - ${p.price} - ${p.description}`).join('\n')}

Return your response as a JSON object with this exact structure:
{
  "recommendations": [
    {
      "productId": "the product id",
      "reason": "A brief, personalized reason why this product matches their preferences (1-2 sentences)"
    }
  ]
}

Recommend 3-4 products that best match the user's style, room type, and budget preferences. Be specific about why each product fits their needs.`;

    const userMessage = `My preferences:
- Style: ${preferences.style}
- Room: ${preferences.room}
- Budget: ${preferences.budget}
- Priority: ${preferences.priority}

Please recommend products that would work best for me.`;

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
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to get AI recommendations");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let recommendations;
    try {
      recommendations = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response");
      throw new Error("Invalid response format");
    }

    console.log("Successfully generated", recommendations.recommendations?.length || 0, "recommendations");

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations function error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({ error: "Failed to get recommendations. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
