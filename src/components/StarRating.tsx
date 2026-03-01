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

  // Bigger touch targets for interactive mode
  const touchTargetClasses = interactive ? "p-1.5 -m-1.5" : "";
  
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

  const renderStar = (type: "full" | "half" | "empty", index: number, starNumber: number) => {
    const baseClasses = `${interactive ? 'w-5 h-5 md:w-4 md:h-4' : sizeClasses[size]} transition-all duration-300`;
    
    if (type === "full") {
      return (
        <button
          key={`full-${index}`}
          type="button"
          className={`${touchTargetClasses} inline-flex items-center justify-center ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => handleStarHover(starNumber)}
          aria-label={`Rate ${starNumber} stars`}
        >
          <Star className={`${baseClasses} fill-accent text-accent ${
            animated ? 'hover:scale-125 hover:drop-shadow-[0_0_8px_hsl(var(--accent))]' : ''
          }`} />
        </button>
      );
    }
    
    if (type === "half") {
      return (
        <button
          key="half"
          type="button"
          className={`${touchTargetClasses} inline-flex items-center justify-center relative ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(starNumber)}
          onMouseEnter={() => handleStarHover(starNumber)}
          aria-label={`Rate ${starNumber} stars`}
        >
          <Star className={`${baseClasses} text-accent/30`} />
          <div className="absolute inset-0 overflow-hidden w-1/2 flex items-center justify-center">
            <Star className={`${baseClasses} fill-accent text-accent`} />
          </div>
        </button>
      );
    }
    
    return (
      <button
        key={`empty-${index}`}
        type="button"
        className={`${touchTargetClasses} inline-flex items-center justify-center ${interactive ? 'cursor-pointer' : ''}`}
        onClick={() => handleStarClick(starNumber)}
        onMouseEnter={() => handleStarHover(starNumber)}
        aria-label={`Rate ${starNumber} stars`}
      >
        <Star className={`${baseClasses} text-accent/30 ${
          animated ? 'hover:scale-110 hover:text-accent/50' : ''
        }`} />
      </button>
    );
  };
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: fullStars }).map((_, i) => renderStar("full", i, i + 1))}
        {hasHalfStar && renderStar("half", 0, fullStars + 1)}
        {Array.from({ length: emptyStars }).map((_, i) => 
          renderStar("empty", i, fullStars + (hasHalfStar ? 1 : 0) + i + 1)
        )}
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
