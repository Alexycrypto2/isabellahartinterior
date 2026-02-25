import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import PageTransition from "@/components/PageTransition";
import ProductSearch from "@/components/ProductSearch";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import ProductQuickView from "@/components/ProductQuickView";
import { useActiveProducts, useProductCategories, Product } from "@/hooks/useProducts";
import JsonLd from "@/components/JsonLd";
import { ExternalLink, SlidersHorizontal, X, Heart, Eye } from "lucide-react";
import StarRating from "@/components/StarRating";
import shopHeroDefault from "@/assets/shop-hero.jpg";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { trackProductClick } from "@/lib/analytics";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { resolveImageUrl } from "@/lib/imageResolver";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface for quick view compatibility
interface QuickViewProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  category: string;
  image: string;
  affiliateUrl: string;
  rating: number;
  reviews: number;
  badge?: string;
}

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<QuickViewProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const { data: shopHeroSetting } = useSiteSetting('shop_hero');
  const shopHeroData = (shopHeroSetting?.value || {}) as Record<string, string>;
  const shopHeroImage = shopHeroData.image_url || shopHeroDefault;

  // Read category from URL params (e.g. /shop?category=furniture)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: products, isLoading } = useActiveProducts();
  const { data: dbCategories } = useProductCategories();

  // Build categories with "All Products" first
  const categories = useMemo(() => {
    const allCategory = { id: "all", name: "All Products", icon: "✨", slug: "all" };
    if (!dbCategories) return [allCategory];
    return [allCategory, ...dbCategories.map(c => ({ 
      id: c.slug, 
      name: c.name, 
      icon: c.icon || "📦",
      slug: c.slug 
    }))];
  }, [dbCategories]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let result = activeCategory === "all" 
      ? [...products] 
      : products.filter(p => p.category === activeCategory);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case "price-high":
        result.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "reviews":
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
      default:
        // Featured products first
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
    
    return result;
  }, [products, activeCategory, sortBy, searchQuery]);

  const handleQuickView = (product: Product) => {
    // Convert to quick view format
    const quickViewProduct: QuickViewProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price || undefined,
      category: product.category,
      image: resolveImageUrl(product.image_url),
      affiliateUrl: product.affiliate_url,
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      badge: product.badge || undefined,
    };
    setSelectedProduct(quickViewProduct);
    setIsQuickViewOpen(true);
  };

  const productsJsonLd = filteredAndSortedProducts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "RoomRefine Curated Home Decor",
    itemListElement: filteredAndSortedProducts.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: resolveImageUrl(product.image_url),
        offers: {
          "@type": "Offer",
          price: product.price.replace('$', ''),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: product.affiliate_url,
        },
        aggregateRating: product.rating ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviews || 0,
        } : undefined,
      },
    })),
  } : null;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        {productsJsonLd && <JsonLd data={productsJsonLd} />}
      {/* Hero Section with Image */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-[50vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={shopHeroImage} 
            alt="Stylish home decor collection" 
            className="w-full h-full object-cover"
          />
          {/* Stronger overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center py-12">
            <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground rounded-full font-medium text-sm mb-6">
              Top-Rated Products on Amazon
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground mb-6">
              {shopHeroData.title || 'Curated Decor'}
              <br />
              <span className="italic text-foreground/90">{shopHeroData.subtitle || 'All Under $100'}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Handpicked, top-rated pieces from Amazon. Every product is rated 4+ stars. 
              Click any item to shop directly.
            </p>
            
            {/* Search Bar */}
            <div className="flex justify-center">
              <ProductSearch 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="md:hidden rounded-full"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                {/* Desktop Categories */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeCategory === category.id 
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedProducts.length} products
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] rounded-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="md:hidden mb-6 p-4 bg-card rounded-2xl border border-border animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Categories</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeCategory === category.id 
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product, index) => (
                  <article 
                    key={product.id} 
                    className="group product-card bg-card rounded-2xl overflow-hidden border border-border"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={resolveImageUrl(product.image_url)} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Badge */}
                      {product.badge && (
                        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                          product.badge === 'Sale' 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {product.badge}
                        </span>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PinterestSaveButton
                          imageUrl={resolveImageUrl(product.image_url)}
                          description={`${product.name} - ${product.price}`}
                          url={window.location.origin + `/shop?product=${product.id}`}
                          price={product.price}
                          isBestseller={product.badge === 'Bestseller' || product.badge === 'Top Pick'}
                          isOnSale={product.badge === 'Sale'}
                        />
                        <button
                          onClick={() => toggleWishlist(product.id, product.name)}
                          className="w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-md"
                          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              isInWishlist(product.id) 
                                ? "fill-accent text-accent"
                                : "text-neutral-700"
                            }`} 
                          />
                        </button>
                      </div>
                      
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button 
                          size="sm"
                          className="rounded-full bg-accent text-accent-foreground hover:brightness-110"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="mr-2 w-4 h-4" />
                          Quick View
                        </Button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <span className="text-label text-muted-foreground mb-1 block text-[10px]">
                        {product.category}
                      </span>
                      
                      <h3 className="font-display text-lg font-medium mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <StarRating 
                        rating={product.rating || 0} 
                        reviews={product.reviews || 0} 
                        size="sm"
                        className="mb-3"
                      />
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-foreground">
                            {product.price}
                          </span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.original_price}
                            </span>
                          )}
                        </div>
                        <a 
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-accent hover:text-accent/80 transition-colors"
                          onClick={() => trackProductClick(product.id, product.name)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">
                  {searchQuery 
                    ? `No products found for "${searchQuery}"`
                    : "No products found in this category yet."
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="rounded-full"
                >
                  View All Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Affiliate Note */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Prices and availability may change. Click through to Amazon for the most current info.
            As an Amazon Associate, I earn from qualifying purchases.
          </p>
        </div>
      </section>

      <Footer />
      
      {/* Quick View Modal */}
      <ProductQuickView 
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
      </div>
    </PageTransition>
  );
};

export default Shop;