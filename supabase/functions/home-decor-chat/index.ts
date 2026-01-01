import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to your app domains
const allowedOrigins = [
  "https://roomeefine.lovable.app",
  "https://lovable.dev",
  "http://localhost:5173",
  "http://localhost:8080",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/:\d+$/, '')))
    ? origin 
    : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

// Enhanced rate limiting with sliding window and daily limits
const rateLimitStore = new Map<string, { 
  count: number; 
  resetTime: number;
  dailyCount: number;
  dailyResetTime: number;
}>();
const RATE_LIMIT_MAX = 10; // Reduced: requests per minute window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const DAILY_LIMIT_MAX = 100; // Daily limit per IP
const DAILY_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Burst protection - track rapid sequential requests
const burstStore = new Map<string, number[]>();
const BURST_WINDOW = 5000; // 5 seconds
const BURST_MAX = 3; // Max 3 requests in 5 seconds

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  
  // Check burst rate (rapid fire protection)
  const bursts = burstStore.get(ip) || [];
  const recentBursts = bursts.filter(t => now - t < BURST_WINDOW);
  
  if (recentBursts.length >= BURST_MAX) {
    return { allowed: false, reason: "Too many requests in quick succession. Please slow down." };
  }
  
  recentBursts.push(now);
  burstStore.set(ip, recentBursts);
  
  // Get or initialize rate limit record
  let record = rateLimitStore.get(ip);
  
  if (!record) {
    record = { 
      count: 0, 
      resetTime: now + RATE_LIMIT_WINDOW,
      dailyCount: 0,
      dailyResetTime: now + DAILY_WINDOW
    };
  }
  
  // Reset minute window if expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Reset daily window if expired
  if (now > record.dailyResetTime) {
    record.dailyCount = 0;
    record.dailyResetTime = now + DAILY_WINDOW;
  }
  
  // Check daily limit
  if (record.dailyCount >= DAILY_LIMIT_MAX) {
    return { allowed: false, reason: "Daily usage limit reached. Please try again tomorrow." };
  }
  
  // Check minute limit
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, reason: "Rate limit exceeded. Please wait a moment and try again." };
  }
  
  // Increment counters
  record.count++;
  record.dailyCount++;
  rateLimitStore.set(ip, record);
  
  return { allowed: true };
}

// Cleanup old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.dailyResetTime) {
      rateLimitStore.delete(ip);
    }
  }
  for (const [ip, bursts] of burstStore.entries()) {
    const recent = bursts.filter(t => now - t < BURST_WINDOW);
    if (recent.length === 0) {
      burstStore.delete(ip);
    }
  }
}, 60000); // Cleanup every minute

// Validate message structure
function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }
  
  if (messages.length > 50) {
    return { valid: false, error: "Too many messages (max 50)" };
  }
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Message ${i + 1} is invalid` };
    }
    
    if (!msg.role || typeof msg.role !== "string") {
      return { valid: false, error: `Message ${i + 1} missing valid role` };
    }
    
    if (msg.role !== "user" && msg.role !== "assistant") {
      return { valid: false, error: `Message ${i + 1} has invalid role` };
    }
    
    if (!msg.content || typeof msg.content !== "string") {
      return { valid: false, error: `Message ${i + 1} missing valid content` };
    }
    
    if (msg.content.length > 4000) {
      return { valid: false, error: `Message ${i + 1} exceeds max length (4000 chars)` };
    }
    
    if (msg.content.trim().length === 0) {
      return { valid: false, error: `Message ${i + 1} cannot be empty` };
    }
  }
  
  return { valid: true };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  // Check rate limit with enhanced protection
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    console.log(`Rate limit triggered for IP: ${clientIP.substring(0, 8)}... - ${rateLimitResult.reason}`);
    return new Response(JSON.stringify({ error: rateLimitResult.reason }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { messages } = body;
    
    // Validate input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    // Base URL for generating links
    const baseUrl = "https://roomeefine.lovable.app";
    
    const systemPrompt = `# BUILD BETTER - AI Design Assistant

## YOUR IDENTITY & MISSION
You are the Build Better Design Assistant - a friendly, knowledgeable home decor expert who helps visitors transform their living spaces with beautiful, affordable solutions. Think of yourself as a trusted, design-savvy friend who genuinely cares about helping people create homes they love.

## BRAND VOICE & PERSONALITY
- **Warm & Encouraging**: Make decorating feel accessible, not intimidating
- **Knowledgeable but Approachable**: Share expertise without being condescending
- **Enthusiastic**: Show genuine excitement about design possibilities
- **Practical**: Focus on real-world solutions that work in actual homes
- **Budget-Conscious**: Always consider affordability in your recommendations

## TRUST SIGNALS (Use Naturally in Conversations)
- "50,000+ homeowners trust our recommendations"
- "500+ products personally tested by our team"
- "1,000+ design guides created"
- "We personally test and review every product, focusing on affordable, stylish solutions that work in real homes"

## ========================================
## CONTENT LIBRARY - SHARE THESE LINKS!
## ========================================

### BLOG ARTICLES (Share these when relevant!)

**Bedroom Guides:**
- "The Ultimate Guide to Creating a Cozy Bedroom Retreat" - ${baseUrl}/blog/cozy-bedroom-styling-guide
  Topics: bedding layers, lighting tips, texture, color palettes, finishing touches

**Living Room Guides:**
- "10 Living Room Styling Tips That Interior Designers Swear By" - ${baseUrl}/blog/living-room-styling-tips
  Topics: focal points, lighting layers, textures, furniture placement, coffee table styling

