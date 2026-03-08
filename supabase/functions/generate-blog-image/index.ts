import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getCustomImageConfig() {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
    if (data?.value) {
      const val = data.value as any;
      const priority = val.priority || "custom";
      if (val.image_api_key) {
        return {
          provider: val.image_provider || "openai",
          api_key: val.image_api_key,
          model: val.image_model || "",
          endpoint: val.image_endpoint || "",
          priority,
        };
      }
      return { priority } as any;
    }
  } catch { /* no config */ }
  return null;
}

async function generateWithOpenAIDalle(apiKey: string, model: string, prompt: string, customUrl?: string): Promise<string> {
  const url = customUrl || "https://api.openai.com/v1/images/generations";
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "dall-e-3",
      prompt: `Beautiful, high-quality photograph for a home decor blog post. Photorealistic, well-lit, magazine-quality. Style: interior design photography, 1200x630 aspect ratio optimized for social sharing, warm tones. Scene: ${prompt}`,
      n: 1,
      size: "1792x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI DALL-E error:", response.status, errText);
    throw new Error(`DALL-E error: ${response.status}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data from DALL-E");
  return `data:image/png;base64,${b64}`;
}

async function generateWithGeminiImage(apiKey: string, model: string, prompt: string, endpoint?: string): Promise<string> {
  const modelName = model || "gemini-2.0-flash-exp";
  const url = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  // If endpoint doesn't have the key param, append it
  const finalUrl = url.includes("key=") ? url : `${url}${url.includes("?") ? "&" : "?"}key=${apiKey}`;

  const fullPrompt = `Generate a beautiful, high-quality photograph for a home decor blog post. The image should be photorealistic, well-lit, and magazine-quality. Style: interior design photography, 1200x630px dimensions optimized for blog featured images, warm tones. Scene: ${prompt}`;

  const response = await fetch(finalUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini image error:", response.status, errText);
    throw new Error(`Gemini image error: ${response.status} - ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  
  // Extract image from Gemini response
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image data in Gemini response");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    let imageData: string | null = null;
    const customConfig = await getCustomImageConfig();
    const priority = customConfig?.priority || "custom";
    const hasCustomKey = customConfig?.api_key;

    async function tryLovable() {
      if (!LOVABLE_API_KEY) return null;
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: `Generate a beautiful, high-quality photograph for a home decor blog post. The image should be photorealistic, well-lit, and magazine-quality. Style: interior design photography, 1200x630px dimensions optimized for blog featured images and social sharing, warm tones. Scene: ${prompt}` }],
            modalities: ["image", "text"],
          }),
        });
        if (response.status === 429) {
          throw { status: 429, message: "Rate limit exceeded. Please try again in a moment." };
        }
        if (response.ok) {
          const data = await response.json();
          return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
        }
        if (response.status === 402) { console.log("Lovable AI credits exhausted for image gen"); }
        return null;
      } catch (e: any) {
        if (e?.status === 429) throw e;
        console.error("Lovable AI image request failed:", e);
        return null;
      }
    }

    async function tryCustomImage() {
      if (!hasCustomKey) return null;
      console.log(`Using custom image provider: ${customConfig.provider}, model: ${customConfig.model}`);
      if (customConfig.provider === "google") {
        return await generateWithGeminiImage(customConfig.api_key, customConfig.model, prompt, customConfig.endpoint);
      } else if (customConfig.provider === "custom" && customConfig.endpoint) {
        return await generateWithOpenAIDalle(customConfig.api_key, customConfig.model, prompt, customConfig.endpoint);
      } else {
        return await generateWithOpenAIDalle(customConfig.api_key, customConfig.model, prompt);
      }
    }

    try {
      if (priority === "custom" && hasCustomKey) {
        imageData = await tryCustomImage();
        if (!imageData) imageData = await tryLovable();
      } else {
        imageData = await tryLovable();
        if (!imageData) imageData = await tryCustomImage();
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    if (!imageData) {
      return new Response(JSON.stringify({
        error: "No AI image provider available. Add an Image AI API key in Admin → Settings → AI API.",
      }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!imageData) {
      throw new Error("No image was generated");
    }

    // Extract base64 data and upload to Supabase Storage
    const base64Match = imageData.match(/^data:image\/(.*?);base64,(.*)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const fileName = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(2)}.${imageFormat === "jpeg" ? "jpg" : imageFormat}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(fileName, binaryData, { contentType: `image/${imageFormat}`, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(fileName);

    return new Response(JSON.stringify({ image_url: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-blog-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
