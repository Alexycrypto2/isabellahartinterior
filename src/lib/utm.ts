/**
 * Append UTM tracking parameters to affiliate URLs.
 * 
 * @param url - The base affiliate URL
 * @param source - Where on the site the link appears (e.g. "homepage", "shop", "blog")
 * @param medium - The type of placement (e.g. "featured-grid", "quick-view", "product-card")
 * @param campaign - Optional campaign name override (defaults to "roomrefine")
 * @returns URL with UTM params appended
 */
export function withUtm(
  url: string,
  source: string,
  medium: string,
  campaign = "roomrefine"
): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    // If URL is malformed, append as query string
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
  }
}
