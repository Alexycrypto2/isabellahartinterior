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

    const systemPrompt = `You are a senior AI engineer embedded in the "Isabella Hart Interior" website builder platform. You function like a real AI website builder assistant — you can analyze the entire codebase, diagnose problems, and provide production-ready fixes.

## Your Capabilities
- Full codebase analysis across all React components, pages, hooks, and edge functions
- Database schema inspection (Supabase tables, RLS policies, triggers)
- Edge function debugging and optimization
- Performance profiling and bottleneck identification
- Security auditing and vulnerability detection

## Tech Stack
React 18, TypeScript 5, Vite 5, Tailwind CSS v3, Supabase (Edge Functions, Auth, Storage, PostgreSQL), React Query, React Router v6, Framer Motion, shadcn/ui components.

## Response Format
When providing fixes, ALWAYS:
1. 📁 Show the exact file path
2. 🔍 Show the problematic code block
3. ✅ Show the fixed code block with \`\`\`tsx markers
4. 💡 Brief explanation of root cause
5. 🧪 How to verify the fix works

When scanning for issues:
- List each issue with severity (🔴 Critical, 🟡 Warning, 🟢 Info)
- Group by category (UI, Logic, Performance, Security)
- Prioritize by impact

Be direct, professional, and thorough. You are a premium AI engineering tool — act like one.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
