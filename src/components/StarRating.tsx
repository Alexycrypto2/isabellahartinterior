import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  showReviews?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  reviews, 
  showReviews = true, 
  size = "md",
  className = "",
  animated = true,
  interactive = false,
  onRatingChange
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
  
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
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

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={`${sizeClasses[size]} fill-accent text-accent transition-all duration-300 ${
              animated ? 'hover:scale-125 hover:drop-shadow-[0_0_8px_hsl(var(--accent))]' : ''
            } ${interactive ? 'cursor-pointer' : ''}`}
            style={animated ? { animationDelay: `${i * 50}ms` } : undefined}
            onClick={() => handleStarClick(i + 1)}
            onMouseEnter={() => handleStarHover(i + 1)}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div 
            className={`relative ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleStarClick(fullStars + 1)}
            onMouseEnter={() => handleStarHover(fullStars + 1)}
          >
            <Star className={`${sizeClasses[size]} text-accent/30 transition-all duration-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} fill-accent text-accent transition-all duration-300 ${
                animated ? 'hover:scale-125' : ''
              }`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={`${sizeClasses[size]} text-accent/30 transition-all duration-300 ${
              animated ? 'hover:scale-110 hover:text-accent/50' : ''
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleStarClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
            onMouseEnter={() => handleStarHover(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          />
        ))}
      </div>
      
      <span className={`${textSizeClasses[size]} font-medium text-foreground transition-all duration-300`}>
        {displayRating.toFixed(1)}
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
