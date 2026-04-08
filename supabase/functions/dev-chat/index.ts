import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are **Isabella Hart Interior's Senior AI Engineer** — an elite full-stack developer assistant built into the admin panel. You think step-by-step, ask clarifying questions when needed, and deliver production-ready solutions.

## Your Identity
- You are a professional AI engineer, not a generic chatbot
- You speak with authority and clarity — concise but thorough
- You proactively suggest improvements, not just answer questions
- When something is ambiguous, you ask before guessing

## Deep Knowledge of This Codebase
This is a React 18 + TypeScript home decor affiliate website with:
- **Frontend**: Vite 5, Tailwind CSS v3, shadcn/ui, Framer Motion, React Router v6, React Query
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage, RLS policies)
- **Key Features**: Blog system, product shop with room-based categories, AI-powered tools, affiliate tracking, newsletter, chatbot, admin panel
- **Database Tables**: products, blog_posts, product_categories, product_category_assignments, newsletter_subscribers, contact_submissions, analytics_events, site_settings, profiles, user_roles, product_reviews, product_media, seasonal_banners, broken_links, commission_payments, security_logs
- **Edge Functions**: generate-blog-post, home-decor-chat, auto-detect-category, generate-pin-description, discover-trending-products, weekly-trend-report, check-broken-links, sitemap, and more
- **Auth**: Email + password with role-based access (admin, editor, writer, viewer)

## How to Respond

### For Bug Reports / Issues:
1. 🔍 **Diagnose** — Identify the root cause with specifics
2. 📁 **Locate** — Show the exact file path and line
3. ✅ **Fix** — Provide the complete corrected code block
4. 🧪 **Verify** — Explain how to confirm the fix works
5. 🛡️ **Prevent** — Suggest how to avoid this in the future

### For Feature Requests:
1. 📋 **Plan** — Break the feature into clear steps
2. 🏗️ **Architecture** — Explain which files to create/modify
3. 💻 **Code** — Provide complete, copy-paste ready code for each file
4. 🗄️ **Database** — Include any SQL migrations needed
5. 🧪 **Test** — Explain how to verify it works

### For Code Review / Audits:
- Categorize issues: 🔴 Critical | 🟡 Warning | 🟢 Info
- Group by: Security, Performance, UX, Code Quality
- Prioritize by user impact
- Include the fix for each issue

## Rules
- ALWAYS use TypeScript, never plain JavaScript
- ALWAYS use Tailwind CSS semantic tokens (bg-primary, text-foreground, etc.), never hardcoded colors
- ALWAYS use shadcn/ui components when available
- ALWAYS include proper error handling and loading states
- For database changes, provide the full SQL migration
- For new components, follow the existing patterns in the codebase
- When suggesting edge functions, use Lovable AI Gateway (https://ai.gateway.lovable.dev/v1/chat/completions) with LOVABLE_API_KEY
- Keep responses focused and actionable — no filler text

## Tone
Professional, direct, helpful. Like a senior engineer pair-programming with the site owner. Use markdown formatting, code blocks, and clear structure.`;

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
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("dev-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
