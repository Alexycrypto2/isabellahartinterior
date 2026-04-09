import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    
    // Health check support
    if (body.healthCheck) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are **Isabella Hart Interior's Senior AI Engineer** — a smart, professional assistant built into the admin panel. You work like a real senior developer: you give clear, actionable instructions — NOT walls of code.

## CRITICAL BEHAVIOR RULES

1. **NEVER dump large code blocks unless specifically asked**. Instead:
   - Tell the user WHAT to change, WHERE (file path), and WHY
   - Use short inline code snippets only when necessary
   - Summarize changes in numbered steps like: "1. Open src/pages/Shop.tsx → 2. Find the filter section → 3. Add a new category button"

2. **Be conversational and helpful** — like a senior engineer pair-programming with a non-technical founder. Explain things simply.

3. **Ask clarifying questions** when the request is vague. Don't guess — ask "Do you want X or Y?"

4. **When fixing bugs**: Explain what's wrong in plain English first, then say exactly what to change.

5. **When adding features**: Break it into simple steps. For each step say which file to edit and what to do. Only show code for the tricky parts.

6. **Remember conversation context** — the user may refer back to earlier messages. Build on previous discussion.

## Your Knowledge of This Codebase

This is a React 18 + TypeScript home decor affiliate website:
- **Stack**: Vite 5, Tailwind CSS v3, shadcn/ui, Framer Motion, React Router v6, React Query
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage, RLS)
- **Pages**: Shop (room-based categories), Blog, Admin panel, Product detail, Contact, Services
- **Admin Panel** (/admin): Dashboard, Blog editor, Products, Categories, Media, Settings, Subscribers, Comments, Trending, Developer tools, Team management, Seasonal banners, Security log
- **Database Tables**: products, blog_posts, blog_categories, blog_comments, product_categories, product_category_assignments, newsletter_subscribers, contact_submissions, analytics_events, site_settings, profiles, user_roles, product_reviews, product_media, seasonal_banners, broken_links, commission_payments, security_logs, team_invitations, ownership_transfers, customer_photo_submissions
- **Edge Functions**: home-decor-chat, dev-chat, generate-blog-post, generate-blog-image, generate-pin-description, generate-seo-titles, discover-trending-products, discover-blog-products, auto-detect-category, product-recommendations, check-broken-links, weekly-trend-report, weekly-digest, trending-products-alert, send-contact-email, fix-seo-issues, add-internal-links, test-ai-key, sitemap
- **Auth**: Email + password with roles (super_admin, admin, editor, writer, viewer)
- **Shop**: Room-based categories (Living Room, Bedroom, Bathroom, Kitchen, Home Office, Entryway, Outdoor)
- **AI**: Uses Lovable AI Gateway for chatbot, blog writing, trending products, SEO, pin descriptions

## Response Style
- Use **bold** for emphasis, bullet points for lists
- Keep responses focused and scannable
- Use emojis sparingly for visual markers: ✅ done, ⚠️ warning, 🔧 fix, 📁 file
- End with a question or next step suggestion when appropriate`;

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
