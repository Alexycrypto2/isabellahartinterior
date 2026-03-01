import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number; dailyCount: number; dailyResetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000;
const DAILY_LIMIT_MAX = 100;
const DAILY_WINDOW = 24 * 60 * 60 * 1000;

const burstStore = new Map<string, number[]>();
const BURST_WINDOW = 5000;
const BURST_MAX = 3;

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const bursts = burstStore.get(ip) || [];
  const recentBursts = bursts.filter(t => now - t < BURST_WINDOW);
  if (recentBursts.length >= BURST_MAX) {
    return { allowed: false, reason: "Too many requests in quick succession. Please slow down." };
  }
  recentBursts.push(now);
  burstStore.set(ip, recentBursts);

  let record = rateLimitStore.get(ip);
  if (!record) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW, dailyCount: 0, dailyResetTime: now + DAILY_WINDOW };
  }
  if (now > record.resetTime) { record.count = 0; record.resetTime = now + RATE_LIMIT_WINDOW; }
  if (now > record.dailyResetTime) { record.dailyCount = 0; record.dailyResetTime = now + DAILY_WINDOW; }
  if (record.dailyCount >= DAILY_LIMIT_MAX) return { allowed: false, reason: "Daily usage limit reached. Please try again tomorrow." };
  if (record.count >= RATE_LIMIT_MAX) return { allowed: false, reason: "Rate limit exceeded. Please wait a moment and try again." };
  record.count++;
  record.dailyCount++;
  rateLimitStore.set(ip, record);
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.dailyResetTime) rateLimitStore.delete(ip);
  }
  for (const [ip, bursts] of burstStore.entries()) {
    if (bursts.filter(t => now - t < BURST_WINDOW).length === 0) burstStore.delete(ip);
  }
}, 60000);

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) return { valid: false, error: "Messages must be an array" };
  if (messages.length === 0) return { valid: false, error: "Messages array cannot be empty" };
  if (messages.length > 50) return { valid: false, error: "Too many messages (max 50)" };
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== "object") return { valid: false, error: `Message ${i + 1} is invalid` };
    if (!msg.role || (msg.role !== "user" && msg.role !== "assistant")) return { valid: false, error: `Message ${i + 1} has invalid role` };
    if (!msg.content || typeof msg.content !== "string" || msg.content.trim().length === 0) return { valid: false, error: `Message ${i + 1} missing valid content` };
    if (msg.content.length > 4000) return { valid: false, error: `Message ${i + 1} exceeds max length` };
  }
  return { valid: true };
}

