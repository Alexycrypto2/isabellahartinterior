import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://roomrefine.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    // Fetch active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    const staticPages = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/shop", changefreq: "daily", priority: "0.9" },
      { loc: "/blog", changefreq: "daily", priority: "0.9" },
      { loc: "/inspiration", changefreq: "weekly", priority: "0.8" },
      { loc: "/about", changefreq: "monthly", priority: "0.6" },
      { loc: "/contact", changefreq: "monthly", priority: "0.6" },
      { loc: "/disclosure", changefreq: "yearly", priority: "0.3" },
      { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "/shipping-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "/returns-policy", changefreq: "yearly", priority: "0.3" },
    ];

    const urls = staticPages.map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    );

    // Add blog posts
    if (posts) {
      for (const post of posts) {
        urls.push(`  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    // Add product detail pages
    if (products) {
      for (const product of products) {
        urls.push(`  <url>
    <loc>${SITE_URL}/shop/${product.slug}</loc>
    <lastmod>${new Date(product.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
      }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(`Error generating sitemap: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
