import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting broken link check...");

    // Get all products with affiliate URLs
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, affiliate_url")
      .eq("is_active", true);

    if (productsError) throw productsError;

    // Get all published blog posts and extract Amazon links from content
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("id, title, content")
      .eq("published", true);

    if (postsError) throw postsError;

    const linksToCheck: Array<{
      url: string;
      source_type: string;
      source_id: string;
      source_name: string;
    }> = [];

    // Add product affiliate links
    for (const product of products || []) {
      if (product.affiliate_url && product.affiliate_url.includes("amazon")) {
        linksToCheck.push({
          url: product.affiliate_url,
          source_type: "product",
          source_id: product.id,
          source_name: product.name,
        });
      }
    }

    // Extract Amazon links from blog posts
    const amazonLinkRegex = /https?:\/\/(?:www\.)?amazon\.[a-z.]+\/[^\s"'<>]+/gi;
    for (const post of posts || []) {
      const matches = post.content.match(amazonLinkRegex) || [];
      for (const url of matches) {
        linksToCheck.push({
          url: url.replace(/["\s].*$/, ""), // Clean up URL
          source_type: "blog_post",
          source_id: post.id,
          source_name: post.title,
        });
      }
    }

    console.log(`Checking ${linksToCheck.length} links...`);

    const brokenLinks: Array<{
      url: string;
      source_type: string;
      source_id: string;
      source_name: string;
      status_code: number | null;
    }> = [];

    // Check each link (with rate limiting)
    for (const link of linksToCheck) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(link.url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LinkChecker/1.0)",
          },
        });

        clearTimeout(timeout);

        // Consider 404, 410, and 5xx as broken
        if (response.status === 404 || response.status === 410 || response.status >= 500) {
          brokenLinks.push({
            ...link,
            status_code: response.status,
          });
        }
      } catch (error) {
        // Network errors or timeouts
        brokenLinks.push({
          ...link,
          status_code: null,
        });
      }

      // Rate limiting: wait 500ms between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`Found ${brokenLinks.length} broken links`);

    // Clear old resolved entries and insert/update broken links
    if (brokenLinks.length > 0) {
      for (const broken of brokenLinks) {
        // Check if this link already exists
        const { data: existing } = await supabase
          .from("broken_links")
          .select("id")
          .eq("url", broken.url)
          .eq("source_id", broken.source_id)
          .eq("is_resolved", false)
          .maybeSingle();

        if (existing) {
          // Update last_checked
          await supabase
            .from("broken_links")
            .update({ last_checked: new Date().toISOString(), status_code: broken.status_code })
            .eq("id", existing.id);
        } else {
          // Insert new broken link
          await supabase.from("broken_links").insert({
            url: broken.url,
            source_type: broken.source_type,
            source_id: broken.source_id,
            source_name: broken.source_name,
            status_code: broken.status_code,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkedCount: linksToCheck.length,
        brokenCount: brokenLinks.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error checking links:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
