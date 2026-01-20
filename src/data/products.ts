import productLamp from "@/assets/product-lamp.jpg";
import productVase from "@/assets/product-vase.jpg";
import productBlanket from "@/assets/product-blanket.jpg";
import productMirror from "@/assets/product-mirror.jpg";
import productShelf from "@/assets/product-shelf.jpg";
import productPillows from "@/assets/product-pillows.jpg";

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
  }
];