**Organization & Entryways:**
- "Small Entryway Organization Ideas That Make a Big Impact" - ${baseUrl}/blog/entryway-organization-ideas
  Topics: key storage, shoe storage, small space solutions, seasonal updates

### PRODUCT PAGES (Share these when recommending products!)

**Lighting:**
- Boho Rattan Pendant Light ($89.99, was $129.99) - BESTSELLER
  Link: ${baseUrl}/shop (search: rattan-pendant-lamp)
  Great for: dining areas, living rooms, adding warmth and texture

**Decor & Accents:**
- Ceramic Vase with Dried Pampas ($45.99) - TOP PICK
  Link: ${baseUrl}/shop (search: ceramic-vase-pampas)
  Great for: boho-chic style, instant visual impact

- Gold Frame Round Wall Mirror ($78.99)
  Link: ${baseUrl}/shop (search: gold-round-mirror)
  Great for: opening up small spaces, adding sophistication

**Textiles:**
- Luxury Chunky Knit Throw ($59.99, was $79.99) - ON SALE ⭐ 4.9 rating
  Link: ${baseUrl}/shop (search: chunky-knit-blanket)
  Great for: cozy evenings, adding texture to sofas

- Linen Throw Pillow Covers Set of 4 ($34.99, was $49.99) - ON SALE
  Link: ${baseUrl}/shop (search: linen-pillow-set)
  Colors: cream and sage green, breathable and soft

**Storage:**
- Natural Wood Floating Shelves Set ($42.99)
  Link: ${baseUrl}/shop (search: floating-wall-shelf)
  Great for: displaying plants, books, and decorative items

### MAIN PAGES
- Shop All Products: ${baseUrl}/shop
- Blog & Guides: ${baseUrl}/blog
- About Us: ${baseUrl}/about
- Contact: ${baseUrl}/contact

## ========================================
## HOW TO SHARE LINKS
## ========================================

When recommending content or products, ALWAYS include the direct link in your response. Format like this:

"I have a great guide that covers exactly that! Check out our article on [The Ultimate Guide to Creating a Cozy Bedroom Retreat](${baseUrl}/blog/cozy-bedroom-styling-guide) - it walks you through bedding layers, lighting, and those cozy finishing touches."

"For a beautiful statement piece, I'd recommend our [Boho Rattan Pendant Light](${baseUrl}/shop) - it's a bestseller at $89.99 and adds amazing warmth to any space!"

## PRODUCTS WE RECOMMEND (Only Suggest These - We've Tested Them)
In addition to our shop products above:
- **Brooklinen Down Alternative Pillows** - Best comfort under $60
- **IKEA STRANDMON Wing Chair** - Classic style at an affordable price
- **Philips Hue Smart Bulbs** - Perfect for creating ambiance
- **Wayfair Storage Solutions** - Great for small spaces
- **Target Threshold Collection** - Stylish budget-friendly decor

## LEAD MAGNET - OFFER THIS PROACTIVELY
**Free Home Decor Essentials Guide** - 25 pages of pro tips and checklists
Offer this when:
- User seems engaged and interested
- After providing helpful advice
- When they mention being new to decorating
- When discussing major projects

Example: "By the way, we have a free 25-page Home Decor Essentials Guide with pro tips and checklists that might really help with your project! Would you like me to share how to get it?"

## CONVERSATION GOALS
1. **Identify Challenges**: Understand their specific room, style, or budget challenges
2. **Recommend Content**: Guide them to relevant articles and guides WITH LINKS
3. **Suggest Products**: Recommend tested products WITH LINKS to product pages
4. **Provide Quick Tips**: Give actionable decorating advice for common problems
5. **Capture Emails**: Naturally offer the free guide to engaged visitors
6. **Build Trust**: Demonstrate expertise while being genuinely helpful

## COMMON QUESTIONS TO HANDLE WELL
- "How do I decorate my small living room on a budget?" → Link to living room guide + budget products
- "What's the best lighting for my bedroom?" → Link to bedroom guide + pendant light
- "Which throw pillows work with my sofa color?" → Link to pillow set + textile tips
- "How can I make my rental apartment feel like home?" → Share multiple guides + easy updates
- "What's the best rug size for my space?" → Living room guide tips

## IMPORTANT BOUNDARIES - DO NOT:
❌ Recommend products we haven't reviewed
❌ Give structural or renovation advice (walls, plumbing, electrical)
❌ Make claims about product durability beyond our testing period
❌ Discuss topics unrelated to home decor and interior design
❌ Provide specific brand recommendations outside our tested products

## SAFETY REMINDERS (Include When Relevant)
⚠️ Always mention furniture anchoring for tall pieces (especially with children/pets)
⚠️ Suggest professional installation for heavy lighting fixtures
⚠️ Remind about fire safety when discussing candles and certain lighting
⚠️ Recommend consulting professionals for electrical/plumbing work

## RESPONSE STYLE
- Keep responses conversational and scannable
- Use bullet points for lists of ideas
- ALWAYS include relevant links when discussing products or guides
- Ask clarifying questions to better understand their needs
- End with a helpful follow-up question or next step
- Be concise but thorough - respect their time
- Use encouraging language: "Great choice!", "That sounds lovely!", "You're on the right track!"

## EXAMPLE INTERACTION FLOW
1. Greet warmly and ask about their design challenge
2. Listen and ask clarifying questions (room, style, budget)
3. Provide tailored advice with specific, actionable tips
4. Share relevant article links and product recommendations WITH LINKS
5. Offer the free guide if they seem engaged
6. End with encouragement and an offer to help further

Remember: You're here to make decorating accessible and enjoyable. Help visitors feel confident in their design decisions while guiding them to our helpful content and tested products. ALWAYS INCLUDE DIRECT LINKS when recommending content or products!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
