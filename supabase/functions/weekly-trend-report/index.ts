import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get AI priority setting
    let aiPriority = "custom";
    let customTextConfig: any = null;
    try {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "ai_api").single();
      if (data?.value) {
        const val = data.value as any;
        aiPriority = val.priority || "custom";
        const key = val.text_api_key || val.api_key;
        if (key) customTextConfig = { provider: val.text_provider || val.provider || "openai", api_key: key, model: val.text_model || val.model, endpoint: val.text_endpoint };
      }
    } catch {}

    const today = new Date();
    const weekStr = `${today.getFullYear()}-W${String(Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 604800000)).padStart(2, '0')}`;

    const systemPrompt = `You are a home decor trend analyst for Isabelle Hart Interiors. Research and identify 10 trending home decor topics for this week (${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}).

Consider seasonal trends, social media buzz, interior design movements, and consumer behavior.

Return a JSON array of exactly 10 objects, each with:
- "rank": number 1-10
- "trend": the trending topic name (short, 3-6 words)
- "description": 1-2 sentence explanation of why it's trending
- "suggested_title": a ready-to-use blog post title for this trend
- "keywords": array of exactly 3 target keywords for SEO

Return ONLY valid JSON, no markdown, no code blocks.`;

    const userContent = `Generate 10 trending home decor topics for the week of ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Consider current season, Pinterest trends, Instagram reels, TikTok home content, and interior design shows.`;

    const msgs = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    async function callLovable() {
      if (!LOVABLE_API_KEY) return null;
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: msgs }),
      });
      if (resp.status === 429) throw { status: 429, message: "Rate limit exceeded." };
      if (resp.status === 402) { console.log("Lovable credits exhausted"); return null; }
      if (!resp.ok) return null;
      return resp;
    }

    async function callCustomText() {
      if (!customTextConfig) return null;
      const provider = customTextConfig.provider;
      const model = customTextConfig.model || (provider === "openai" ? "gpt-4o-mini" : provider === "google" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514");
      const url = provider === "custom" && customTextConfig.endpoint ? customTextConfig.endpoint
        : provider === "google" ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        : provider === "anthropic" ? "https://api.anthropic.com/v1/messages"
        : "https://api.openai.com/v1/chat/completions";

      if (provider === "anthropic") {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "x-api-key": customTextConfig.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
          body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: userContent }] }),
        });
        if (!resp.ok) return null;
        const d = await resp.json();
        return { directContent: d.content?.[0]?.text || "[]" };
      }

      const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${customTextConfig.api_key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: msgs }),
      });
      if (!resp.ok) return null;
      return resp;
    }

    let response: Response | null = null;
    let directContent: string | null = null;

    try {
      if (aiPriority === "custom" && customTextConfig) {
        const result = await callCustomText();
        if (result && 'directContent' in result) {
          directContent = result.directContent;
        } else if (result) {
          response = result as Response;
        } else {
          response = await callLovable();
        }
      } else {
        response = await callLovable();
        if (!response) {
          const result = await callCustomText();
          if (result && 'directContent' in result) {
            directContent = result.directContent;
          } else if (result) {
            response = result as Response;
          }
        }
      }
    } catch (e: any) {
      if (e?.status === 429) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    let content: string;
    if (directContent) {
      content = directContent;
    } else if (response && response.ok) {
      const data = await response.json();
      content = data.choices?.[0]?.message?.content?.trim() || "[]";
    } else {
      return new Response(JSON.stringify({ error: "No AI provider available. Configure an API key in Settings → AI API." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const trends = JSON.parse(content);

    // Save to site_settings so the admin dashboard can display it
    await supabase.from("site_settings").upsert({
      key: "weekly_trends",
      value: { week: weekStr, generated_at: today.toISOString(), trends },
      updated_at: today.toISOString(),
    }, { onConflict: "key" });

    // Send email if configured
    const { data: emailSettings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "email_settings")
      .single();

    const adminEmail = (emailSettings?.value as any)?.notification_email || (emailSettings?.value as any)?.admin_email;

    if (adminEmail) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const trendsHtml = trends.map((t: any) => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:700;color:#b8860b;font-size:18px;">${t.rank}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
              <div style="font-weight:600;color:#1a1a1a;font-size:14px;margin-bottom:4px;">${t.trend}</div>
              <div style="color:#666;font-size:12px;line-height:1.4;">${t.description}</div>
              <div style="margin-top:8px;padding:8px 12px;background:#faf8f5;border-radius:6px;border-left:3px solid #b8860b;">
                <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Suggested Title</div>
                <div style="font-size:13px;color:#333;font-weight:500;">${t.suggested_title}</div>
              </div>
              <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
                ${t.keywords.map((kw: string) => `<span style="display:inline-block;padding:2px 8px;background:#f5f0e8;color:#8b7355;border-radius:12px;font-size:11px;">${kw}</span>`).join(' ')}
              </div>
            </td>
          </tr>
        `).join('');

        const emailHtml = `
        <div style="font-family:'Georgia',serif;max-width:640px;margin:0 auto;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:32px;text-align:center;">
            <h1 style="color:#b8860b;font-size:24px;margin:0 0 8px;">📊 Weekly Trend Report</h1>
            <p style="color:#ccc;font-size:14px;margin:0;">Week of ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style="padding:24px;">
            <p style="color:#555;font-size:14px;line-height:1.6;">Here are the top 10 trending home decor topics this week, curated by AI for your content strategy:</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              ${trendsHtml}
            </table>
            <div style="margin-top:24px;padding:16px;background:#faf8f5;border-radius:8px;text-align:center;">
              <p style="color:#666;font-size:13px;margin:0;">💡 Use these trends to plan your blog content and social media strategy for the week.</p>
            </div>
          </div>
          <div style="padding:16px;text-align:center;border-top:1px solid #f0f0f0;">
            <p style="color:#999;font-size:11px;margin:0;">Isabelle Hart Interiors AI Trend Report · Generated automatically every Monday</p>
          </div>
        </div>`;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Isabelle Hart Interiors <onboarding@resend.dev>",
              to: [adminEmail],
              subject: `📊 Weekly Trend Report — ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
              html: emailHtml,
            }),
          });
        } catch (emailErr) {
          console.warn("Email send failed:", emailErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, trends, week: weekStr }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Trend report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
