import { useState } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Review {
  rating: number;
  text: string;
  date: string;
}

interface ProductReviewFormProps {
  productId: string;
  productRating: number;
  productReviews: number;
}

const getStoredReview = (productId: string): Review | null => {
  try {
    const reviews = JSON.parse(localStorage.getItem("product_reviews") || "{}");
    return reviews[productId] || null;
  } catch {
    return null;
  }
};

const storeReview = (productId: string, review: Review) => {
  try {
    const reviews = JSON.parse(localStorage.getItem("product_reviews") || "{}");
    reviews[productId] = review;
    localStorage.setItem("product_reviews", JSON.stringify(reviews));
    // Also update ratings
    const ratings = JSON.parse(localStorage.getItem("product_ratings") || "{}");
    ratings[productId] = review.rating;
    localStorage.setItem("product_ratings", JSON.stringify(ratings));
  } catch {
    // ignore
  }
};

const ProductReviewForm = ({ productId, productRating, productReviews }: ProductReviewFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const existingReview = getStoredReview(productId);
  const [userRating, setUserRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.text || "");
  const [submitted, setSubmitted] = useState(!!existingReview);

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSubmit = () => {
    if (userRating === 0) {
      toast.error("Please select a star rating first");
      return;
    }
    const trimmed = reviewText.trim();
    if (trimmed.length > 500) {
      toast.error("Review must be under 500 characters");
      return;
    }
    const review: Review = {
      rating: userRating,
      text: trimmed,
      date: new Date().toISOString(),
    };
    storeReview(productId, review);
    setSubmitted(true);
    setIsExpanded(false);
    toast.success("Thanks for your review!");
  };

  return (
    <div className="border-t border-border pt-3 mt-3">
      {/* Rating row */}
      <div className="flex items-center justify-between">
        <StarRating
          rating={userRating || productRating || 0}
          reviews={productReviews}
          size="sm"
          interactive
          onRatingChange={handleRatingChange}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          aria-label={isExpanded ? "Close review form" : "Write a review"}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{submitted ? "Edit" : "Review"}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-0.5">
        {submitted ? "Your rating" : "Tap stars to rate"}
      </p>

      {/* Expandable review input */}
      {isExpanded && (
        <div className="mt-3 space-y-2 animate-fade-in-up">
          <Textarea
            placeholder="Share your thoughts about this product... (optional)"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[70px] text-sm resize-none rounded-xl border-border bg-background"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {reviewText.length}/500
            </span>
            <Button
              size="sm"
              className="rounded-full bg-accent text-accent-foreground hover:brightness-110 h-8 px-4 text-xs"
              onClick={handleSubmit}
            >
              <Send className="w-3 h-3 mr-1.5" />
              {submitted ? "Update" : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* Show existing review text */}
      {submitted && existingReview?.text && !isExpanded && (
        <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
          "{existingReview.text}"
        </p>
      )}
    </div>
  );
};

export default ProductReviewForm;
