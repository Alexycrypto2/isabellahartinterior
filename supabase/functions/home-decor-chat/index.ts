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

// Cache with short TTL for near-real-time updates
let contentCache: { blogs: string; products: string; productCount: number; categories: string[]; fetchedAt: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for near-real-time

async function fetchDynamicContent() {
  const now = Date.now();
  if (contentCache && now - contentCache.fetchedAt < CACHE_TTL) {
    return contentCache;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [blogsRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from("blog_posts").select("title, slug, excerpt, category, content").eq("published", true).order("created_at", { ascending: false }).limit(50),
    supabase.from("products").select("name, slug, description, price, original_price, category, badge, rating, reviews, affiliate_url, is_featured").eq("is_active", true).order("is_featured", { ascending: false }).limit(100),
    supabase.from("product_categories").select("name, slug").order("display_order", { ascending: true }),
  ]);

  const baseUrl = "https://roomeefine.lovable.app";

  let blogsText = "";
  if (blogsRes.data && blogsRes.data.length > 0) {
    blogsText = blogsRes.data.map((b: any) =>
      `- "${b.title}" (Category: ${b.category}) — ${baseUrl}/blog/${b.slug}\n  Summary: ${b.excerpt?.slice(0, 200) || ""}\n  Topics covered: ${b.content?.replace(/<[^>]*>/g, ' ').slice(0, 300) || ""}`
    ).join("\n\n");
  }

  let productsText = "";
  const productCount = productsRes.data?.length || 0;
  const categories: string[] = [];
  if (productsRes.data && productsRes.data.length > 0) {
    const cats = new Set<string>();
    productsText = productsRes.data.map((p: any) => {
      cats.add(p.category);
      const sale = p.original_price ? ` (was ${p.original_price})` : "";
      const badge = p.badge ? ` [${p.badge}]` : "";
      const rating = p.rating ? ` ⭐ ${p.rating}/5` : "";
      const reviewCount = p.reviews ? ` (${p.reviews} reviews)` : "";
      const featured = p.is_featured ? " ★ FEATURED" : "";
      return `- **${p.name}** — ${p.price}${sale}${badge}${featured}${rating}${reviewCount}\n  Category: ${p.category}\n  Description: ${p.description?.slice(0, 200) || "N/A"}\n  🔗 View: ${baseUrl}/shop/${p.slug}\n  🛒 Amazon: ${p.affiliate_url || baseUrl + '/shop'}`;
    }).join("\n\n");
    categories.push(...cats);
  }

  const categoryNames = categoriesRes.data?.map((c: any) => c.name) || categories;

  const result = { blogs: blogsText, products: productsText, productCount, categories: categoryNames, fetchedAt: now };
  contentCache = result;
  return result;
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
      if (key) return { provider: val.text_provider || val.provider || "openai", api_key: key, model: val.text_model || val.model, endpoint: val.text_endpoint, priority: val.priority || "custom" };
      return { priority: val.priority || "custom" } as any;
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
    const { blogs, products, productCount, categories } = await fetchDynamicContent();
    const baseUrl = "https://roomeefine.lovable.app";

    const systemPrompt = `# Isabelle Hart Interiors — AI Design Assistant

## YOUR IDENTITY
You are the official AI assistant for **Isabelle Hart Interiors** (website: ${baseUrl}). You are a warm, knowledgeable home decor expert who helps visitors find the perfect products, discover inspiring content, and get answers about the brand.

## BRAND INFORMATION
- **Brand Name**: Isabelle Hart Interiors
- **Mission**: Curated home decor Amazon finds — helping people create beautiful, affordable spaces
- **Website**: ${baseUrl}
- **Business Model**: Affiliate marketing — we curate and recommend products available on Amazon. We do NOT sell, ship, or handle returns directly.
- **Total Active Products**: ${productCount}
- **Categories Available**: ${categories.join(", ") || "Various home decor categories"}

## ============================================================
## COMPLETE PRODUCT CATALOG (LIVE FROM DATABASE — ${productCount} products)
## ============================================================
These are ALL the real products currently available on the website. When someone asks about products, ONLY recommend from this list. Include the Amazon link and product page link when recommending.

${products || "No products are currently listed."}

## ============================================================
## ALL PUBLISHED BLOG POSTS (LIVE FROM DATABASE)
## ============================================================
These are all current published articles. Recommend relevant ones when topics match.

${blogs || "No blog posts published yet."}

## ============================================================
## SITE POLICIES (for answering customer questions)
## ============================================================

### Privacy Policy
- We collect emails for our newsletter (voluntary opt-in)
- We use Google Analytics for site analytics
- We use cookies for functionality and analytics
- We participate in the Amazon Associates affiliate program
- We are GDPR compliant — users can request data deletion by contacting us
- Contact for privacy questions: Visit ${baseUrl}/contact
- Full policy: ${baseUrl}/privacy-policy

### Shipping Policy
- **We do NOT sell or ship products directly**
- All products are sold and fulfilled by Amazon
- Shipping times, costs, and options depend on Amazon and the specific seller
- For shipping questions, customers should check the product listing on Amazon
- Amazon Prime members typically get free shipping
- Full policy: ${baseUrl}/shipping-policy

### Returns & Refunds Policy
- **We do NOT handle returns or refunds**
- All purchases are made through Amazon
- Returns follow Amazon's standard return policy
- Most items can be returned within 30 days of delivery
- To initiate a return, visit: https://www.amazon.com/returns
- For issues with orders, contact Amazon customer service directly
- Full policy: ${baseUrl}/returns-policy

## ============================================================
## MAIN SITE PAGES
## ============================================================
- 🏠 Home: ${baseUrl}
- 🛍️ Shop All Products: ${baseUrl}/shop
- 📝 Blog & Guides: ${baseUrl}/blog
- 💡 Inspiration Gallery: ${baseUrl}/inspiration
- ℹ️ About Us: ${baseUrl}/about
- 📧 Contact: ${baseUrl}/contact
- 📋 Privacy Policy: ${baseUrl}/privacy-policy
- 🚚 Shipping Policy: ${baseUrl}/shipping-policy
- ↩️ Returns Policy: ${baseUrl}/returns-policy

## ============================================================
## RESPONSE RULES
## ============================================================

### Product Questions
- When someone asks "do you have [item]?" → Search the product catalog above and respond with REAL matches
- Always include: product name, price, brief description, and the Amazon link
- If no matching product exists, say so honestly and suggest browsing the shop or similar categories
- For budget queries like "under $50" → filter the catalog by price and show matches
- For style/room queries → match products by category and description

### Blog & Content Questions
- When someone asks about a topic → check if there's a relevant blog post and share it
- Include the blog post title, a brief summary, and the direct link

### Policy Questions
- Answer accurately based on the policies above
- Always emphasize we're an affiliate site — we don't sell, ship, or handle returns directly
- Direct customers to Amazon for order-specific issues

### Product Recommendations
- When someone describes a room, style, or need → suggest REAL products from the catalog
- Group recommendations by category when showing multiple
- Always include prices and Amazon links
- Format product recommendations clearly:
  **[Product Name]** — $XX.XX
  [Brief description]
  [🛒 Shop on Amazon](affiliate_url) | [View Details](product_page_url)

### General Guidelines
- Be conversational, warm, and helpful
- Use **bold** for product names, bullet points for lists
- Keep responses scannable — not walls of text
- Ask follow-up questions to narrow down needs
- End with a helpful suggestion or question
- Never make up products that aren't in the catalog
- Never invent prices or links

## BOUNDARIES
❌ No structural/renovation advice (walls, plumbing, electrical)
❌ Stay on topic: home decor, products, blog content, and site policies only
❌ Don't recommend products not in our database — suggest they check our shop page instead

## SAFETY
⚠️ Mention furniture anchoring for tall/heavy pieces
⚠️ Suggest professional installation for heavy fixtures
⚠️ Fire safety reminders for candles/lighting`;

    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Determine AI priority
    const customConfig = await getCustomAiConfig();
    const priority = customConfig?.priority || "custom";
    const hasCustomKey = customConfig?.api_key;

    async function callLovable() {
      if (!LOVABLE_API_KEY) return null;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: allMessages, stream: true }),
      });
      if (resp.status === 429) {
        throw { status: 429, message: "Rate limit exceeded. Please try again later." };
      }
      if (resp.status === 402) { console.log("Lovable credits exhausted"); return null; }
      if (!resp.ok) return null;
      return resp;
    }

    async function callCustomStream() {
      if (!hasCustomKey) return null;
      const provider = customConfig.provider || "openai";
      const model = customConfig.model || (provider === "openai" ? "gpt-4o-mini" : provider === "google" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514");

      if (provider === "anthropic") {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": customConfig.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
          body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages: messages.map((m: any) => ({ role: m.role, content: m.content })), stream: true }),
        });
        if (!resp.ok) return null;
        return resp;
      }

      const url = provider === "custom" && customConfig.endpoint ? customConfig.endpoint
        : provider === "google" ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${customConfig.api_key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: allMessages, stream: true }),
      });
      if (!resp.ok) return null;
      return resp;
    }

    let response: Response | null = null;
    try {
      if (priority === "custom" && hasCustomKey) {
        response = await callCustomStream();
        if (!response) response = await callLovable();
      } else {
        response = await callLovable();
        if (!response) response = await callCustomStream();
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    if (!response) {
      return new Response(JSON.stringify({ error: "No AI provider available. Add an API key in Admin → Settings → AI API." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
