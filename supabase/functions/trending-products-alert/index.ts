import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_THRESHOLD = 10;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read alert settings from site_settings
    const { data: alertSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "affiliate_alerts")
      .maybeSingle();

    const alertConfig = (alertSetting?.value as Record<string, any>) || {};
    const isEnabled = alertConfig.enabled ?? true;
    const DAILY_CLICK_THRESHOLD = alertConfig.threshold ?? DEFAULT_THRESHOLD;
    const customEmail = alertConfig.email || null;

    if (!isEnabled) {
      return new Response(
        JSON.stringify({ message: "Alerts are disabled", alerts_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get today's start timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch today's product_click events
    const { data: clicks, error: fetchError } = await supabase
      .from("analytics_events")
      .select("entity_id, entity_name, referrer")
      .eq("event_type", "product_click")
      .gte("created_at", todayStart.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch analytics: ${fetchError.message}`);
    }

    if (!clicks || clicks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No clicks today", alerts_sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Aggregate clicks by product
    const productMap = new Map<string, { name: string; count: number; sources: Record<string, number> }>();

    for (const click of clicks) {
      const id = click.entity_id || "unknown";
      const existing = productMap.get(id) || { name: click.entity_name || "Unknown", count: 0, sources: {} };
      existing.count++;

      // Parse UTM source from referrer/metadata
      const sourceMatch = click.referrer?.match(/utm_source=([^|]+)/);
      const source = sourceMatch?.[1] || "direct";
      existing.sources[source] = (existing.sources[source] || 0) + 1;

      productMap.set(id, existing);
    }

    // Filter products exceeding threshold
    const trending = Array.from(productMap.entries())
      .filter(([, data]) => data.count >= DAILY_CLICK_THRESHOLD)
      .sort((a, b) => b[1].count - a[1].count);

    if (trending.length === 0) {
      return new Response(
        JSON.stringify({ message: "No products exceeded threshold", total_clicks: clicks.length, threshold: DAILY_CLICK_THRESHOLD }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build email HTML
    const productRows = trending
      .map(([, data]) => {
        const sourceBreakdown = Object.entries(data.sources)
          .sort((a, b) => b[1] - a[1])
          .map(([src, cnt]) => `${src}: ${cnt}`)
          .join(", ");

        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; color: #333;">${data.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #d4a853; font-weight: 700; font-size: 18px;">${data.count}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666; font-size: 13px;">${sourceBreakdown}</td>
          </tr>`;
      })
      .join("");

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #d4a853; padding-bottom: 10px;">🔥 Trending Products Alert</h2>
        <p style="color: #555;">The following products exceeded <strong>${DAILY_CLICK_THRESHOLD} affiliate clicks</strong> today (${todayStart.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}):</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="padding: 10px; text-align: left; color: #555;">Product</th>
              <th style="padding: 10px; text-align: center; color: #555;">Clicks</th>
              <th style="padding: 10px; text-align: left; color: #555;">Sources</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>
        <p style="color: #555;">Total affiliate clicks today: <strong>${clicks.length}</strong></p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Sent from Isabelle Hart Interiors Trending Products Monitor</p>
      </div>
    `;

    // Resolve email: alert override → contact notification_email → contact email → env fallback
    let siteEmail = customEmail || Deno.env.get("CONTACT_EMAIL") || "ayubadesina3@gmail.com";
    if (!customEmail) {
      const { data: contactSetting } = await supabase
        .from("site_settings").select("value").eq("key", "contact").maybeSingle();
      const cc = (contactSetting?.value as Record<string, any>) || {};
      siteEmail = cc.notification_email || cc.email || siteEmail;
    }
    const resend = new Resend(resendApiKey);

    const { error: sendError } = await resend.emails.send({
      from: "RoomRefine Alerts <onboarding@resend.dev>",
      to: [siteEmail],
      subject: `🔥 ${trending.length} product${trending.length > 1 ? "s" : ""} trending today — ${trending[0][1].count} clicks on "${trending[0][1].name}"`,
      html: emailHtml,
    });

    if (sendError) {
      throw new Error(`Failed to send email: ${sendError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, trending_count: trending.length, total_clicks: clicks.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Trending products alert error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
