import productLamp from "@/assets/product-lamp.jpg";
import productVase from "@/assets/product-vase.jpg";
import productBlanket from "@/assets/product-blanket.jpg";
import productMirror from "@/assets/product-mirror.jpg";
import productShelf from "@/assets/product-shelf.jpg";
import productPillows from "@/assets/product-pillows.jpg";
import productTableLamp from "@/assets/product-table-lamp.jpg";
import productRug from "@/assets/product-rug.jpg";
import productCandles from "@/assets/product-candles.jpg";
import productSideTable from "@/assets/product-side-table.jpg";
import productMacrame from "@/assets/product-macrame.jpg";
import productBaskets from "@/assets/product-baskets.jpg";
import productArmchair from "@/assets/product-armchair.jpg";
import productWallArt from "@/assets/product-wall-art.jpg";
import productBedFrame from "@/assets/product-bed-frame.jpg";
import productCoffeeTable from "@/assets/product-coffee-table.jpg";
import productFloorLamp from "@/assets/product-floor-lamp.jpg";
import productBookshelf from "@/assets/product-bookshelf.jpg";
import productOttoman from "@/assets/product-ottoman.jpg";
import productDiningChairs from "@/assets/product-dining-chairs.jpg";
import productCurtains from "@/assets/product-curtains.jpg";
import productPlanters from "@/assets/product-planters.jpg";
import productCoatRack from "@/assets/product-coat-rack.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  category: string;
  image: string;
  affiliateUrl: string;
  rating: number;
  reviews: number;
  badge?: string;
}

export const categories = [
  { id: "all", name: "All Products", icon: "✨" },
  { id: "lighting", name: "Lighting", icon: "💡" },
  { id: "decor", name: "Decor & Accents", icon: "🌿" },
  { id: "textiles", name: "Textiles", icon: "🧶" },
  { id: "furniture", name: "Furniture", icon: "🪑" },
  { id: "storage", name: "Storage", icon: "📦" },
];

