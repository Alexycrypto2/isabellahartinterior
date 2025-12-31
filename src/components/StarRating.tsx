import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  showReviews?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StarRating = ({ 
  rating, 
  reviews, 
  showReviews = true, 
  size = "md",
  className = "" 
}: StarRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={`${sizeClasses[size]} fill-accent text-accent`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-accent/30`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} fill-accent text-accent`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={`${sizeClasses[size]} text-accent/30`}
          />
        ))}
      </div>
      
      <span className={`${textSizeClasses[size]} font-medium text-foreground`}>
        {rating.toFixed(1)}
      </span>
      
      {showReviews && reviews !== undefined && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default StarRating;
