import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getCustomImageConfig() {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
    if (!data) return null;
    const v = data.value as Record<string, any>;
    return {
      priority: v.priority || "custom",
      api_key: v.image_api_key || null,
      provider: v.image_provider || "openai",
      model: v.image_model || (v.image_provider === "google" ? "gemini-2.0-flash-exp" : "dall-e-3"),
      endpoint: v.image_endpoint || "",
    };
  } catch (_e) { return null; }
}

// Returns base64 image data (no prefix) or null.
async function generateWithCustom(cfg: any, prompt: string): Promise<string | null> {
  if (!cfg?.api_key) return null;
  try {
    if (cfg.provider === "openai" || cfg.provider === "custom") {
      const url = cfg.endpoint || "https://api.openai.com/v1/images/generations";
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.api_key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: cfg.model || "dall-e-3", prompt, size: "1024x1792", response_format: "b64_json", n: 1 }),
      });
      if (!r.ok) { console.error("Custom image error:", r.status, await r.text()); return null; }
      const j = await r.json();
      return j.data?.[0]?.b64_json || null;
    }
    if (cfg.provider === "google") {
      const url = cfg.endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent`;
      const r = await fetch(`${url}?key=${cfg.api_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      });
      if (!r.ok) { console.error("Gemini image error:", r.status, await r.text()); return null; }
      const j = await r.json();
      const parts = j.candidates?.[0]?.content?.parts || [];
      for (const p of parts) if (p.inlineData?.data) return p.inlineData.data;
      return null;
    }
  } catch (e) { console.error("Custom image gen exception:", e); }
  return null;
}

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
    const customCfg = await getCustomImageConfig();
    const priority = customCfg?.priority || "custom";
    const hasCustomKey = !!customCfg?.api_key;

    if (!LOVABLE_API_KEY && !hasCustomKey) {
      return new Response(JSON.stringify({ error: "No AI provider available. Add an image API key in Admin → Settings → AI API." }), {
        status: 402,
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

    const callLovableImage = async (): Promise<{ b64: string | null; text: string } | null> => {
      if (!LOVABLE_API_KEY) return null;
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: userContent }],
          modalities: ["image", "text"],
        }),
      });
      if (r.status === 429) throw Object.assign(new Error("Rate limited. Please try again in a moment."), { status: 429 });
      if (r.status === 402) { console.log("Lovable image credits exhausted, will try custom"); return null; }
      if (!r.ok) { console.error("Lovable image error:", r.status, await r.text()); return null; }
      const j = await r.json();
      let b64: string | null = null;
      let text = "";
      const images = j.choices?.[0]?.message?.images;
      if (images?.length) {
        const u = images[0]?.image_url?.url;
        if (u?.startsWith("data:image")) b64 = u.split(",")[1];
      }
      const parts = j.choices?.[0]?.message?.parts || [];
      if (!b64) for (const p of parts) { if (p.inline_data?.data) b64 = p.inline_data.data; if (p.text) text += p.text; }
      const content = j.choices?.[0]?.message?.content || "";
      if (!b64 && content) {
        const m = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (m) b64 = m[1];
        if (!text) text = content;
      }
      return { b64, text };
    };

    const customPrompt = `Pinterest pin, portrait ${aspectRatio} orientation. Title: "${title}". ${description ? description + ". " : ""}Style: ${styleDesc}. Beautiful typography with the title as elegant text overlay. Magazine-quality, eye-catching, high resolution.`;

    let imageBase64: string | null = null;
    let textContent = "";
    try {
      if (priority === "custom" && hasCustomKey) {
        imageBase64 = await generateWithCustom(customCfg, customPrompt);
        if (!imageBase64) {
          const r = await callLovableImage();
          imageBase64 = r?.b64 || null;
          textContent = r?.text || "";
        }
      } else {
        const r = await callLovableImage();
        imageBase64 = r?.b64 || null;
        textContent = r?.text || "";
        if (!imageBase64 && hasCustomKey) imageBase64 = await generateWithCustom(customCfg, customPrompt);
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw e;
    }

    // Also generate a pin description using text model
    let pinDescription = textContent || `${title} - Beautiful home decor inspiration`;
    if (LOVABLE_API_KEY) {
      try {
        const descResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a Pinterest SEO expert. Write a compelling pin description optimized for Pinterest search. Include relevant keywords, hashtags, and a call to action. Keep it under 500 characters." },
              { role: "user", content: `Write a Pinterest pin description for: "${title}"${description ? `. Context: ${description}` : ""}` },
            ],
          }),
        });
        if (descResponse.ok) {
          const descData = await descResponse.json();
          pinDescription = descData.choices?.[0]?.message?.content || pinDescription;
        }
      } catch (_e) { /* keep fallback description */ }
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
      success: false,
      image_url: null,
      pin_description: pinDescription,
      error: hasCustomKey
        ? "Image generation failed on both providers. Try a different style or check your API key."
        : "Image generation requires AI credits. Add an image API key in Admin → Settings → AI API to keep generating when built-in credits run out.",
    }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Pin generation error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Failed to generate pin" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
