// Runs before dev/build: copies the live dynamic sitemap (backend function) into public/sitemap.xml
// so the standard /sitemap.xml address works on any host. Keeps the existing file if fetch fails.
import { writeFileSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

const env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const projectId =
  process.env.VITE_SUPABASE_PROJECT_ID ||
  env.match(/VITE_SUPABASE_PROJECT_ID="?([^"\n]+)"?/)?.[1];

async function main() {
  if (!projectId) return console.warn("sitemap: no project id, skipped");
  try {
    const res = await fetch(`https://${projectId}.supabase.co/functions/v1/sitemap`);
    const xml = await res.text();
    if (!res.ok || !xml.includes("<urlset")) throw new Error(`status ${res.status}`);
    writeFileSync(resolve("public/sitemap.xml"), xml);
    console.log("sitemap.xml written");
  } catch (e) {
    console.warn("sitemap: fetch failed, keeping existing file", e);
  }
}
main();
