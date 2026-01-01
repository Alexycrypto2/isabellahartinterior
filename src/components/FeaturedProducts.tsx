import { products } from "@/data/products";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import StarRating from "@/components/StarRating";

const FeaturedProducts = () => {
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-label text-accent mb-3 block">Bestsellers on Amazon</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">
              Trending Right Now
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Top-rated pieces from Amazon our community is loving. Updated weekly with fresh finds.
            </p>
          </div>
          
          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <article 
                key={product.id} 
                className="group product-card bg-card rounded-2xl overflow-hidden border border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    width={400}
                    height={400}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Badge */}
                    {product.badge && (
                      <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        product.badge === 'Sale' 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                  
                  {/* Pinterest Save Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PinterestSaveButton
                      imageUrl={product.image}
                      description={`${product.name} - ${product.price}`}
                      url={window.location.origin + `/shop?product=${product.id}`}
                      price={product.price}
                      isBestseller={product.badge === 'Bestseller' || product.badge === 'Top Pick'}
                      isOnSale={product.badge === 'Sale'}
                    />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <span className="text-label text-muted-foreground mb-2 block">
                    {product.category}
                  </span>
                  
                  <h3 className="font-display text-xl font-medium mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Rating */}
                  <StarRating 
                    rating={product.rating} 
                    reviews={product.reviews}
                    size="sm"
                    className="mb-4"
                  />
                  
                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-foreground">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="rounded-full bg-accent text-accent-foreground hover:brightness-110"
                      asChild
                    >
                      <a 
                        href={product.affiliateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1"
                      >
                        Shop on Amazon
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="rounded-full px-10">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
