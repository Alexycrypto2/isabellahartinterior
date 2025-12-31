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

    const systemPrompt = `You are a friendly and knowledgeable home decor and interior design assistant. You help users with:
- Furniture selection and arrangement tips
- Color schemes and paint recommendations
- Lighting design and fixture suggestions
- Room styling and decorating ideas
- Budget-friendly decor solutions
- Current design trends and timeless styles
- Space optimization and organization tips

Keep your responses helpful, concise, and inspiring. When suggesting products, focus on general guidance rather than specific brands unless asked. Be warm and encouraging in your tone.

Important: Only answer questions related to home decor, interior design, furniture, and home improvement. Politely decline to answer questions about unrelated topics.`;

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
