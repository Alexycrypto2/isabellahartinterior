import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useCart } from "@/hooks/useCart";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2, ShoppingCart, Share2, Check, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import StarRating from "@/components/StarRating";
import { trackProductClick } from "@/lib/analytics";
import { withUtm } from "@/lib/utm";
import { toast } from "sonner";

const Cart = () => {
  const { cart, cartProductIds, removeFromCart, addToCart, updateQuantity, getQuantity, clearCart } = useCart();
  const { data: products, isLoading } = useActiveProducts();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Check if viewing a shared cart (uses slugs for clean URLs)
  const sharedSlugs = searchParams.get("items");
  const isSharedView = !!sharedSlugs;
  const sharedSlugList = useMemo(() => 
    sharedSlugs ? sharedSlugs.split(",").filter(Boolean) : [],
    [sharedSlugs]
  );

  // Resolve shared slugs to product IDs
  const sharedProductIds = useMemo(() => {
    if (!isSharedView || !products) return [];
    return products
      .filter((p) => sharedSlugList.includes(p.slug))
      .map((p) => p.id);
  }, [isSharedView, products, sharedSlugList]);

  const displayIds = isSharedView ? sharedProductIds : cartProductIds;
  const displayProducts = products?.filter((p) => displayIds.includes(p.id)) || [];

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return displayProducts.reduce((total, product) => {
      const price = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
      const qty = isSharedView ? 1 : getQuantity(product.id);
      return total + price * qty;
    }, 0);
  }, [displayProducts, cart, isSharedView]);

  const handleShare = async () => {
    const cartProducts = products?.filter((p) => cartProductIds.includes(p.id)) || [];
    const slugs = cartProducts.map((p) => p.slug).join(",");
    const shareUrl = `${window.location.origin}/cart?items=${slugs}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My RoomRefine Cart",
          text: `Check out my curated home decor picks — ${cart.length} item${cart.length > 1 ? "s" : ""}!`,
          url: shareUrl,
        });
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Cart link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleAddAllToCart = () => {
    let added = 0;
    sharedProductIds.forEach((id) => {
      const product = products?.find((p) => p.id === id);
      if (!cartProductIds.includes(id)) {
        addToCart(id, product?.name);
        added++;
      }
    });
    if (added > 0) {
      toast.success(`Added ${added} item${added > 1 ? "s" : ""} to your cart!`);
    } else {
      toast.info("All items are already in your cart");
    }
  };

  const handleCheckoutAll = () => {
    const tabCount = displayProducts.length;
    if (!tabCount) return;

    const confirmed = window.confirm(
      `This will open ${tabCount} product page${tabCount > 1 ? 's' : ''} in new tabs so you can checkout each item on the retailer site. Continue?`
    );
    if (!confirmed) return;

    displayProducts.forEach((product, i) => {
      setTimeout(() => {
        trackProductClick(product.id, product.name, "cart", "checkout-all");
        window.open(withUtm(product.affiliate_url, "cart", "checkout-all"), "_blank", "noopener,noreferrer");
      }, i * 300);
    });

    toast.success(`Opened ${tabCount} checkout page${tabCount > 1 ? 's' : ''} in new tabs.`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <span className="text-3xl">🛒</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
                  {isSharedView ? "Shared Cart" : "My Cart"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isLoading
                    ? "Loading..."
                    : displayProducts.length > 0
                    ? `${displayProducts.length} item${displayProducts.length > 1 ? "s" : ""} ${isSharedView ? "shared" : "in your cart"}`
                    : isSharedView ? "This shared cart is empty" : "Your cart is empty"}
                </p>
              </div>

              {/* Action Buttons */}
              {displayProducts.length > 0 && (
                <div className="flex justify-center gap-3 mb-8">
                  {isSharedView ? (
                    <Button
                      onClick={handleAddAllToCart}
                      className="rounded-full bg-accent text-accent-foreground hover:brightness-110"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add All to My Cart
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        className="rounded-full"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Share2 className="w-4 h-4 mr-2" />
                        )}
                        {copied ? "Link Copied!" : "Share Cart"}
                      </Button>
                      <Button
                        onClick={() => { clearCart(); toast.success("Cart cleared"); }}
                        variant="ghost"
                        className="rounded-full text-muted-foreground"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : displayProducts.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {displayProducts.map((product) => {
                      const qty = isSharedView ? 1 : getQuantity(product.id);
                      const unitPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
                      const lineTotal = unitPrice * qty;

                      return (
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

                          {/* Quantity & Actions */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {/* Quantity Controls */}
                            {!isSharedView && (
                              <div className="flex items-center gap-1 bg-muted rounded-full px-1">
                                <button
                                  onClick={() => updateQuantity(product.id, qty - 1)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, qty + 1)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Line Total */}
                            <span className="text-sm font-semibold text-foreground">
                              ${lineTotal.toFixed(2)}
                            </span>

                            {/* Shop & Remove */}
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                className="rounded-full bg-accent text-accent-foreground hover:brightness-110 text-xs h-8 px-3"
                                asChild
                              >
                                <a
                                  href={withUtm(product.affiliate_url, "cart", "buy-button")}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                  onClick={() => trackProductClick(product.id, product.name, "cart", "buy-button")}
                                >
                                  <ExternalLink className="w-3.5 h-3.5 sm:mr-1.5" />
                                  <span className="hidden sm:inline">Buy</span>
                                </a>
                              </Button>
                              {!isSharedView && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="rounded-full text-muted-foreground hover:text-destructive text-xs h-8 w-8 p-0"
                                  onClick={() => removeFromCart(product.id)}
                                  aria-label="Remove from cart"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Summary */}
                  <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Subtotal ({displayProducts.length} item{displayProducts.length > 1 ? "s" : ""})</span>
                      <span className="text-2xl font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      This cart uses affiliate checkout: clicking checkout opens one retailer tab per product (for example, 3 products = 3 tabs).
                    </p>
                    {!isSharedView && (
                      <Button
                        onClick={handleCheckoutAll}
                        className="w-full rounded-full bg-accent text-accent-foreground hover:brightness-110 h-12 text-base font-semibold"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Checkout {displayProducts.length > 1 ? `${displayProducts.length} Items` : 'Item'} — ${subtotal.toFixed(2)}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-6">
                    {isSharedView
                      ? "The products in this shared cart are no longer available."
                      : "Browse our shop and add products to your cart!"}
                  </p>
                  <Button asChild className="rounded-full bg-accent text-accent-foreground hover:brightness-110">
                    <Link to="/shop">
                      <ShoppingCart className="w-4 h-4 mr-2" />
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

export default Cart;
