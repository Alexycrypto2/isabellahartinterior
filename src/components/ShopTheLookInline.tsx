import { ExternalLink, Star, ShoppingBag } from "lucide-react";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";
import { withUtm } from "@/lib/utm";
import { trackEvent } from "@/lib/analytics";

interface ShopTheLookInlineProps {
  blogTitle: string;
  blogContent: string;
  category: string;
}

const ShopTheLookInline = ({ blogTitle, blogContent, category }: ShopTheLookInlineProps) => {
  const { data: products } = useActiveProducts();
  
  if (!products || products.length === 0) return null;

  // Extract keywords from blog content for smart matching
  const contentLower = (blogTitle + ' ' + blogContent).toLowerCase().replace(/<[^>]*>/g, '');
  
  // Score products by relevance to blog content
  const scoredProducts = products.map(product => {
    let score = 0;
    const nameLower = product.name.toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const catLower = product.category.toLowerCase();
    
    // Category match
    if (category.toLowerCase().includes(catLower) || catLower.includes(category.toLowerCase())) {
      score += 10;
    }
    
    // Name words appearing in content
    const nameWords = nameLower.split(/\s+/).filter(w => w.length > 3);
    for (const word of nameWords) {
      if (contentLower.includes(word)) score += 5;
    }
    
    // Description keywords in content
    const descWords = descLower.split(/\s+/).filter(w => w.length > 4);
    for (const word of descWords) {
      if (contentLower.includes(word)) score += 2;
    }
    
    // Featured bonus
    if (product.is_featured) score += 3;
    
    // Rating bonus
    if (product.rating && product.rating >= 4) score += 2;
    
    return { ...product, score };
  });

  const topMatches = scoredProducts
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Fallback to featured if no good matches
  const displayProducts = topMatches.length >= 2 
    ? topMatches 
    : scoredProducts.sort((a, b) => b.score - a.score).slice(0, 3);

  if (displayProducts.length === 0) return null;

  return (
    <div className="my-10 rounded-2xl border border-border bg-muted/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-medium text-foreground">
          Shop the Look
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Get the exact pieces featured in this article — handpicked from Amazon's top-rated collection.
      </p>

      <div className="space-y-3">
        {displayProducts.map((product) => (
          <a
            key={product.id}
            href={withUtm(product.affiliate_url, "blog", "shop-the-look")}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => trackEvent('product_click', product.id, product.name)}
            className="group flex gap-4 p-3 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
          >
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={resolveImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h4 className="font-medium text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h4>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-0.5">({product.reviews || 0})</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-foreground">{product.price}</span>
                {product.original_price && (
                  <span className="text-xs text-muted-foreground line-through">{product.original_price}</span>
                )}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-4">
        As an Amazon Associate, I earn from qualifying purchases.
      </p>
    </div>
  );
};

export default ShopTheLookInline;
