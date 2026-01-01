import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import PinterestSaveButton from "@/components/PinterestSaveButton";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  product.badge === "Sale"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {product.badge}
              </span>
            )}
            
            {/* Pinterest button */}
            <div className="absolute top-4 right-4">
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
          <div className="p-6 md:p-8 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <span className="text-label text-muted-foreground mb-2 block text-[10px]">
                {product.category}
              </span>
              <DialogTitle className="font-display text-2xl md:text-3xl font-medium">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-muted-foreground text-sm">
                ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-foreground">
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-8 flex-grow">
              {product.description}
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full rounded-none">
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  Shop on Amazon
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-none"
                onClick={() => toggleWishlist(product.id, product.name)}
              >
                <Heart
                  className={`mr-2 w-4 h-4 ${
                    inWishlist ? "fill-primary text-primary" : ""
                  }`}
                />
                {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;