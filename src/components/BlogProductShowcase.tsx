import { ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { Link } from "react-router-dom";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";

interface BlogProductShowcaseProps {
  category: string;
}

// Map blog categories to product category slugs
const categoryProductMap: Record<string, string[]> = {
  "BEDROOM": ["textiles", "lighting", "furniture"],
  "LIVING ROOM": ["furniture", "decor-accents", "lighting"],
  "DECOR": ["decor-accents", "lighting", "storage"],
  "TRENDS": ["decor-accents", "furniture", "textiles"],
  "DIY": ["decor-accents", "storage", "lighting"],
  "ENTRYWAY": ["furniture", "storage", "decor-accents"],
  "SUSTAINABILITY": ["decor-accents", "storage", "textiles"],
  "READING NOOK": ["furniture", "lighting", "textiles"],
};

const BlogProductShowcase = ({ category }: BlogProductShowcaseProps) => {
  const { data: products } = useActiveProducts();

  if (!products || products.length === 0) return null;

  const matchingSlugs = categoryProductMap[category.toUpperCase()] || ["decor-accents", "furniture", "lighting"];
  
  const matchedProducts = products
    .filter(p => matchingSlugs.some(slug => 
      p.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') === slug ||
      p.category.toLowerCase().includes(slug.replace('-', ' '))
    ))
    .slice(0, 4);

  // Fallback to featured products if no category match
  const displayProducts = matchedProducts.length > 0 
    ? matchedProducts 
    : products.filter(p => p.is_featured).slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-10 my-10 bg-muted/40 rounded-2xl">
      <div className="px-6 md:px-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl font-medium text-foreground">
            Products Featured in This Post
          </h2>
        </div>
        <p className="text-muted-foreground text-sm mb-8">
          Love these styles? Shop our top-rated picks — all available on Amazon.
        </p>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <article
              key={product.id}
              className="bg-background rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={resolveImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    product.badge === 'Sale'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3 md:p-4">
                <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2 leading-snug">
                  {product.name}
                </h3>

                <StarRating
                  rating={product.rating || 0}
                  reviews={product.reviews || 0}
                  size="sm"
                  className="mb-2"
                />

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-semibold text-foreground">
                      {product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-xs text-muted-foreground line-through ml-1">
                        {product.original_price}
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="rounded-full bg-accent text-accent-foreground hover:brightness-110 text-xs px-3"
                    asChild
                  >
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      Shop
                      <ExternalLink className="ml-1 w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full text-sm">
              Browse All Products
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Disclosure */}
        <p className="text-[11px] text-muted-foreground text-center mt-4">
          As an Amazon Associate, I earn from qualifying purchases. Prices may vary.
        </p>
      </div>
    </section>
  );
};

export default BlogProductShowcase;
