import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import OptimizedImage from "@/components/OptimizedImage";
import { resolveImageUrl } from "@/lib/imageResolver";

const BlogPreview = memo(() => {
  const { data: posts, isLoading } = usePublishedBlogPosts();
  const recentPosts = posts?.slice(0, 4) || [];
  const [featured, ...supporting] = recentPosts;

  return (
    <section className="border-b border-border bg-background py-14 md:py-28">
      <div className="container mx-auto px-5 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="text-label mb-3 text-accent">From the journal</p>
            <h2 className="text-display text-4xl font-normal md:text-6xl">The latest stories</h2>
          </div>
          <Link to="/blog" className="hidden items-center gap-2 text-sm font-medium text-foreground hover:text-accent md:flex">
            View all stories <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="aspect-[5/4]" />
            <div className="space-y-6"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
          </div>
        ) : featured ? (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <article className="group">
              <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                <Link to={`/blog/${featured.slug}`} className="block h-full">
                  {featured.image_url ? (
                    <div className="h-full transition-transform duration-700 group-hover:scale-[1.02]">
                      <OptimizedImage src={resolveImageUrl(featured.image_url)} alt={featured.title} width={900} height={720} />
                    </div>
                  ) : <div className="h-full" />}
                </Link>
                {featured.image_url && (
                  <div className="absolute right-4 top-4">
                    <PinterestSaveButton imageUrl={resolveImageUrl(featured.image_url)} description={featured.title} url={`${window.location.origin}/blog/${featured.slug}`} />
                  </div>
                )}
              </div>
              <Link to={`/blog/${featured.slug}`} className="mt-5 block">
                <p className="text-label mb-3 text-muted-foreground">{featured.category} · {featured.read_time}</p>
                <h3 className="font-display max-w-2xl text-3xl leading-[1.08] transition-colors group-hover:text-accent md:text-5xl">{featured.title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{featured.excerpt}</p>
              </Link>
            </article>

            <div className="divide-y divide-border border-y border-border">
              {supporting.map((post, index) => (
                <article key={post.id} className="group py-5 md:py-7 first:pt-0 last:pb-0">
                  <Link to={`/blog/${post.slug}`} className="flex gap-4 lg:block">
                    {post.image_url && (
                      <img src={resolveImageUrl(post.image_url)} alt={post.title} loading="lazy" className="h-24 w-24 shrink-0 object-cover lg:hidden" />
                    )}
                    <div className="min-w-0">
                    <p className="text-xs text-muted-foreground md:text-sm">0{index + 2} / {post.category}</p>
                    <h3 className="mt-2 font-display text-xl md:mt-3 md:text-3xl leading-tight transition-colors group-hover:text-accent">{post.title}</h3>
                    <p className="mt-3 hidden line-clamp-2 text-sm leading-6 text-muted-foreground md:block">{post.excerpt}</p>
                    <span className="mt-4 hidden items-center gap-2 text-sm font-medium md:inline-flex">Read story <ArrowUpRight className="h-4 w-4 text-accent" /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <p className="border-y border-border py-12 text-muted-foreground">New stories are coming soon.</p>
        )}

        <Link to="/blog" className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent md:hidden">
          View all stories <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
});

BlogPreview.displayName = "BlogPreview";

export default BlogPreview;