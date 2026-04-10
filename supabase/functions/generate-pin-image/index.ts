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

    if (body.healthCheck) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, description, style, dimensions, referenceImageBase64 } = body;

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

    // Parse dimensions
    const [width, height] = (dimensions || "1000x1500").split("x").map(Number);
    const aspectRatio = width && height ? `${width}:${height}` : "2:3";

    // Build the image generation prompt
    const styleDescriptions: Record<string, string> = {
      "modern-minimal": "clean, minimalist, white space, sans-serif typography, neutral tones",
      "cozy-warm": "warm lighting, earth tones, cozy textures, inviting atmosphere",
      "luxury-elegant": "gold accents, marble textures, rich colors, premium feel",
      "boho-natural": "natural materials, dried flowers, warm neutrals, organic shapes",
      "bold-colorful": "vibrant colors, bold patterns, high contrast, energetic",
      "scandinavian": "light wood, white backgrounds, simple geometry, hygge vibes",
      "vintage-retro": "muted pastels, retro patterns, nostalgic feel, classic typography",
      "dark-moody": "dark backgrounds, dramatic lighting, luxurious textures",
      "tropical": "lush greens, tropical patterns, bright accents, resort vibes",
      "industrial": "exposed brick, metal accents, urban aesthetic, raw textures",
    };

    const styleDesc = styleDescriptions[style || "modern-minimal"] || style || "professional and eye-catching";

    // Build messages array
    const userContent: any[] = [];

    // If reference image provided, include it
    if (referenceImageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: referenceImageBase64 },
      });
      userContent.push({
        type: "text",
        text: `Using this product/reference image as inspiration, create a stunning Pinterest pin image. Title: "${title}". ${description ? `Context: ${description}. ` : ""}Style: ${styleDesc}. The pin should be portrait orientation (${aspectRatio} ratio), with beautiful typography showing the title "${title}" as text overlay. Make it professional, eye-catching, and optimized for Pinterest engagement. High quality, sharp details.`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Generate a stunning Pinterest pin image. Title: "${title}". ${description ? `Context: ${description}. ` : ""}Style: ${styleDesc}. The pin should be portrait orientation (${aspectRatio} ratio), with beautiful typography showing the title "${title}" as elegant text overlay. Make it professional, eye-catching, and optimized for Pinterest engagement. High quality, sharp details, magazine-quality design.`,
      });
    }

    // Generate image with Gemini image model
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errText);
      throw new Error("Failed to generate image");
    }

    const imageData = await imageResponse.json();

    // Extract image from the response
    let imageBase64 = null;
    let textContent = "";

    // Check for images array (Lovable AI Gateway format)
    const images = imageData.choices?.[0]?.message?.images;
    if (images && images.length > 0) {
      const imgUrl = images[0]?.image_url?.url;
      if (imgUrl && imgUrl.startsWith("data:image")) {
        imageBase64 = imgUrl.split(",")[1];
      }
    }

    // Fallback: check parts
    const parts = imageData.choices?.[0]?.message?.parts || [];
    if (!imageBase64) {
      for (const part of parts) {
        if (part.inline_data?.data) imageBase64 = part.inline_data.data;
        if (part.text) textContent += part.text;
      }
    }

    // Fallback: check content for base64
    const content = imageData.choices?.[0]?.message?.content || "";
    if (!imageBase64 && content) {
      const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match) imageBase64 = match[1];
      if (!textContent) textContent = content;
    }

    // Also generate a pin description using text model
    const descResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Pinterest SEO expert. Write a compelling pin description optimized for Pinterest search. Include relevant keywords, hashtags, and a call to action. Keep it under 500 characters." },
          { role: "user", content: `Write a Pinterest pin description for: "${title}"${description ? `. Context: ${description}` : ""}` },
        ],
      }),
    });

    let pinDescription = textContent || `${title} - Beautiful home decor inspiration`;
    if (descResponse.ok) {
      const descData = await descResponse.json();
      pinDescription = descData.choices?.[0]?.message?.content || pinDescription;
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
        .upload(`pins/${fileName}`, imageBuffer, { contentType: "image/png", upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to save generated image");
      }

      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(`pins/${fileName}`);

      // Save to pin_generations table
      await supabase.from("pin_generations").insert({
        title,
        prompt: description || title,
        style: style || "modern-minimal",
        dimensions: dimensions || "1000x1500",
        image_url: urlData.publicUrl,
        pin_description: pinDescription,
        reference_image_url: referenceImageBase64 ? "provided" : null,
      });

      return new Response(JSON.stringify({
        success: true,
        image_url: urlData.publicUrl,
        pin_description: pinDescription,
        dimensions: dimensions || "1000x1500",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      image_url: null,
      pin_description: pinDescription,
      note: "Image generation returned text only. Try again or use a different style.",
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
