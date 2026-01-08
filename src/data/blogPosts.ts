import blogCapsuleWardrobe from "@/assets/blog-capsule-wardrobe.jpg";
import blogAccessoriesGuide from "@/assets/blog-accessories-guide.jpg";
import blogSeasonalTrends from "@/assets/blog-seasonal-trends.jpg";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  relatedProducts: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "capsule-wardrobe-essentials",
    title: "The Ultimate Capsule Wardrobe Guide for the Modern Woman",
    excerpt: "Build a versatile, sophisticated wardrobe with these timeless pieces that work for every occasion.",
    content: `
# The Ultimate Capsule Wardrobe Guide for the Modern Woman

A capsule wardrobe is the foundation of effortless style. By curating a collection of versatile, high-quality pieces, you can create countless elegant outfits while simplifying your daily routine.

## The Philosophy Behind Capsule Wardrobes

The concept is simple: invest in fewer, better pieces that work seamlessly together. Quality over quantity, timelessness over trends.

### The Essential Foundation Pieces

**Clothing Essentials:**
- **The Perfect White Blouse**: A crisp, well-fitted white shirt in silk or cotton
- **Tailored Trousers**: Classic black or navy in a flattering cut
- **The Cashmere Knit**: A cream or neutral cashmere sweater
- **The Little Black Dress**: Versatile enough for work and evening
- **A Structured Blazer**: Sharp tailoring in black or camel

### Building Your Color Palette

Stick to a cohesive neutral base:
- Cream, ivory, and white
- Black and charcoal
- Camel, taupe, and nude
- Navy as an accent

Add personality with one or two accent colors that complement your skin tone.

## Investment Pieces Worth the Splurge

Some items deserve a higher investment:
- A quality leather handbag
- Well-made leather shoes
- Cashmere knitwear
- A timeless trench coat

## Styling Tips for Maximum Versatility

1. **Layer strategically**: A blazer transforms any outfit
2. **Accessorize thoughtfully**: Quality jewelry elevates basics
3. **Perfect the fit**: Tailoring is the secret to looking polished
4. **Care for your pieces**: Proper maintenance extends longevity

## The Bottom Line

A capsule wardrobe isn't about restriction—it's about freedom. When everything in your closet works together beautifully, getting dressed becomes a joy rather than a chore.
    `,
    author: "Isabelle Laurent",
    date: "2024-12-15",
    readTime: "6 min read",
    category: "STYLE GUIDE",
    image: blogCapsuleWardrobe,
    relatedProducts: ["cream-cashmere-sweater", "black-satin-dress", "taupe-leather-handbag"]
  },
  {
    id: "accessory-styling-guide",
    title: "The Art of Accessorizing: Elevate Any Outfit",
    excerpt: "Master the art of accessorizing with these expert tips on choosing and styling jewelry, bags, and scarves.",
    content: `
# The Art of Accessorizing: Elevate Any Outfit

Accessories are the finishing touches that transform a good outfit into a great one. Learn how to curate and style your accessories like a fashion editor.

## The Power of Accessories

The right accessories can:
- Elevate simple outfits to sophisticated looks
- Express personal style
- Transition outfits from day to evening
- Add interest and dimension

## Essential Accessories Every Woman Needs

### Jewelry Fundamentals
- **Classic studs**: Pearl or diamond studs for everyday elegance
- **Gold hoops**: Versatile and universally flattering
- **Delicate necklaces**: Layering pieces in gold or silver
- **Statement earrings**: For special occasions

### The Perfect Handbag Collection
- **Structured tote**: For work and daily carry
- **Crossbody bag**: Weekend and hands-free days
- **Evening clutch**: Elegant occasions
- **Quality leather shoulder bag**: The everyday hero

### Scarves and Silk
- **Silk scarf**: Endless styling possibilities
- **Cashmere wrap**: Travel and layering essential

## Styling Rules That Work

### The Rule of Three
Limit visible jewelry to three pieces for a polished look.

### Metal Mixing
Modern styling embraces mixing gold and silver—the key is intentionality.

### Proportion Play
Balance statement pieces with minimal accompaniments.

## Conclusion

Accessorizing is an art that develops with practice. Start with quality basics and build from there.
    `,
    author: "Victoria Chen",
    date: "2024-12-10",
    readTime: "8 min read",
    category: "ACCESSORIES",
    image: blogAccessoriesGuide,
    relatedProducts: ["gold-jewelry-set", "taupe-leather-handbag", "silk-ombre-scarf"]
  },
  {
    id: "seasonal-style-transitions",
    title: "Seasonal Style: Transitioning Your Wardrobe with Elegance",
    excerpt: "Navigate seasonal changes with grace using these expert tips for updating your wardrobe throughout the year.",
    content: `
# Seasonal Style: Transitioning Your Wardrobe with Elegance

Mastering seasonal transitions is key to maintaining a cohesive, functional wardrobe year-round. Here's how to navigate changing seasons with style and practicality.

## The Art of Layering

Layering is your secret weapon for transitional dressing.

### Building Layers
1. **Base layer**: Lightweight, breathable fabrics
2. **Middle layer**: Knits, cardigans, light blazers
3. **Outer layer**: Coats, jackets, wraps

### Key Transitional Pieces
- Lightweight trench coat
- Cashmere cardigan
- Versatile blazer
- Silk blouse

## Fabric Choices for Each Season

### Spring/Summer Transitions
- Linen blends
- Light cotton
- Silk and satin
- Breathable wool blends

### Fall/Winter Transitions
- Cashmere and merino wool
- Leather and suede
- Heavier silks
- Quality outerwear fabrics

## Color Transitions

### Moving into Warmer Months
Transition from:
- Dark neutrals to cream and ivory
- Heavy black to soft grey
- Burgundy to blush

### Moving into Cooler Months
Transition from:
- Bright whites to cream and ecru
- Pastels to rich jewel tones
- Light neutrals to deeper shades

## Practical Tips

1. **Store off-season pieces properly**: Invest in proper storage
2. **Maintain versatile basics**: These work year-round
3. **Plan ahead**: Shop end-of-season sales for next year
4. **Quality over quantity**: Better pieces last through seasons

## The Investment Approach

Focus spending on:
- Quality outerwear
- Timeless knitwear
- Versatile leather pieces
- Classic footwear

## Conclusion

Seasonal dressing doesn't require a complete wardrobe overhaul. With strategic pieces and thoughtful layering, you can maintain elegance through every season.
    `,
    author: "Alexandra Park",
    date: "2024-12-05",
    readTime: "7 min read",
    category: "SEASONAL",
    image: blogSeasonalTrends,
    relatedProducts: ["cream-cashmere-sweater", "nude-leather-heels", "silk-ombre-scarf"]
  }
];