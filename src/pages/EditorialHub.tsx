import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import PageTransition from "@/components/PageTransition";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import type { BlogPost } from "@/hooks/useBlogPosts";
import { useActiveProducts } from "@/hooks/useProducts";
import { decorIdeaTaxonomy, roomTaxonomy, styleTaxonomy, EditorialTaxonomyItem } from "@/data/editorialTaxonomy";
import { resolveImageUrl } from "@/lib/imageResolver";
import { ArrowRight, ExternalLink } from "lucide-react";

type HubKind = "decor" | "rooms" | "styles" | "finds";

const hubConfig: Record<HubKind, { title: string; description: string; eyebrow: string; taxonomy: EditorialTaxonomyItem[] }> = {
  decor: {
    title: "Decor Ideas",
    description: "Practical, beautiful ideas for making your home feel more like your own.",
    eyebrow: "The journal",
    taxonomy: decorIdeaTaxonomy,
  },
  rooms: {
    title: "Rooms",
    description: "An organized library of inspiration, layouts, and decorating guidance for every room.",
    eyebrow: "Explore by room",
    taxonomy: roomTaxonomy,
  },
  styles: {
    title: "Style Guides",
    description: "A considered guide to the interior styles, materials, and moods worth bringing home.",
    eyebrow: "Find your point of view",
    taxonomy: styleTaxonomy,
  },
  finds: {
    title: "Shop My Finds",
    description: "A thoughtfully edited directory of useful, beautiful pieces for the rooms you live in.",
    eyebrow: "The edit",
    taxonomy: roomTaxonomy,
  },
};

const formatLabel = (value: string) => value.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

const ArticleCard = ({ post }: { post: BlogPost }) => (
  <article className="group">
    <Link to={`/blog/${post.slug}`} className="block">
      <div className="mb-4 aspect-[4/3] overflow-hidden border border-border bg-muted">
        <img src={resolveImageUrl(post.image_url)} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
        <span>{post.room ? formatLabel(post.room) : post.category}</span>
        {post.style && <><span className="text-border">/</span><span>{formatLabel(post.style)}</span></>}
      </div>
      <h3 className="font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-accent">{post.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
    </Link>
  </article>
);

const TaxonomyCard = ({ item, href }: { item: EditorialTaxonomyItem; href: string }) => (
  <Link to={href} className="group block">
    <div className="relative aspect-[4/5] overflow-hidden border border-border bg-muted">
      <img src={item.image} alt={`${item.name} interiors`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-foreground/45 transition-colors group-hover:bg-foreground/35" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-background">
        <h2 className="font-display text-3xl">{item.name}</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-background/80">{item.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-background/90">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </div>
  </Link>
);

const FindsHub = () => {
  const { data: products, isLoading } = useActiveProducts();
  const featuredProducts = (products || []).slice(0, 12);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map(product => (
          <article key={product.id} className="group border-b border-border pb-5">
            <Link to={`/shop/${product.slug}`} className="block">
              <div className="mb-4 aspect-square overflow-hidden bg-muted">
                <img src={resolveImageUrl(product.image_url)} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-accent">{product.category}</p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-foreground group-hover:text-accent">{product.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            </Link>
            <a href={product.affiliate_url} target="_blank" rel="nofollow noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">See product <ExternalLink className="h-3.5 w-3.5" /></a>
          </article>
        ))}
      </div>
      {!isLoading && featuredProducts.length === 0 && <p className="py-16 text-center text-muted-foreground">The finds edit is being refreshed. Check back soon.</p>}
    </>
  );
};

const EditorialHub = ({ kind }: { kind: HubKind }) => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { data: posts, isLoading } = usePublishedBlogPosts();
  const config = hubConfig[kind];
  const selected = slug ? config.taxonomy.find(item => item.slug === slug) : undefined;
  const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
  const filteredPosts = (posts || []).filter(post => {
    const searchMatch = !searchQuery || [post.title, post.excerpt, post.content, post.category, post.room || "", post.style || ""].join(" ").toLowerCase().includes(searchQuery);
    if (!searchMatch) return false;
    if (!selected) return true;
    if (kind === "rooms") return post.room === selected.slug || (!post.room && post.category.toLowerCase().replace(/\s+/g, "-") === selected.slug);
    if (kind === "styles") return post.style === selected.slug;
    return true;
  });

  const title = selected ? `${selected.name} Ideas` : config.title;
  const description = selected?.description || config.description;
  const taxonomyHref = kind === "rooms" ? (item: EditorialTaxonomyItem) => `/rooms/${item.slug}` : kind === "styles" ? (item: EditorialTaxonomyItem) => `/style-guides/${item.slug}` : () => "/decor-ideas";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{title} | Isabelle Hart Interiors</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        </Helmet>
        <Navigation />
        <main>
          <header className="border-b border-border pb-14 pt-32 md:pb-20">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl">
                <p className="text-label text-accent">{config.eyebrow}</p>
                <h1 className="mt-4 font-display text-6xl leading-[0.95] text-foreground md:text-8xl">{title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          </header>

          {!selected && kind !== "finds" && (
            <section className="border-b border-border py-12 md:py-16">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {config.taxonomy.map(item => <TaxonomyCard key={item.slug} item={item} href={taxonomyHref(item)} />)}
                </div>
              </div>
            </section>
          )}

          {kind === "finds" ? (
            <section className="py-14 md:py-20"><div className="container mx-auto px-6"><FindsHub /></div></section>
          ) : (
            <section className="py-14 md:py-20">
              <div className="container mx-auto px-6">
                <div className="mb-10 flex items-end justify-between gap-4 border-b border-border pb-5">
                  <div><p className="text-label text-accent">{selected ? selected.name : "Latest reading"}</p><h2 className="mt-2 font-display text-4xl">Stories to save</h2></div>
                  {selected && <Link to={kind === "rooms" ? "/rooms" : "/style-guides"} className="text-sm text-accent hover:underline">View all {kind === "rooms" ? "rooms" : "styles"}</Link>}
                </div>
                {isLoading ? <div className="py-16 text-center text-muted-foreground">Loading the journal…</div> : filteredPosts.length > 0 ? <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{filteredPosts.slice(0, 12).map(post => <ArticleCard key={post.id} post={post} />)}</div> : <div className="border-y border-border py-16 text-center text-muted-foreground">New stories for this collection are on their way.</div>}
              </div>
            </section>
          )}
          <Newsletter />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export const DecorIdeas = () => <EditorialHub kind="decor" />;
export const Rooms = () => <EditorialHub kind="rooms" />;
export const RoomDetail = () => <EditorialHub kind="rooms" />;
export const StyleGuides = () => <EditorialHub kind="styles" />;
export const StyleGuideDetail = () => <EditorialHub kind="styles" />;
export const ShopMyFinds = () => <EditorialHub kind="finds" />;

export default EditorialHub;