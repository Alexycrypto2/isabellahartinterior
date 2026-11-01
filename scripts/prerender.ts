// Runs after `vite build`: writes static HTML for the homepage and every published
// /blog/:slug so crawlers that don't run JavaScript (Pinterest, social scrapers) see
// the real title, description, canonical, Open Graph tags and article text.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

const SITE = "https://isabellehartinteriors.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://hgjqfmechyneaqhipilt.supabase.co";
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnanFmbWVjaHluZWFxaGlwaWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTIzNzgsImV4cCI6MjA4MjU4ODM3OH0.GTaIF41veNzl3X29cC9VjEj7uaNK0Ej9s02vZ59HWxE";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const strip = (h = "") => h.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/\son\w+="[^"]*"/gi, "");

function setHead(html: string, t: { title: string; desc: string; url: string; image?: string; type: string; jsonLd?: object }) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(t.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(t.desc)}">`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${t.url}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(t.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(t.desc)}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${t.type}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${t.url}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(t.title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(t.desc)}" />`);
  let extra = "";
  if (t.image) extra += `<meta property="og:image" content="${esc(t.image)}" /><meta name="twitter:image" content="${esc(t.image)}" />`;
  if (t.jsonLd) extra += `<script type="application/ld+json">${JSON.stringify(t.jsonLd).replace(/</g, "\\u003c")}</script>`;
  return out.replace("</head>", `${extra}</head>`);
}

async function main() {
  const shellPath = resolve("dist/index.html");
  if (!existsSync(shellPath)) return console.warn("prerender: dist/index.html missing, skipped");
  const shell = readFileSync(shellPath, "utf8");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=title,slug,excerpt,content,meta_title,meta_description,image_url,created_at,updated_at&published=eq.true&order=created_at.desc`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const posts: any[] = res.ok ? await res.json() : [];

  // Homepage: canonical + list of latest articles as crawlable links
  const list = posts.slice(0, 20).map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a></li>`).join("");
  writeFileSync(shellPath, shell.replace('<div id="root"></div>', `<div id="root"><noscript><h1>Isabelle Hart Interiors</h1><ul>${list}</ul></noscript></div>`));

  for (const p of posts) {
    const url = `${SITE}/blog/${p.slug}`;
    const title = `${p.meta_title || p.title} | Isabelle Hart Interiors`;
    const desc = p.meta_description || p.excerpt || "";
    let html = setHead(shell, {
      title, desc, url, image: p.image_url, type: "article",
      jsonLd: { "@context": "https://schema.org", "@type": "BlogPosting", "@id": url, headline: p.title, description: desc, image: p.image_url, datePublished: p.created_at, dateModified: p.updated_at || p.created_at, mainEntityOfPage: url, author: { "@type": "Organization", name: "Isabelle Hart Interiors" } },
    });
    // Article text inside #root; React replaces it on load for human visitors.
    html = html.replace('<div id="root"></div>', `<div id="root"><article><h1>${esc(p.title)}</h1>${strip(p.content || "")}</article></div>`);
    const dir = resolve(`dist/blog/${p.slug}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/index.html`, html);
  }
  console.log(`prerender: wrote homepage + ${posts.length} articles`);
}
main().catch((e) => console.warn("prerender failed", e));
