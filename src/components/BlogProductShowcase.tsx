import { ExternalLink, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";
import { withUtm } from "@/lib/utm";

interface BlogProductShowcaseProps {
  category: string;
}

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

  const displayProducts = matchedProducts.length > 0
    ? matchedProducts
    : products.filter(p => p.is_featured).slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <section className="my-14">
      {/* Premium header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground tracking-tight">
          Shop the Products
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-6 ml-11">
        Curated picks featured in this article — all top-rated on Amazon.
      </p>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayProducts.map((product) => (
          <a
            key={product.id}
            href={withUtm(product.affiliate_url, "blog", "product-showcase")}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group flex gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all duration-300"
          >
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={resolveImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews || 0})
                  </span>
                </div>
              )}

              {/* Price + CTA */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-base font-semibold text-foreground">
                  {product.price}
                </span>
                {product.original_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {product.original_price}
                  </span>
                )}
                {product.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground">
          As an Amazon Associate, I earn from qualifying purchases.
        </p>
        <Link to="/shop">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            Browse all →
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default BlogProductShowcase;
