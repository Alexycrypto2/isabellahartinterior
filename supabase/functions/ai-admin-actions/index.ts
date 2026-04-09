import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, params } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let result: any;

    switch (action) {
      case "create_product": {
        const { name, description, price, original_price, category, affiliate_url, badge, image_url, is_active, is_featured, categories } = params;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const { data, error } = await supabase.from("products").insert({
          name, description, price, original_price: original_price || null,
          category: category || "home-decor", affiliate_url: affiliate_url || `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=isabellaha0e-20`,
          badge: badge || null, image_url: image_url || null, slug,
          is_active: is_active ?? false, is_featured: is_featured ?? false,
        }).select().single();
        
        if (error) throw error;

        // Assign categories if provided
        if (categories?.length && data) {
          const assignments = categories.map((cat: string) => ({ product_id: data.id, category_slug: cat }));
          await supabase.from("product_category_assignments").insert(assignments);
        }
        
        result = { success: true, message: `Product "${name}" created (${is_active ? 'active' : 'draft'})`, product: data };
        break;
      }

      case "update_product": {
        const { id, slug: productSlug, ...updates } = params;
        const identifier = id || productSlug;
        const column = id ? "id" : "slug";
        
        const { data, error } = await supabase.from("products").update(updates).eq(column, identifier).select().single();
        if (error) throw error;
        result = { success: true, message: `Product "${data.name}" updated`, product: data };
        break;
      }

      case "create_blog_post": {
        const { title, content, excerpt, author, category, image_url, published, meta_title, meta_description } = params;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const wordCount = content?.split(/\s+/).length || 0;
        const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
        
        const { data, error } = await supabase.from("blog_posts").insert({
          title, slug, content, excerpt: excerpt || title,
          author: author || "Isabella Hart", category: category || "home-decor",
          image_url: image_url || null, published: published ?? false,
          read_time: readTime, meta_title: meta_title || title,
          meta_description: meta_description || excerpt || title,
        }).select().single();
        
        if (error) throw error;
        result = { success: true, message: `Blog post "${title}" created (${published ? 'published' : 'draft'})`, post: data };
        break;
      }

      case "update_blog_post": {
        const { id, slug: postSlug, ...updates } = params;
        const identifier = id || postSlug;
        const column = id ? "id" : "slug";
        
        const { data, error } = await supabase.from("blog_posts").update(updates).eq(column, identifier).select().single();
        if (error) throw error;
        result = { success: true, message: `Blog post "${data.title}" updated`, post: data };
        break;
      }

      case "create_category": {
        const { name, description, icon, cover_image_url } = params;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const { data, error } = await supabase.from("product_categories").insert({
          name, slug, description: description || null, icon: icon || null,
          cover_image_url: cover_image_url || null,
        }).select().single();
        
        if (error) throw error;
        result = { success: true, message: `Category "${name}" created`, category: data };
        break;
      }

      case "update_setting": {
        const { key, value } = params;
        const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
        if (error) throw error;
        result = { success: true, message: `Setting "${key}" updated` };
        break;
      }

      case "create_banner": {
        const { title, subtitle, badge_text, cta_text, cta_link, start_date, end_date, is_active } = params;
        const { data, error } = await supabase.from("seasonal_banners").insert({
          title, subtitle: subtitle || null, badge_text: badge_text || null,
          cta_text: cta_text || "Shop Now", cta_link: cta_link || "/shop",
          start_date: start_date || new Date().toISOString(),
          end_date: end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
          is_active: is_active ?? true,
        }).select().single();
        
        if (error) throw error;
        result = { success: true, message: `Banner "${title}" created`, banner: data };
        break;
      }

      case "list_products": {
        const { data, error } = await supabase.from("products").select("id, name, slug, price, category, is_active, is_featured").order("created_at", { ascending: false }).limit(params?.limit || 20);
        if (error) throw error;
        result = { success: true, products: data };
        break;
      }

      case "list_blog_posts": {
        const { data, error } = await supabase.from("blog_posts").select("id, title, slug, category, published, created_at").order("created_at", { ascending: false }).limit(params?.limit || 20);
        if (error) throw error;
        result = { success: true, posts: data };
        break;
      }

      case "list_categories": {
        const { data, error } = await supabase.from("product_categories").select("*").order("display_order");
        if (error) throw error;
        result = { success: true, categories: data };
        break;
      }

      case "list_settings": {
        const { data, error } = await supabase.from("site_settings").select("key, value");
        if (error) throw error;
        result = { success: true, settings: data };
        break;
      }

      case "delete_product": {
        const { id } = params;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        result = { success: true, message: `Product deleted` };
        break;
      }

      case "delete_blog_post": {
        const { id } = params;
        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (error) throw error;
        result = { success: true, message: `Blog post deleted` };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-admin-actions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
