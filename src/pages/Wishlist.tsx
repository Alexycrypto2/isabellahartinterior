import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useWishlist } from "@/hooks/useWishlist";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import StarRating from "@/components/StarRating";
import { trackProductClick } from "@/lib/analytics";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { data: products, isLoading } = useActiveProducts();

  const wishlistProducts = products?.filter((p) => wishlist.includes(p.id)) || [];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <Heart className="w-7 h-7 text-accent" />
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
                  My Wishlist
                </h1>
                <p className="text-muted-foreground text-lg">
                  {wishlistProducts.length > 0
                    ? `${wishlistProducts.length} item${wishlistProducts.length > 1 ? "s" : ""} saved`
                    : "Your wishlist is empty"}
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : wishlistProducts.length > 0 ? (
                <div className="space-y-4">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 md:gap-6 p-4 bg-card rounded-2xl border border-border group hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <Link to={`/shop?product=${product.id}`} className="flex-shrink-0">
                        <img
                          src={resolveImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-20 h-20 md:w-28 md:h-28 rounded-xl object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {product.category}
                        </span>
                        <h3 className="font-display text-base md:text-lg font-medium truncate">
                          {product.name}
                        </h3>
                        <StarRating
                          rating={product.rating || 0}
                          reviews={product.reviews || 0}
                          size="sm"
                          className="my-1"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">
                            {product.price}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.original_price}
                            </span>
                          )}
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="rounded-full bg-accent text-accent-foreground hover:brightness-110 text-xs h-9"
                          asChild
                        >
                          <a
                            href={product.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            onClick={() => trackProductClick(product.id, product.name)}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                            <span className="hidden sm:inline">Shop</span>
                            <ExternalLink className="w-3.5 h-3.5 sm:ml-1.5" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-muted-foreground hover:text-destructive text-xs h-9"
                          onClick={() => removeFromWishlist(product.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-6">
                    Browse our shop and tap the heart icon on products you love!
                  </p>
                  <Button asChild className="rounded-full bg-accent text-accent-foreground hover:brightness-110">
                    <Link to="/shop">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Products
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Wishlist;
