interface PinterestSaveButtonProps {
  imageUrl: string;
  description: string;
  url?: string;
  size?: "small" | "medium" | "large";
  shape?: "round" | "rect";
  price?: string;
  isBestseller?: boolean;
  isOnSale?: boolean;
}

// Enhance description with buyer intent keywords for Pinterest algorithm
const enhanceDescription = (
  description: string, 
  price?: string, 
  isBestseller?: boolean,
  isOnSale?: boolean
): string => {
  const keywords: string[] = [];
  
  // Add buyer intent keywords
  if (isBestseller) keywords.push("Bestseller");
  if (isOnSale) keywords.push("On Sale");
  if (price) {
    const priceNum = parseFloat(price.replace(/[$,]/g, ''));
    if (priceNum < 50) keywords.push("Under $50");
    else if (priceNum < 100) keywords.push("Under $100");
  }
  
  // Build enhanced description
  const prefix = keywords.length > 0 ? `${keywords.join(" | ")} — ` : "";
  const suffix = " | Shop on Amazon | Top-Rated Home Decor | RoomRefine";
  
  return `${prefix}${description}${suffix}`;
};

const PinterestSaveButton = ({ 
  imageUrl, 
  description, 
  url = window.location.href,
  size = "small",
  shape = "round",
  price,
  isBestseller,
  isOnSale
}: PinterestSaveButtonProps) => {
  
  const enhancedDescription = enhanceDescription(description, price, isBestseller, isOnSale);
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(enhancedDescription)}`;
    
    window.open(
      pinterestUrl,
      'pinterest-share',
      'width=750,height=550,toolbar=0,menubar=0'
    );
  };

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12"
  };

  const iconSizes = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6"
  };

  return (
    <button
      onClick={handleSave}
      className={`${sizeClasses[size]} ${shape === 'round' ? 'rounded-full' : 'rounded-lg'} bg-[#E60023] hover:bg-[#ad081b] text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110`}
      aria-label="Save to Pinterest"
      title="Save to Pinterest"
    >
      <svg 
        className={iconSizes[size]} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
      </svg>
    </button>
  );
};

export default PinterestSaveButton;
