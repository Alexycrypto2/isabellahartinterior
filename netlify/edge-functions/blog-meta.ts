// Injects each article's own title, description, canonical and Open Graph tags
// into the raw HTML for /blog/:slug, so crawlers see them without running JavaScript
// and without waiting for a redeploy.
const SUPABASE_URL = "https://hgjqfmechyneaqhipilt.supabase.co";
const KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnanFmbWVjaHluZWFxaGlwaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTIzNzgsImV4cCI6MjA4MjU4ODM3OH0.GTaIF41veNzl3X29cC9VjEj7uaNK0Ej9s02vZ59HWxE";
const SITE = "https://isabellehartinteriors.com";

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/blog\/([^/]+)\/?$/);
  const response = await context.next();
  if (!m) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const slug = decodeURIComponent(m[1]);
  let post: any = null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=title,slug,excerpt,meta_title,meta_description,image_url&published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
    );
    if (r.ok) post = (await r.json())[0];
  } catch { /* fall through */ }
  if (!post) return response;

  const title = esc(post.meta_title || post.title);
  const desc = esc(post.meta_description || post.excerpt || "");
  const canonical = `${SITE}/blog/${post.slug}`;
  const image = esc(post.image_url || "");

  let html = await response.text();
  // Remove existing generic tags, then add the article's own
  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:(title|description|url|image|type)"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:(title|description|image|card)"[^>]*>/gi, "");

  const tags = `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    ${image ? `<meta property="og:image" content="${image}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    ${image ? `<meta name="twitter:image" content="${image}" />` : ""}`;
  html = html.replace(/<head([^>]*)>/i, `<head$1>${tags}`);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, headers });
};

export const config = { path: "/blog/*" };
