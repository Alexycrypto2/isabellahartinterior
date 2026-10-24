# Master Fix List

## 1. Authentication & Custom Domain (top priority)
- [ ] Add `PASSWORD_RECOVERY` event listener in AuthContext.tsx so reset links always route to `/reset-password`
- [ ] Update `public/sitemap.xml`, `robots.txt`, and dynamic sitemap function to `https://isabellehartinteriors.com`
- [ ] (User-side) Add custom domains to backend Auth Redirect URLs + set Site URL (instructions given)

## 2. Homepage fixes (rated 7.5/10)
- [ ] Fix Rooms grid gap: 6 cards in 4-col grid leaves 2 empty slots — use 3 cols or add "View all rooms" tile
- [ ] Resolve duplicate email capture: "Free Design Guide" popup overlaps Sunday Letter signup + footer; disable popup for now
- [ ] Replace/regenerate first story image (busy orange fall collage) to match calm editorial palette
- [ ] Add keyword-bearing supporting line for SEO (e.g. "Home decor ideas, room-by-room styling guides, and interior design tips")
- [ ] Fix "Inside this issue" teasers: link to real articles or retitle as section links

## 3. Blog upgrades (planned)
- [ ] AI Blog Writer Rank #1 Editorial Blueprint (1,800+ word guides, designer specs, Quick Cheat Sheet, Designer Secrets, FAQ schema, section-tied image prompts)
- [ ] In-Article Image Studio & Regeneration (media hub sidebar, per-image regenerate/replace, SEO alt-text)

## 4. SEO & AI tooling (planned)
- [ ] Live Google SERP Intelligence for SEO Doctor (competitor benchmark, content gap, live indexing checker)
- [ ] Magic Hour Image API Integration (replace Gemini, admin config, multi-format generation)

## 5. Additional backlog
- [ ] Global search dropdown deep-linking across articles, rooms, and styles
- [ ] Pinterest Content & Design Studio (24-section spec, unimplemented)
- [ ] Domain alignment: finalize primary address across sitemaps, canonicals, meta tags
- [ ] Article-page paragraph spacing fix (verify)
- [ ] AdminBlogPosts catalog health badges
- [ ] Blog.tsx editorial cover + multi-column card redesign
- [ ] About page: replace old affiliate-store wording

## Done (this roadmap's first pass)
- [x] Reframe public navigation and homepage around editorial discovery
- [x] Replace storefront hero with split editorial lead and real article content
- [x] Replace product/social-proof homepage sections with editorial features and room index
- [x] Refine newsletter, footer, and design tokens for Paper & Ink / Instrument Serif + Work Sans
- [x] Validate homepage, article routes, and responsive layout
