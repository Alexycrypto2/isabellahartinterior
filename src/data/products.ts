import productHandbag from "@/assets/product-handbag.jpg";
import productJewelry from "@/assets/product-jewelry.jpg";
import productScarf from "@/assets/product-scarf.jpg";
import productDress from "@/assets/product-dress.jpg";
import productSweater from "@/assets/product-sweater.jpg";
import productHeels from "@/assets/product-heels.jpg";

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
  { id: "clothing", name: "Clothing", icon: "👗" },
  { id: "accessories", name: "Accessories", icon: "👜" },
  { id: "jewelry", name: "Jewelry", icon: "💎" },
  { id: "shoes", name: "Shoes", icon: "👠" },
  { id: "knitwear", name: "Knitwear", icon: "🧶" },
];

export const products: Product[] = [
  {
    id: "taupe-leather-handbag",
    name: "Taupe Leather Chain Bag",
    description: "Elegant structured handbag in premium taupe leather with gold chain strap. Perfect for day-to-evening transitions.",
    price: "$189.00",
    originalPrice: "$249.00",
    category: "accessories",
    image: productHandbag,
    affiliateUrl: "https://glamify.com",
    rating: 4.9,
    reviews: 2847,
    badge: "Bestseller"
  },
  {
    id: "gold-jewelry-set",
    name: "Minimalist Gold Jewelry Set",
    description: "Delicate 18k gold-plated necklace and hoop earrings set. Timeless pieces that elevate any outfit.",
    price: "$79.00",
    category: "jewelry",
    image: productJewelry,
    affiliateUrl: "https://glamify.com",
    rating: 4.8,
    reviews: 1956,
    badge: "Editor's Pick"
  },
  {
    id: "silk-ombre-scarf",
    name: "Silk Ombré Scarf",
    description: "Luxurious silk scarf in cream and gold gradient. Versatile styling for neck, hair, or bag accessory.",
    price: "$65.00",
    originalPrice: "$89.00",
    category: "accessories",
    image: productScarf,
    affiliateUrl: "https://glamify.com",
    rating: 4.7,
    reviews: 1234,
    badge: "Sale"
  },
  {
    id: "black-satin-dress",
    name: "Black Satin Evening Dress",
    description: "Elegant V-neck satin dress with A-line silhouette. Perfect for special occasions and evening events.",
    price: "$245.00",
    category: "clothing",
    image: productDress,
    affiliateUrl: "https://glamify.com",
    rating: 4.9,
    reviews: 892
  },
  {
    id: "cream-cashmere-sweater",
    name: "Cream Cashmere Sweater",
    description: "Ultra-soft pure cashmere crewneck in cream. Luxurious comfort meets effortless sophistication.",
    price: "$195.00",
    category: "knitwear",
    image: productSweater,
    affiliateUrl: "https://glamify.com",
    rating: 4.8,
    reviews: 2156
  },
  {
    id: "nude-leather-heels",
    name: "Nude Leather Pointed Heels",
    description: "Classic pointed-toe pumps in nude leather. Versatile wardrobe essential with 3-inch heel.",
    price: "$165.00",
    originalPrice: "$210.00",
    category: "shoes",
    image: productHeels,
    affiliateUrl: "https://glamify.com",
    rating: 4.7,
    reviews: 1543,
    badge: "Sale"
  }
];