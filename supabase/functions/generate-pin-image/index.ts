import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Health check
    if (body.healthCheck) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, description, style, dimensions } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Generate a creative pin description/concept using text model
    const conceptResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a Pinterest visual marketing expert. Create a detailed image prompt for generating a stunning Pinterest pin image. The image should be eye-catching, professional, and optimized for Pinterest engagement. Focus on making it visually appealing with good composition. Output ONLY the image generation prompt, nothing else.`
          },
          {
            role: "user",
            content: `Create a Pinterest pin image prompt for: "${title}"${description ? `\nContext: ${description}` : ""}${style ? `\nStyle preference: ${style}` : ""}\n\nThe pin should be visually stunning and perfect for Pinterest. Include text overlay "${title}" in an elegant, readable font.`
          }
        ],
      }),
    });

    if (!conceptResponse.ok) {
      if (conceptResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (conceptResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate concept");
    }

    const conceptData = await conceptResponse.json();
    const imagePrompt = conceptData.choices?.[0]?.message?.content || `A beautiful Pinterest pin about ${title}, professional design, eye-catching`;

    // Step 2: Generate the actual pin image
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a Pinterest pin image: ${imagePrompt}. The image should be in portrait orientation (2:3 ratio), professional quality, with beautiful typography showing the title "${title}". Make it vibrant and engaging for social media.`
          }
        ],
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await imageResponse.text();
      console.error("Image generation error:", errText);
      throw new Error("Failed to generate image");
    }

    const imageData = await imageResponse.json();
    
    // Extract image from response - check for inline_data in parts
    const parts = imageData.choices?.[0]?.message?.parts || [];
    const content = imageData.choices?.[0]?.message?.content || "";
    
    let imageBase64 = null;
    let textContent = "";

    // Check parts for image data
    for (const part of parts) {
      if (part.inline_data?.data) {
        imageBase64 = part.inline_data.data;
      }
      if (part.text) {
        textContent += part.text;
      }
    }

    // If no parts, check if content has base64 image
    if (!imageBase64 && content) {
      // Check if content contains a base64 image pattern
      const base64Match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        imageBase64 = base64Match[1];
      }
      textContent = content;
    }

    if (imageBase64) {
      // Upload to Supabase storage
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const fileName = `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
      const imageBuffer = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(`pins/${fileName}`, imageBuffer, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to save generated image");
      }

      const { data: urlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(`pins/${fileName}`);

      return new Response(JSON.stringify({
        success: true,
        image_url: urlData.publicUrl,
        concept: imagePrompt,
        pin_description: textContent || imagePrompt,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no image was generated, return the concept for manual use
    return new Response(JSON.stringify({
      success: true,
      image_url: null,
      concept: imagePrompt,
      pin_description: textContent || imagePrompt,
      note: "Image generation returned text only. You can use the concept to create a pin manually.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Pin generation error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to generate pin" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
