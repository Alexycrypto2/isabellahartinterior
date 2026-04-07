import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KEYWORD_RULES: Record<string, string[]> = {
  "living-room": ["mirror", "lamp", "sofa", "rug", "curtain", "vase", "candle", "coffee table", "bookshelf", "throw", "cushion"],
  "bedroom": ["bed", "pillow", "duvet", "nightstand", "headboard", "lamp", "mirror", "dresser", "throw", "curtain"],
  "bathroom": ["shower", "bath", "towel", "toilet", "soap", "mirror", "mat", "dispenser"],
  "kitchen": ["kitchen", "pot", "pan", "spice", "cutting", "knife", "mug", "plate", "bowl", "rack", "jar"],
  "home-office": ["desk", "office", "chair", "organizer", "monitor", "lamp", "shelf", "bookend", "pen"],
  "entryway": ["entryway", "console", "coat", "welcome", "hook", "shoe", "umbrella", "key"],
  "outdoor-patio": ["outdoor", "patio", "garden", "plant", "planter", "solar", "lantern", "hammock"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, description } = await req.json();
    const text = `${name || ""} ${description || ""}`.toLowerCase();

    // Try AI first
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a home decor product categorizer. Given a product name and description, determine which rooms this product belongs to. Available room categories: living-room, bedroom, bathroom, kitchen, home-office, entryway, outdoor-patio. Return ONLY a JSON array of matching category slugs. A product can belong to multiple rooms.`
              },
              {
                role: "user",
                content: `Product: ${name}\nDescription: ${description}`
              }
            ],
            tools: [{
              type: "function",
              function: {
                name: "categorize_product",
                description: "Categorize a product into room categories",
                parameters: {
                  type: "object",
                  properties: {
                    categories: {
                      type: "array",
                      items: { type: "string", enum: ["living-room", "bedroom", "bathroom", "kitchen", "home-office", "entryway", "outdoor-patio"] }
                    }
                  },
                  required: ["categories"]
                }
              }
            }],
            tool_choice: { type: "function", function: { name: "categorize_product" } },
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            const parsed = JSON.parse(toolCall.function.arguments);
            if (parsed.categories?.length > 0) {
              return new Response(JSON.stringify({ categories: parsed.categories, method: "ai" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
          }
        }
      } catch (e) {
        console.error("AI detection failed, falling back to keywords:", e);
      }
    }

    // Fallback: keyword rules
    const detected: string[] = [];
    for (const [room, keywords] of Object.entries(KEYWORD_RULES)) {
      if (keywords.some(kw => text.includes(kw))) {
        detected.push(room);
      }
    }

    return new Response(JSON.stringify({ categories: detected, method: "keywords" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});