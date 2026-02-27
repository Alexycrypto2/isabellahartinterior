import { ExternalLink, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import StarRating from "@/components/StarRating";
import { useActiveProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { trackProductClick } from "@/lib/analytics";
import OptimizedImage from "@/components/OptimizedImage";
import { resolveImageUrl } from "@/lib/imageResolver";

import ugcLivingRoom from "@/assets/ugc-living-room.jpg";
import ugcBedroom from "@/assets/ugc-bedroom.jpg";
import ugcReadingNook from "@/assets/ugc-reading-nook.jpg";
import ugcDining from "@/assets/ugc-dining.jpg";
import ugcShelfStyling from "@/assets/ugc-shelf-styling.jpg";
import ugcEntryway from "@/assets/ugc-entryway.jpg";

// Map product index to a UGC customer photo
const customerPhotos = [ugcLivingRoom, ugcBedroom, ugcShelfStyling, ugcReadingNook, ugcDining, ugcEntryway];
const customerNames = ["Sarah M.", "Jessica L.", "Emily R.", "Amanda K.", "Rachel T.", "Nicole P."];

const FeaturedProducts = () => {
  const { data: products, isLoading } = useActiveProducts();

  // Get featured products first, then fill with latest products up to 6
  const featuredProducts = products
    ?.filter((p) => p.is_featured)
    .slice(0, 6) || [];
  
  const remainingSlots = 6 - featuredProducts.length;
  const additionalProducts = products
    ?.filter((p) => !p.is_featured)
    .slice(0, remainingSlots) || [];
  
  const displayProducts = [...featuredProducts, ...additionalProducts];

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Skeleton className="h-4 w-32 mx-auto mb-3" />
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="aspect-square" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!displayProducts || displayProducts.length === 0) {
    return null;
  }

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
            {displayProducts.map((product, index) => (
              <article 
                key={product.id} 
                className="group product-card bg-card rounded-2xl overflow-hidden border border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
                    <OptimizedImage 
                      src={resolveImageUrl(product.image_url)} 
                      alt={`${product.name} - ${product.category} home decor, ${product.price}${product.badge ? `, ${product.badge}` : ''}`}
                      width={400}
                      height={400}
                    />
                  </div>
                  
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
                      imageUrl={resolveImageUrl(product.image_url)}
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
                  
                  {/* Customer Photo */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-accent/30 flex-shrink-0">
                      <img 
                        src={customerPhotos[index % customerPhotos.length]} 
                        alt={`${customerNames[index % customerNames.length]}'s home`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Styled by {customerNames[index % customerNames.length]}
                    </span>
                  </div>

                  {/* Rating */}
                  <StarRating 
                    rating={product.rating || 0} 
                    reviews={product.reviews || 0}
                    size="sm"
                    className="mb-4"
                  />
                  
                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-foreground">
                        {product.price}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.original_price}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="rounded-full bg-accent text-accent-foreground hover:brightness-110"
                      asChild
                    >
                      <a 
                        href={product.affiliate_url} 
                        target="_blank" 
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1"
                        onClick={() => trackProductClick(product.id, product.name)}
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