let contentCache: { blogs: string; products: string; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchDynamicContent(): Promise<{ blogs: string; products: string }> {
  const now = Date.now();
  if (contentCache && now - contentCache.fetchedAt < CACHE_TTL) {
    return { blogs: contentCache.blogs, products: contentCache.products };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [blogsRes, productsRes] = await Promise.all([
    supabase.from("blog_posts").select("title, slug, excerpt, category").eq("published", true).order("created_at", { ascending: false }).limit(30),
    supabase.from("products").select("name, slug, description, price, original_price, category, badge, rating").eq("is_active", true).order("is_featured", { ascending: false }).limit(40),
  ]);

  const baseUrl = "https://roomeefine.lovable.app";

  let blogsText = "";
  if (blogsRes.data && blogsRes.data.length > 0) {
    blogsText = blogsRes.data.map((b: any) =>
      `- "${b.title}" (${b.category}) - ${baseUrl}/blog/${b.slug}\n  ${b.excerpt?.slice(0, 120) || ""}`
    ).join("\n");
  }

  let productsText = "";
  if (productsRes.data && productsRes.data.length > 0) {
    productsText = productsRes.data.map((p: any) => {
      const sale = p.original_price ? ` (was ${p.original_price})` : "";
      const badge = p.badge ? ` - ${p.badge}` : "";
      const rating = p.rating ? ` ⭐ ${p.rating}` : "";
      return `- ${p.name} — ${p.price}${sale}${badge}${rating} (${p.category})\n  ${baseUrl}/shop (search: ${p.slug})\n  ${p.description?.slice(0, 100) || ""}`;
    }).join("\n");
  }

  contentCache = { blogs: blogsText, products: productsText, fetchedAt: now };
  return { blogs: blogsText, products: productsText };
}

async function getCustomAiConfig() {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data } = await sb.from("site_settings").select("value").eq("key", "ai_api").single();
    if (data?.value) {
      const val = data.value as any;
      const key = val.text_api_key || val.api_key;
      if (key) return { provider: val.text_provider || val.provider || "openai", api_key: key, model: val.text_model || val.model, endpoint: val.text_endpoint };
    }
  } catch { /* no config */ }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    return new Response(JSON.stringify({ error: rateLimitResult.reason }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const { blogs, products } = await fetchDynamicContent();
    const baseUrl = "https://roomeefine.lovable.app";

    const systemPrompt = `# BUILD BETTER - AI Design Assistant

## YOUR IDENTITY & MISSION
You are the Build Better Design Assistant - a friendly, knowledgeable home decor expert who helps visitors transform their living spaces with beautiful, affordable solutions. You're a trusted, design-savvy friend who genuinely cares about helping people create homes they love.

## BRAND VOICE
- **Warm & Encouraging**: Make decorating feel accessible
- **Knowledgeable but Approachable**: Share expertise without being condescending
- **Practical & Budget-Conscious**: Focus on real-world, affordable solutions

## TRUST SIGNALS
- 50,000+ homeowners trust our recommendations
- 500+ products personally tested
- 1,000+ design guides created

## ========================================
## LATEST BLOG ARTICLES (from our database)
## ========================================
${blogs || "No blog posts available yet."}

## ========================================
## CURRENT PRODUCT CATALOG (from our database)
## ========================================
${products || "No products available yet."}

## MAIN PAGES
- Shop All Products: ${baseUrl}/shop
- Blog & Guides: ${baseUrl}/blog
- About Us: ${baseUrl}/about
- Contact: ${baseUrl}/contact

## HOW TO SHARE LINKS
Always include direct links using markdown format:
"Check out our article on [Title](${baseUrl}/blog/slug) - it covers exactly what you need!"
"I'd recommend our [Product Name](${baseUrl}/shop) - great value at $XX!"

## RESPONSE GUIDELINES
- Keep responses conversational and scannable
- Use **bold** for emphasis, bullet points for lists
- ALWAYS include relevant links when discussing products or articles
- Ask clarifying questions to better understand needs
- End with a helpful follow-up question
- Be concise but thorough

## LEAD MAGNET
**Free Home Decor Essentials Guide** - 25 pages of pro tips. Offer when users seem engaged.

## BOUNDARIES
❌ No structural/renovation advice (walls, plumbing, electrical)
❌ Stay on topic: home decor and interior design only
❌ Don't make claims beyond our testing

## SAFETY
⚠️ Mention furniture anchoring for tall pieces
⚠️ Suggest professional installation for heavy fixtures
⚠️ Fire safety reminders for candles/lighting`;

    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Try Lovable AI first
    let response: Response | null = null;

    if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: allMessages, stream: true }),
      });

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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
            body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages: messages.map((m: any) => ({ role: m.role, content: m.content })), stream: true }),
          });
          if (!anthropicResp.ok) throw new Error("Fallback AI error");
          return new Response(anthropicResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }

        const url = provider === "custom" && customConfig.endpoint
          ? customConfig.endpoint
          : provider === "google"
            ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
            : "https://api.openai.com/v1/chat/completions";

        response = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${customConfig.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: allMessages, stream: true }),
        });
      } else if (!response || response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add your own API key in Admin → Settings → AI API." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!response!.ok) {
      console.error("AI error:", response!.status);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response!.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
