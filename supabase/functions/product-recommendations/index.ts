import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

// Map friendly frontend values to backend keys
function mapStyle(val: string): string {
  const map: Record<string, string> = {
    "modern minimalist": "modern",
    "boho chic": "bohemian",
    "scandinavian": "scandinavian",
    "traditional": "traditional",
    "industrial chic": "industrial",
    "coastal retreat": "coastal",
    "farmhouse charm": "farmhouse",
  };
  return map[val.toLowerCase()] || val.toLowerCase();
}

function mapRoom(val: string): string {
  const map: Record<string, string> = {
    "living room": "living-room",
    "bedroom": "bedroom",
    "dining room": "dining-room",
    "home office": "office",
    "kitchen": "kitchen",
    "bathroom": "bathroom",
    "entryway": "entryway",
  };
  return map[val.toLowerCase()] || val.toLowerCase();
}

function mapBudget(val: string): string {
  const map: Record<string, string> = {
    "under $50": "budget",
    "$50-$100": "mid-range",
    "over $100": "luxury",
    "no budget limit": "luxury",
  };
  return map[val.toLowerCase()] || val.toLowerCase();
}

function mapPriority(val: string): string {
  const map: Record<string, string> = {
    "style & aesthetics": "style",
    "comfort & coziness": "comfort",
    "functionality": "functionality",
    "value for money": "durability",
  };
  return map[val.toLowerCase()] || val.toLowerCase();
}

const products = [
  { id: "rattan-pendant-lamp", name: "Boho Rattan Pendant Light", category: "lighting", price: "$89.99", description: "Hand-woven rattan pendant lamp that adds warmth and texture to any room. Perfect for dining areas or living rooms." },
  { id: "ceramic-vase-pampas", name: "Ceramic Vase with Dried Pampas", category: "decor", price: "$45.99", description: "Elegant two-tone ceramic vase with beautiful dried pampas grass arrangement. Instant boho-chic vibes." },
  { id: "chunky-knit-blanket", name: "Luxury Chunky Knit Throw", category: "textiles", price: "$59.99", description: "Ultra-soft cable knit throw blanket in cream. Perfect for cozy evenings and adding texture to your sofa." },
  { id: "gold-round-mirror", name: "Gold Frame Round Wall Mirror", category: "decor", price: "$78.99", description: "Minimalist round mirror with elegant gold frame. Opens up any space and adds a touch of sophistication." },
  { id: "floating-wall-shelf", name: "Natural Wood Floating Shelves Set", category: "storage", price: "$42.99", description: "Set of 2 solid wood floating shelves. Perfect for displaying plants, books, and decorative items." },
  { id: "linen-pillow-set", name: "Linen Throw Pillow Covers (Set of 4)", category: "textiles", price: "$34.99", description: "Premium linen pillow covers in cream and sage green. Breathable, soft, and perfect for any season." },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { preferences } = body;

    if (!preferences || !preferences.style || !preferences.room || !preferences.budget || !preferences.priority) {
      return new Response(JSON.stringify({ error: "All preferences are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map user-friendly values to backend keys
    const mappedPrefs = {
      style: mapStyle(preferences.style),
      room: mapRoom(preferences.room),
      budget: mapBudget(preferences.budget),
      priority: mapPriority(preferences.priority),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    console.log("Processing recommendation request:", JSON.stringify(mappedPrefs));

    const systemPrompt = `You are an expert home decor stylist and product recommendation assistant for RoomRefine. Based on user preferences, recommend the best products from our catalog.

Available products:
${products.map(p => `- ID: "${p.id}" | Name: ${p.name} | Category: ${p.category} | Price: ${p.price} | Description: ${p.description}`).join('\n')}

IMPORTANT RULES:
1. Only recommend products from the list above using their exact IDs
2. Recommend 3-4 products that best match the user's style, room type, budget, and priority
3. Write personalized, warm reasons explaining WHY each product suits them specifically
4. Consider the room type when recommending (e.g., lighting for living rooms, textiles for bedrooms)
5. Consider budget when recommending (budget = under $50, mid-range = $50-$100, luxury = over $100)

You MUST respond with valid JSON in this exact format:
{
  "recommendations": [
    {
      "productId": "exact-product-id-from-list",
      "reason": "A warm, personalized 1-2 sentence reason why this product is perfect for them"
    }
  ]
}`;

    const userMessage = `Here are my home decor preferences:
- Design Style: ${preferences.style} (mapped: ${mappedPrefs.style})
- Room: ${preferences.room} (mapped: ${mappedPrefs.room})
- Budget: ${preferences.budget} (mapped: ${mappedPrefs.budget})
- Top Priority: ${preferences.priority} (mapped: ${mappedPrefs.priority})

Please recommend the best products for me!`;

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
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service is busy. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to get AI recommendations");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let recommendations;
    try {
      recommendations = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format");
    }

    // Validate that recommended product IDs exist
    const validProductIds = products.map(p => p.id);
    if (recommendations.recommendations) {
      recommendations.recommendations = recommendations.recommendations.filter(
        (rec: { productId: string }) => validProductIds.includes(rec.productId)
      );
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
