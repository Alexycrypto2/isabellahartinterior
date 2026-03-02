import { ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import StarRating from "@/components/StarRating";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import { Link } from "react-router-dom";

interface ShopTheLookProps {
  productIds: string[];
  title?: string;
}

const ShopTheLook = ({ productIds, title = "Shop the Look on Amazon" }: ShopTheLookProps) => {
  const relatedProducts = productIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  if (relatedProducts.length === 0) return null;

  return (
    <section className="py-12 bg-muted/50 rounded-2xl my-12">
      <div className="px-6 md:px-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h2 className="font-display text-2xl md:text-3xl font-medium text-foreground">
            {title}
          </h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Love this look? Get the pieces featured in this article — all top-rated on Amazon.
        </p>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((product) => (
            <article 
              key={product.id}
              className="bg-background rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.badge === 'Sale' 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {product.badge}
                  </span>
                )}
                <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
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
              <div className="p-4">
                <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                  {product.name}
                </h3>
                
                <StarRating 
                  rating={product.rating} 
                  reviews={product.reviews}
                  size="sm"
                  className="mb-2"
                />
                
                <div className="flex items-center justify-between">
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
                  
                  <Button 
                    size="sm"
                    className="rounded-full bg-accent text-accent-foreground hover:brightness-110"
                    asChild
                  >
                    <a 
                      href={product.affiliateUrl}
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

        {/* View All CTA */}
        <div className="text-center mt-8">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full">
              View All Products
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Disclosure */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          As an Amazon Associate, I earn from qualifying purchases. Prices may vary.
        </p>
      </div>
    </section>
  );
};

export default ShopTheLook;
