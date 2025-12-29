import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import PageTransition from "@/components/PageTransition";
import { products, categories } from "@/data/products";
import { ExternalLink, Star, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let result = activeCategory === "all" 
      ? [...products] 
      : products.filter(p => p.category === activeCategory);
    
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
        break;
      case "price-high":
        result.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        break;
    }
    
    return result;
  }, [activeCategory, sortBy]);

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label text-primary mb-4 block">Shop Our Collection</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              Curated Home
              <br />
              <span className="italic">Decor Finds</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every piece is handpicked for quality, style, and value. Click any product 
              to shop directly on Amazon.
            </p>
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
                          ? "bg-primary text-primary-foreground" 
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
                          ? "bg-primary text-primary-foreground" 
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
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Badge */}
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        product.badge === 'Sale' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                    
                    {/* Pinterest Save Button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PinterestSaveButton
                        imageUrl={product.image}
                        description={`${product.name} - ${product.price} | Found on Cozy Nest Decor`}
                        url={window.location.origin + `/shop?product=${product.id}`}
                      />
                    </div>
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button 
                        size="sm" 
                        className="rounded-full"
                        asChild
                      >
                        <a 
                          href={product.affiliateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer nofollow"
                        >
                          View on Amazon
                          <ExternalLink className="ml-2 w-3 h-3" />
                        </a>
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
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        ({product.reviews.toLocaleString()})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-foreground">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">
                  No products found in this category yet.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveCategory("all")}
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

      <Newsletter />
      <Footer />
      </div>
    </PageTransition>
  );
};

export default Shop;