export const products: Product[] = [
  // === LIGHTING ===
  {
    id: "rattan-pendant-lamp",
    name: "Boho Rattan Pendant Light",
    description: "Hand-woven rattan pendant lamp that adds warmth and texture to any room. Perfect for dining areas or living rooms.",
    price: "$89.99",
    originalPrice: "$129.99",
    category: "lighting",
    image: productLamp,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 2341,
    badge: "Bestseller"
  },
  {
    id: "brass-table-lamp",
    name: "Brass Table Lamp with Linen Shade",
    description: "Elegant brass table lamp with a warm linen shade. Perfect for bedside tables or home offices.",
    price: "$67.99",
    category: "lighting",
    image: productTableLamp,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 1289,
    badge: "New"
  },
  {
    id: "brass-floor-lamp",
    name: "Mid-Century Brass Floor Lamp",
    description: "Stunning brass floor lamp with frosted globe shade. An elegant statement piece that adds warm ambient lighting to any corner.",
    price: "$119.99",
    originalPrice: "$159.99",
    category: "lighting",
    image: productFloorLamp,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 1567,
    badge: "Sale"
  },

  // === DECOR & ACCENTS ===
  {
    id: "ceramic-vase-pampas",
    name: "Ceramic Vase with Dried Pampas",
    description: "Elegant two-tone ceramic vase with beautiful dried pampas grass arrangement. Instant boho-chic vibes.",
    price: "$45.99",
    category: "decor",
    image: productVase,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 1856,
    badge: "Top Pick"
  },
  {
    id: "gold-round-mirror",
    name: "Gold Frame Round Wall Mirror",
    description: "Minimalist round mirror with elegant gold frame. Opens up any space and adds a touch of sophistication.",
    price: "$78.99",
    category: "decor",
    image: productMirror,
    affiliateUrl: "https://amazon.com",
    rating: 4.6,
    reviews: 987
  },
  {
    id: "botanical-wall-art",
    name: "Botanical Print Set (3 Frames)",
    description: "Set of 3 minimalist botanical line art prints in gold frames. Perfect for gallery walls or living room decor.",
    price: "$39.99",
    originalPrice: "$54.99",
    category: "decor",
    image: productWallArt,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 2103,
    badge: "Sale"
  },
  {
    id: "macrame-wall-hanging",
    name: "Macramé Wall Hanging",
    description: "Handcrafted cream cotton macramé wall hanging with intricate knotwork. A stunning boho statement piece.",
    price: "$32.99",
    category: "decor",
    image: productMacrame,
    affiliateUrl: "https://amazon.com",
    rating: 4.6,
    reviews: 876
  },
  {
    id: "scented-candle-set",
    name: "Ceramic Soy Candle Set (3-Pack)",
    description: "Hand-poured soy candles in minimalist ceramic jars. Scents include eucalyptus, lavender, and vanilla.",
    price: "$28.99",
    category: "decor",
    image: productCandles,
    affiliateUrl: "https://amazon.com",
    rating: 4.9,
    reviews: 3456,
    badge: "Bestseller"
  },
  {
    id: "ceramic-planter-set",
    name: "Ceramic Planter Set (3-Pack)",
    description: "Two-tone ceramic planters in white and terracotta. Three sizes for your favorite indoor plants.",
    price: "$36.99",
    category: "decor",
    image: productPlanters,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 2234,
    badge: "Top Pick"
  },

  // === TEXTILES ===
  {
    id: "chunky-knit-blanket",
    name: "Luxury Chunky Knit Throw",
    description: "Ultra-soft cable knit throw blanket in cream. Perfect for cozy evenings and adding texture to your sofa.",
    price: "$59.99",
    originalPrice: "$79.99",
    category: "textiles",
    image: productBlanket,
    affiliateUrl: "https://amazon.com",
    rating: 4.9,
    reviews: 3124,
    badge: "Sale"
  },
  {
    id: "linen-pillow-set",
    name: "Linen Throw Pillow Covers (Set of 4)",
    description: "Premium linen pillow covers in cream and sage green. Breathable, soft, and perfect for any season.",
    price: "$34.99",
    originalPrice: "$49.99",
    category: "textiles",
    image: productPillows,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 1543,
    badge: "Sale"
  },
  {
    id: "jute-area-rug",
    name: "Handwoven Jute Area Rug",
    description: "Natural jute round rug with delicate fringe detail. Adds warmth and boho charm to any room.",
    price: "$54.99",
    category: "textiles",
    image: productRug,
    affiliateUrl: "https://amazon.com",
    rating: 4.5,
    reviews: 1678
  },
  {
    id: "sheer-linen-curtains",
    name: "Sheer Linen Curtain Panels (Pair)",
    description: "Soft white sheer linen curtains that filter natural light beautifully. Instantly brighten and soften any room.",
    price: "$44.99",
    category: "textiles",
    image: productCurtains,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 1890,
    badge: "New"
  },

  // === FURNITURE ===
  {
    id: "velvet-accent-chair",
    name: "Sage Velvet Accent Armchair",
    description: "Mid-century modern velvet armchair in sage green with solid wood legs. A cozy statement piece for any room.",
    price: "$189.99",
    originalPrice: "$249.99",
    category: "furniture",
    image: productArmchair,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 892,
    badge: "Sale"
  },
  {
    id: "hairpin-side-table",
    name: "Wood & Hairpin Side Table",
    description: "Solid wood round side table with black hairpin legs. Scandinavian-inspired design, perfect as a nightstand or accent table.",
    price: "$49.99",
    category: "furniture",
    image: productSideTable,
    affiliateUrl: "https://amazon.com",
    rating: 4.6,
    reviews: 1345,
    badge: "Top Pick"
  },
  {
    id: "upholstered-bed-frame",
    name: "Tufted Linen Platform Bed Frame",
    description: "Modern upholstered platform bed with tufted cream linen headboard. Sturdy construction with a clean, elegant look.",
    price: "$329.99",
    originalPrice: "$449.99",
    category: "furniture",
    image: productBedFrame,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 2456,
    badge: "Bestseller"
  },
  {
    id: "walnut-coffee-table",
    name: "Walnut Coffee Table with Shelf",
    description: "Modern walnut coffee table with open storage shelf. Warm wood tones and clean lines complement any living room.",
    price: "$159.99",
    category: "furniture",
    image: productCoffeeTable,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 1123
  },
  {
    id: "mid-century-dining-chairs",
    name: "Mid-Century Dining Chairs (Set of 2)",
    description: "Classic mid-century dining chairs with cream upholstered seats and warm wood frames. Comfortable and stylish.",
    price: "$139.99",
    originalPrice: "$179.99",
    category: "furniture",
    image: productDiningChairs,
    affiliateUrl: "https://amazon.com",
    rating: 4.6,
    reviews: 1087,
    badge: "Sale"
  },
  {
    id: "velvet-ottoman-pouf",
    name: "Velvet Tufted Ottoman Pouf",
    description: "Round tufted velvet ottoman in terracotta. Versatile as extra seating, a footrest, or a decorative accent.",
    price: "$69.99",
    category: "furniture",
    image: productOttoman,
    affiliateUrl: "https://amazon.com",
    rating: 4.5,
    reviews: 756
  },
  {
    id: "oak-bookshelf",
    name: "5-Tier Oak Bookshelf",
    description: "Open oak bookshelf with 5 spacious tiers. Display books, plants, and decor with a clean, modern look.",
    price: "$199.99",
    originalPrice: "$259.99",
    category: "furniture",
    image: productBookshelf,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 1432,
    badge: "Sale"
  },

  // === STORAGE ===
  {
    id: "floating-wall-shelf",
    name: "Natural Wood Floating Shelves Set",
    description: "Set of 2 solid wood floating shelves. Perfect for displaying plants, books, and decorative items.",
    price: "$42.99",
    category: "storage",
    image: productShelf,
    affiliateUrl: "https://amazon.com",
    rating: 4.7,
    reviews: 2156
  },
  {
    id: "rattan-storage-baskets",
    name: "Woven Rattan Basket Set (3-Pack)",
    description: "Set of 3 nesting woven rattan baskets with lids. Stylish storage for blankets, toys, or laundry.",
    price: "$46.99",
    category: "storage",
    image: productBaskets,
    affiliateUrl: "https://amazon.com",
    rating: 4.8,
    reviews: 1987,
    badge: "Top Pick"
  },
  {
    id: "wooden-coat-rack",
    name: "Wooden Coat Rack Stand",
    description: "Freestanding wooden coat rack with multiple hooks. Perfect for entryways — hold coats, bags, and hats in style.",
    price: "$55.99",
    category: "storage",
    image: productCoatRack,
    affiliateUrl: "https://amazon.com",
    rating: 4.6,
    reviews: 934
  },
];
