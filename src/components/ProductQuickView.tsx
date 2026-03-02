import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart, Star, MessageSquare, Send } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import { withUtm } from "@/lib/utm";
import StarRating from "@/components/StarRating";
import { useProductReviews, useSubmitReview } from "@/hooks/useProductReviews";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  const { isInCart, addToCart } = useCart();
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(product?.id || "");
  const submitReview = useSubmitReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");

  if (!product) return null;

  const inCart = isInCart(product.id);
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating;

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    const name = reviewName.trim();
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await submitReview.mutateAsync({
        product_id: product.id,
        reviewer_name: name,
        rating: reviewRating,
        review_text: reviewText.trim() || undefined,
      });
      toast.success("Review submitted!");
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewName("");
      setReviewText("");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh]">
        <ScrollArea className="max-h-[90vh]">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-square md:aspect-auto md:min-h-[500px]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    product.badge === "Sale"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {product.badge}
                </span>
              )}
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
              <StarRating
                rating={averageRating}
                reviews={reviews?.length || product.reviews}
                size="md"
                className="mb-4"
              />

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
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
              <p className="text-muted-foreground mb-6 text-sm">
                {product.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-3 mb-6">
                <Button asChild size="lg" className="w-full rounded-full bg-accent text-accent-foreground hover:brightness-110">
                  <a
                    href={withUtm(product.affiliateUrl, "shop", "quick-view")}
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
                  className="w-full rounded-full"
                  onClick={() => !inCart && addToCart(product.id, product.name)}
                  disabled={inCart}
                >
                  <ShoppingCart
                    className={`mr-2 w-4 h-4 ${
                      inCart ? "text-accent" : ""
                    }`}
                  />
                  {inCart ? "Already in Cart" : "Add to Cart"}
                </Button>
              </div>

              {/* Reviews Section */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-medium">
                    Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full text-xs h-8"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Write a Review
                  </Button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-xl space-y-3 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Your rating:</span>
                      <StarRating
                        rating={reviewRating}
                        showReviews={false}
                        size="md"
                        interactive
                        onRatingChange={setReviewRating}
                      />
                    </div>
                    <Input
                      placeholder="Your name"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="h-9 text-sm rounded-xl"
                      maxLength={100}
                    />
                    <Textarea
                      placeholder="Share your experience... (optional)"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="min-h-[60px] text-sm resize-none rounded-xl"
                      maxLength={500}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="rounded-full bg-accent text-accent-foreground hover:brightness-110 h-8 px-4 text-xs"
                        onClick={handleSubmitReview}
                        disabled={submitReview.isPending}
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        {submitReview.isPending ? "Sending..." : "Submit Review"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border/50 pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {review.reviewer_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-accent text-accent"
                                  : "text-accent/30"
                              }`}
                            />
                          ))}
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
