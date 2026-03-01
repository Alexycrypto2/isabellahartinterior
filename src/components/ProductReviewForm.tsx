import { useState } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSubmitReview } from "@/hooks/useProductReviews";

interface ProductReviewFormProps {
  productId: string;
  productRating: number;
  productReviews: number;
}

const ProductReviewForm = ({ productId, productRating, productReviews }: ProductReviewFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitReview = useSubmitReview();

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleSubmit = async () => {
    if (userRating === 0) {
      toast.error("Please select a star rating first");
      return;
    }
    const name = reviewerName.trim();
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (name.length > 100) {
      toast.error("Name must be under 100 characters");
      return;
    }
    const text = reviewText.trim();
    if (text.length > 500) {
      toast.error("Review must be under 500 characters");
      return;
    }

    try {
      await submitReview.mutateAsync({
        product_id: productId,
        reviewer_name: name,
        rating: userRating,
        review_text: text || undefined,
      });
      setSubmitted(true);
      setIsExpanded(false);
      toast.success("Thanks for your review!");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="border-t border-border pt-3 mt-3">
      {/* Rating row */}
      <div className="flex items-center justify-between">
        <StarRating
          rating={userRating || productRating || 0}
          reviews={productReviews}
          size="sm"
          interactive={!submitted}
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
          <span className="hidden sm:inline">{submitted ? "Done" : "Review"}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-0.5">
        {submitted ? "Your rating" : "Tap stars to rate"}
      </p>

      {/* Expandable review input */}
      {isExpanded && !submitted && (
        <div className="mt-3 space-y-2 animate-fade-in-up">
          <Input
            placeholder="Your name"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            className="h-9 text-sm rounded-xl border-border bg-background"
            maxLength={100}
          />
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
              disabled={submitReview.isPending}
            >
              <Send className="w-3 h-3 mr-1.5" />
              {submitReview.isPending ? "Sending..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviewForm;
