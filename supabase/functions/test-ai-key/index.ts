import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { type, provider, api_key, model, endpoint } = await req.json();

    if (!api_key) {
      return new Response(JSON.stringify({ success: false, error: "No API key provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "text") {
      return await testTextAi(provider, api_key, model, endpoint);
    } else if (type === "image") {
      return await testImageAi(provider, api_key, model, endpoint);
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid type. Use 'text' or 'image'." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("test-ai-key error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function testTextAi(provider: string, apiKey: string, model: string, endpoint: string) {
  const testPrompt = "Respond with exactly: OK";
  let url: string;
  let headers: Record<string, string>;
  let body: string;

  if (provider === "anthropic") {
    url = "https://api.anthropic.com/v1/messages";
    headers = { "x-api-key": apiKey, "Content-Type": "application/json", "anthropic-version": "2023-06-01" };
    body = JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: testPrompt }],
    });
  } else if (provider === "google") {
    const m = model || "gemini-2.0-flash";
    url = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    // If endpoint is provided, append key as query param
    if (endpoint) {
      const separator = endpoint.includes("?") ? "&" : "?";
      url = `${endpoint}${separator}key=${apiKey}`;
    }
    headers = { "Content-Type": "application/json" };
    body = JSON.stringify({
      contents: [{ parts: [{ text: testPrompt }] }],
      generationConfig: { maxOutputTokens: 10 },
    });
  } else {
    // OpenAI or custom
    url = endpoint || "https://api.openai.com/v1/chat/completions";
    headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    body = JSON.stringify({
      model: model || "gpt-4o-mini",
      max_tokens: 10,
      messages: [{ role: "user", content: testPrompt }],
    });
  }

  const response = await fetch(url, { method: "POST", headers, body });

  if (!response.ok) {
    const errText = await response.text();
    let errorMsg = `API returned ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errorMsg = errJson.error?.message || errJson.error?.type || errJson.error?.status || errorMsg;
    } catch { /* use default */ }
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await response.text(); // consume body
  return new Response(JSON.stringify({ success: true, message: "Text AI connection successful!" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function testImageAi(provider: string, apiKey: string, model: string, endpoint: string) {
  let url: string;
  let headers: Record<string, string>;
  let body: string;

  if (provider === "google") {
    // Use Gemini generateContent with image generation for testing
    const m = model || "gemini-2.0-flash-exp";
    url = endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    if (endpoint) {
      const separator = endpoint.includes("?") ? "&" : "?";
      url = `${endpoint}${separator}key=${apiKey}`;
    }
    headers = { "Content-Type": "application/json" };
    // Simple test: just verify the model responds (not actually generating an image)
    body = JSON.stringify({
      contents: [{ parts: [{ text: "Respond with exactly: OK" }] }],
      generationConfig: { maxOutputTokens: 10 },
    });
  } else {
    // OpenAI DALL-E or custom
    url = endpoint || "https://api.openai.com/v1/images/generations";
    headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    body = JSON.stringify({
      model: model || "dall-e-2",
      prompt: "A small red dot on white background",
      n: 1,
      size: "256x256",
    });
  }

  const response = await fetch(url, { method: "POST", headers, body });

  if (!response.ok) {
    const errText = await response.text();
    let errorMsg = `API returned ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      errorMsg = errJson.error?.message || errJson.error?.type || errJson.error?.status || errorMsg;
    } catch { /* use default */ }
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await response.text(); // consume body
  return new Response(JSON.stringify({ success: true, message: "Image AI connection successful!" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
