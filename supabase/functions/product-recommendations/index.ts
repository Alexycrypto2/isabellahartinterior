import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
  { id: "rattan-pendant-lamp", name: "Boho Rattan Pendant Light", category: "lighting", price: "$89.99", description: "Hand-woven rattan pendant lamp for dining areas or living rooms." },
  { id: "brass-table-lamp", name: "Brass Table Lamp with Linen Shade", category: "lighting", price: "$67.99", description: "Elegant brass table lamp, perfect for bedside tables or home offices." },
  { id: "brass-floor-lamp", name: "Mid-Century Brass Floor Lamp", category: "lighting", price: "$119.99", description: "Brass floor lamp with frosted globe shade. Elegant ambient lighting." },
  { id: "ceramic-vase-pampas", name: "Ceramic Vase with Dried Pampas", category: "decor", price: "$45.99", description: "Two-tone ceramic vase with dried pampas grass. Boho-chic vibes." },
  { id: "gold-round-mirror", name: "Gold Frame Round Wall Mirror", category: "decor", price: "$78.99", description: "Minimalist round mirror with gold frame. Opens up any space." },
  { id: "botanical-wall-art", name: "Botanical Print Set (3 Frames)", category: "decor", price: "$39.99", description: "3 minimalist botanical line art prints in gold frames." },
  { id: "macrame-wall-hanging", name: "Macramé Wall Hanging", category: "decor", price: "$32.99", description: "Handcrafted cream cotton macramé wall hanging. Boho statement piece." },
  { id: "scented-candle-set", name: "Ceramic Soy Candle Set (3-Pack)", category: "decor", price: "$28.99", description: "Soy candles in ceramic jars. Eucalyptus, lavender, and vanilla." },
  { id: "ceramic-planter-set", name: "Ceramic Planter Set (3-Pack)", category: "decor", price: "$36.99", description: "White and terracotta planters in three sizes for indoor plants." },
  { id: "chunky-knit-blanket", name: "Luxury Chunky Knit Throw", category: "textiles", price: "$59.99", description: "Ultra-soft cable knit throw blanket in cream for cozy evenings." },
  { id: "linen-pillow-set", name: "Linen Throw Pillow Covers (Set of 4)", category: "textiles", price: "$34.99", description: "Premium linen pillow covers in cream and sage green." },
  { id: "jute-area-rug", name: "Handwoven Jute Area Rug", category: "textiles", price: "$54.99", description: "Natural jute round rug with fringe. Adds boho warmth." },
  { id: "sheer-linen-curtains", name: "Sheer Linen Curtain Panels (Pair)", category: "textiles", price: "$44.99", description: "White sheer linen curtains that filter light beautifully." },
  { id: "velvet-accent-chair", name: "Sage Velvet Accent Armchair", category: "furniture", price: "$189.99", description: "Mid-century velvet armchair in sage green with wood legs." },
  { id: "hairpin-side-table", name: "Wood & Hairpin Side Table", category: "furniture", price: "$49.99", description: "Solid wood side table with hairpin legs. Scandinavian design." },
  { id: "upholstered-bed-frame", name: "Tufted Linen Platform Bed Frame", category: "furniture", price: "$329.99", description: "Modern platform bed with tufted cream linen headboard." },
  { id: "walnut-coffee-table", name: "Walnut Coffee Table with Shelf", category: "furniture", price: "$159.99", description: "Walnut coffee table with open storage shelf." },
  { id: "mid-century-dining-chairs", name: "Mid-Century Dining Chairs (Set of 2)", category: "furniture", price: "$139.99", description: "Classic dining chairs with cream upholstered seats." },
  { id: "velvet-ottoman-pouf", name: "Velvet Tufted Ottoman Pouf", category: "furniture", price: "$69.99", description: "Round tufted velvet ottoman in terracotta. Extra seating or footrest." },
  { id: "oak-bookshelf", name: "5-Tier Oak Bookshelf", category: "furniture", price: "$199.99", description: "Open oak bookshelf with 5 tiers for books, plants, and decor." },
  { id: "floating-wall-shelf", name: "Natural Wood Floating Shelves Set", category: "storage", price: "$42.99", description: "Set of 2 solid wood floating shelves for plants and books." },
  { id: "rattan-storage-baskets", name: "Woven Rattan Basket Set (3-Pack)", category: "storage", price: "$46.99", description: "3 nesting rattan baskets with lids for stylish storage." },
  { id: "wooden-coat-rack", name: "Wooden Coat Rack Stand", category: "storage", price: "$55.99", description: "Freestanding wooden coat rack for entryways." },
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

    async function getCustomAiConfig() {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
        if (data?.value && (data.value as any).api_key) return data.value as { provider: string; api_key: string; model?: string };
      } catch { /* no config */ }
      return null;
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

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    // Try Lovable AI first
    let response: Response | null = null;

    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, response_format: { type: "json_object" } }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI service is busy. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (response.status === 402) {
        console.log("Lovable credits exhausted, trying fallback...");
        response = null;
      }
    }

    // Fallback to custom API key
    if (!response || !response.ok) {
      const customConfig = await getCustomAiConfig();
      if (customConfig) {
        const provider = customConfig.provider || "openai";
        const model = customConfig.model || (provider === "openai" ? "gpt-4o-mini" : provider === "google" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514");

        if (provider === "anthropic") {
          const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "x-api-key": customConfig.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
            body: JSON.stringify({ model, max_tokens: 2048, system: systemPrompt, messages: [{ role: "user", content: userMessage }] }),
          });
          if (!anthropicResp.ok) throw new Error("Fallback AI error");
          const anthropicData = await anthropicResp.json();
          const content = anthropicData.content?.[0]?.text;
          const recommendations = JSON.parse(content);
          const validProductIds = products.map(p => p.id);
          if (recommendations.recommendations) {
            recommendations.recommendations = recommendations.recommendations.filter(
              (rec: { productId: string }) => validProductIds.includes(rec.productId)
            );
          }
          return new Response(JSON.stringify(recommendations), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const url = provider === "google"
          ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

        response = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${customConfig.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
        });
      } else if (!response || response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add your own API key in Admin → Settings → AI API." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      console.error("AI error:", response!.status, errorText);
      throw new Error("Failed to get AI recommendations");
    }

    const data = await response!.json();
    const content = data.choices?.[0]?.message?.content;

    let recommendations;
    try {
      recommendations = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format");
    }

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
