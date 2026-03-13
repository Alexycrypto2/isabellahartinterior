import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if digest is enabled
    const { data: digestSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "weekly_digest")
      .maybeSingle();

    const config = (digestSetting?.value as Record<string, any>) || {};
    if (config.enabled === false) {
      return new Response(
        JSON.stringify({ message: "Weekly digest is disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    const now = new Date();
    const weekEnd = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const weekStart = weekAgo.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // --- Top Products by affiliate clicks ---
    const { data: productClicks } = await supabase
      .from("analytics_events")
      .select("entity_id, entity_name, referrer")
      .eq("event_type", "product_click")
      .gte("created_at", weekAgoISO);

    const productMap = new Map<string, { name: string; clicks: number; sources: Record<string, number> }>();
    for (const click of productClicks || []) {
      const id = click.entity_id || "unknown";
      const entry = productMap.get(id) || { name: click.entity_name || "Unknown", clicks: 0, sources: {} };
      entry.clicks++;
      const srcMatch = click.referrer?.match(/utm_source=([^|]+)/);
      const src = srcMatch?.[1] || "direct";
      entry.sources[src] = (entry.sources[src] || 0) + 1;
      productMap.set(id, entry);
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // --- Top Blog Posts by views ---
    const { data: blogViews } = await supabase
      .from("analytics_events")
      .select("entity_id, entity_name")
      .eq("event_type", "blog_view")
      .gte("created_at", weekAgoISO);

    const blogMap = new Map<string, { name: string; views: number }>();
    for (const view of blogViews || []) {
      const id = view.entity_id || "unknown";
      const entry = blogMap.get(id) || { name: view.entity_name || "Unknown", views: 0 };
      entry.views++;
      blogMap.set(id, entry);
    }

    const topBlogs = Array.from(blogMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // --- Page views ---
    const { count: totalPageViews } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "page_view")
      .gte("created_at", weekAgoISO);

    // --- Unique visitors ---
    const { data: visitorData } = await supabase
      .from("analytics_events")
      .select("visitor_id")
      .eq("event_type", "page_view")
      .gte("created_at", weekAgoISO);
    const uniqueVisitors = new Set((visitorData || []).map(v => v.visitor_id)).size;

    // --- New subscribers this week ---
    const { count: newSubscribers } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .gte("subscribed_at", weekAgoISO);

    // --- Total active subscribers ---
    const { count: totalSubscribers } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // --- New blog posts this week ---
    const { count: newPosts } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .gte("created_at", weekAgoISO);

    // --- New products this week ---
    const { count: newProducts } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", weekAgoISO);

    // --- Contact submissions this week ---
    const { count: newContacts } = await supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgoISO);

    const totalClicks = (productClicks || []).length;
    const totalBlogViews = (blogViews || []).length;

    const productRows = topProducts.length > 0
      ? topProducts.map((p, i) => {
          const topSource = Object.entries(p.sources).sort((a, b) => b[1] - a[1])[0];
          return `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">${i + 1}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333;">${p.name}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #d4a853; font-weight: 700;">${p.clicks}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">${topSource ? topSource[0] : "—"}</td>
            </tr>`;
        }).join("")
      : `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #999;">No product clicks this week</td></tr>`;

    const blogRows = topBlogs.length > 0
      ? topBlogs.map((b, i) => `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #888; font-size: 13px;">${i + 1}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333;">${b.name}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #d4a853; font-weight: 700;">${b.views}</td>
          </tr>`).join("")
      : `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #999;">No blog views this week</td></tr>`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 0; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center; border-radius: 0 0 16px 16px;">
          <h1 style="color: #ffffff; font-size: 26px; margin: 0 0 4px; font-weight: 700;">📊 Weekly Performance Digest</h1>
          <p style="color: #d4a853; font-size: 14px; margin: 0; font-weight: 500;">${weekStart} — ${weekEnd}</p>
        </div>

        <div style="padding: 24px;">
          <!-- Summary Cards Row 1 -->
          <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 8px;">
            <tr>
              <td style="width: 25%; text-align: center; padding: 16px 8px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                <div style="font-size: 28px; font-weight: 700; color: #1a1a2e;">${uniqueVisitors}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Visitors</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 16px 8px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                <div style="font-size: 28px; font-weight: 700; color: #1a1a2e;">${totalPageViews ?? 0}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Page Views</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 16px 8px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                <div style="font-size: 28px; font-weight: 700; color: #d4a853;">${totalClicks}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Clicks</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 16px 8px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px;">
                <div style="font-size: 28px; font-weight: 700; color: #1a1a2e;">${totalBlogViews}</div>
                <div style="font-size: 11px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">Blog Views</div>
              </td>
            </tr>
          </table>

          <!-- Summary Cards Row 2 -->
          <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 24px;">
            <tr>
              <td style="width: 25%; text-align: center; padding: 12px 8px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
                <div style="font-size: 22px; font-weight: 700; color: #16a34a;">+${newSubscribers ?? 0}</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">New Subs</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 12px 8px; background: #fefce8; border-radius: 12px; border: 1px solid #fde68a;">
                <div style="font-size: 22px; font-weight: 700; color: #ca8a04;">${totalSubscribers ?? 0}</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">Total Subs</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 12px 8px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe;">
                <div style="font-size: 22px; font-weight: 700; color: #2563eb;">${newPosts ?? 0}</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">New Posts</div>
              </td>
              <td style="width: 25%; text-align: center; padding: 12px 8px; background: #fdf2f8; border-radius: 12px; border: 1px solid #fbcfe8;">
                <div style="font-size: 22px; font-weight: 700; color: #db2777;">${newContacts ?? 0}</div>
                <div style="font-size: 10px; color: #666; margin-top: 2px;">Messages</div>
              </td>
            </tr>
          </table>

          <!-- Top Products -->
          <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #d4a853; padding-bottom: 8px; margin-bottom: 12px;">🛒 Top Products by Clicks</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <thead>
              <tr style="background: #fafafa;">
                <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; font-weight: 600;">#</th>
                <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; font-weight: 600;">Product</th>
                <th style="padding: 8px 12px; text-align: center; color: #888; font-size: 12px; font-weight: 600;">Clicks</th>
                <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; font-weight: 600;">Top Source</th>
              </tr>
            </thead>
            <tbody>${productRows}</tbody>
          </table>

          <!-- Top Blog Posts -->
          <h2 style="color: #1a1a2e; font-size: 18px; border-bottom: 2px solid #d4a853; padding-bottom: 8px; margin-bottom: 12px;">📝 Top Blog Posts by Views</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <thead>
              <tr style="background: #fafafa;">
                <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; font-weight: 600;">#</th>
                <th style="padding: 8px 12px; text-align: left; color: #888; font-size: 12px; font-weight: 600;">Post Title</th>
                <th style="padding: 8px 12px; text-align: center; color: #888; font-size: 12px; font-weight: 600;">Views</th>
              </tr>
            </thead>
            <tbody>${blogRows}</tbody>
          </table>

          <!-- Growth Summary -->
          ${(newProducts ?? 0) > 0 ? `
          <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #1a1a2e; font-size: 14px; margin: 0 0 8px; font-weight: 600;">📦 Catalog Growth</h3>
            <p style="color: #666; font-size: 13px; margin: 0;">${newProducts} new product${(newProducts ?? 0) > 1 ? 's' : ''} added to your shop this week.</p>
          </div>
          ` : ''}

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">Sent from Isabelle Hart Interiors Weekly Digest • Real visitors only (admin views excluded)</p>
          </div>
        </div>
      </div>
    `;

    // Resolve email
    let siteEmail = config.email || Deno.env.get("CONTACT_EMAIL") || "ayubadesina3@gmail.com";
    if (!config.email) {
      const { data: contactSetting } = await supabase
        .from("site_settings").select("value").eq("key", "contact").maybeSingle();
      const cc = (contactSetting?.value as Record<string, any>) || {};
      siteEmail = cc.notification_email || cc.email || siteEmail;
    }
    const resend = new Resend(resendApiKey);

    const { error: sendError } = await resend.emails.send({
      from: "RoomRefine Digest <onboarding@resend.dev>",
      to: [siteEmail],
      subject: `📊 Weekly Digest: ${uniqueVisitors} visitors, ${totalClicks} clicks, ${totalBlogViews} blog views (${weekStart} – ${weekEnd})`,
      html: emailHtml,
    });

    if (sendError) throw new Error(`Failed to send email: ${sendError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        unique_visitors: uniqueVisitors,
        page_views: totalPageViews ?? 0,
        affiliate_clicks: totalClicks,
        blog_views: totalBlogViews,
        new_subscribers: newSubscribers ?? 0,
        total_subscribers: totalSubscribers ?? 0,
        new_posts: newPosts ?? 0,
        new_contacts: newContacts ?? 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Weekly digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
