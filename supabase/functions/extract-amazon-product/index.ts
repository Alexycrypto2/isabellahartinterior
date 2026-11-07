import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TAG = "roomrefine-20";
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

const cleanTitle = (t: string) => {
  let x = decode(t).replace(/^Amazon\.com\s*:\s*/i, "").replace(/\s*:\s*[^:]*$/, (m) => (m.length < 40 ? "" : m));
  x = x.split(/\s[|,–-]\s|,\s(?=[A-Z0-9])/)[0];
  return x.length > 90 ? x.slice(0, 90).replace(/\s\S*$/, "") : x;
};

const CATS: [RegExp, string][] = [
  [/lamp|light|sconce|chandelier|pendant|bulb/i, "Lighting"],
  [/rug|runner|mat\b/i, "Rugs"],
  [/candle|diffuser|fragrance/i, "Candles & Fragrance"],
  [/pillow|throw|blanket|curtain|duvet|sheet|towel|linen/i, "Textiles"],
  [/planter|plant|vase/i, "Plants & Planters"],
  [/wall art|print|poster|canvas|mirror|frame/i, "Wall Art"],
  [/basket|storage|organizer|shelf|bin/i, "Storage"],
  [/chair|table|sofa|stool|bench|nightstand|desk|cabinet|ottoman/i, "Furniture"],
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const input = String(body?.url || "").trim();
    if (!/^https?:\/\/([a-z0-9-]+\.)*(amazon\.[a-z.]+|amzn\.to|amzn\.eu|a\.co)\//i.test(input) || input.length > 2000) {
      return json({ error: "Please paste a valid Amazon link (amazon.com or amzn.to)." }, 400);
    }

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    };
    let finalUrl = input;
    let html = "";
    try {
      const r = await fetch(input, { headers, redirect: "follow" });
      finalUrl = r.url || input;
      html = await r.text();
    } catch { /* blocked */ }

    // Firecrawl fallback/primary: bypasses Amazon bot blocking
    try {
      let fcKey = Deno.env.get("FIRECRAWL_API_KEY") || "";
      if (!fcKey) {
        const { createClient } = await import("npm:@supabase/supabase-js@2");
        const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const { data } = await sb.from("site_settings").select("value").eq("key", "firecrawl").maybeSingle();
        fcKey = (data?.value as any)?.api_key || "";
      }
      if (fcKey && (!html || !/id="productTitle"/.test(html))) {
        const fr = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url: finalUrl, formats: ["rawHtml"], onlyMainContent: false, proxy: "stealth" }),
        });
        const fd = await fr.json().catch(() => ({}));
        if (!fr.ok) console.error("Firecrawl failed", fr.status, JSON.stringify(fd).slice(0, 300));
        const raw = fd?.data?.rawHtml || fd?.rawHtml || "";
        if (raw) { html = raw; finalUrl = fd?.data?.metadata?.url || fd?.data?.metadata?.sourceURL || finalUrl; }
      }
    } catch (e) { console.error("Firecrawl error", e); }

    const asin = (finalUrl.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i) || html.match(/data-asin="([A-Z0-9]{10})"/) || [])[1] || "";
    const host = (() => { try { return new URL(finalUrl).hostname.replace(/^smile\./, "www."); } catch { return "www.amazon.com"; } })();
    const base = /amazon\./.test(host) ? host : "www.amazon.com";
    const affiliate_url = asin ? `https://${base}/dp/${asin}?tag=${TAG}` : (() => { const u = new URL(finalUrl); u.searchParams.set("tag", TAG); return u.toString(); })();

    const pick = (re: RegExp) => { const m = html.match(re); return m ? decode(m[1]) : ""; };
    const rawTitle = pick(/id="productTitle"[^>]*>([\s\S]*?)<\/span>/) || pick(/<meta name="title" content="([^"]+)"/) || pick(/<title>([\s\S]*?)<\/title>/);
    let image_url = pick(/"hiRes":"(https:[^"]+)"/) || pick(/data-old-hires="(https:[^"]+)"/) || pick(/<meta property="og:image" content="([^"]+)"/) || pick(/id="landingImage"[^>]*src="(https:[^"]+)"/);
    if (!image_url) { const d = html.match(/data-a-dynamic-image="([^"]+)"/); if (d) { try { image_url = Object.keys(JSON.parse(decode(d[1])))[0] || ""; } catch {} } }
    const priceRaw = pick(/class="a-offscreen">\s*([$£€][\d,.]+)/) || pick(/"priceAmount":([\d.]+)/);
    const price = priceRaw && !/^[$£€]/.test(priceRaw) ? `$${priceRaw}` : priceRaw;
    const ratingStr = pick(/([\d.]+) out of 5 stars/);
    const reviewsStr = pick(/id="acrCustomerReviewText"[^>]*>([\d,]+)/);
    const description = pick(/<meta name="description" content="([^"]+)"/).slice(0, 300);

    const blocked = !rawTitle || /robot|captcha|sorry/i.test(rawTitle);
    const name = blocked ? (asin ? `Amazon product ${asin}` : "Amazon product") : cleanTitle(rawTitle);
    const category = CATS.find(([re]) => re.test(name))?.[1] || "Decor & Accents";

    return json({
      name,
      full_title: blocked ? "" : decode(rawTitle),
      asin,
      price: blocked ? "" : price,
      image_url: blocked ? "" : image_url,
      rating: ratingStr ? Number(ratingStr) : null,
      reviews: reviewsStr ? Number(reviewsStr.replace(/,/g, "")) : null,
      description: blocked ? "" : description,
      category,
      affiliate_url,
      partial: blocked || !image_url || !price,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Failed to read Amazon link" }, 500);
  }
});
