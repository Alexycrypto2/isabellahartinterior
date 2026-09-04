import livingRoomImage from "@/assets/rooms/living-room.jpg";
import bedroomImage from "@/assets/rooms/bedroom.jpg";
import kitchenImage from "@/assets/rooms/kitchen.jpg";
import bathroomImage from "@/assets/rooms/bathroom.jpg";
import diningImage from "@/assets/ugc-dining.jpg";
import homeOfficeImage from "@/assets/rooms/home-office.jpg";
import entrywayImage from "@/assets/rooms/entryway.jpg";
import outdoorImage from "@/assets/rooms/outdoor-patio.jpg";
import smallSpacesImage from "@/assets/blog-minimalist-living.jpg";
import modernImage from "@/assets/hero-luxury.jpg";
import minimalistImage from "@/assets/blog-minimalist-living.jpg";
import japandiImage from "@/assets/blog-hygge-styling.jpg";
import scandinavianImage from "@/assets/blog-bedroom-styling.jpg";
import organicModernImage from "@/assets/blog-living-room-tips.jpg";
import quietLuxuryImage from "@/assets/hero-premium.jpg";

export interface EditorialTaxonomyItem {
  slug: string;
  name: string;
  description: string;
  image: string;
  eyebrow?: string;
}

export const roomTaxonomy: EditorialTaxonomyItem[] = [
  { slug: "living-room", name: "Living Room", description: "Layouts, furniture, lighting, and ideas for the room everyone gathers in.", image: livingRoomImage },
  { slug: "bedroom", name: "Bedroom", description: "Calming bedroom ideas, layered bedding, storage, and restful details.", image: bedroomImage },
  { slug: "kitchen", name: "Kitchen", description: "Practical styling ideas for a kitchen that feels considered and lived in.", image: kitchenImage },
  { slug: "bathroom", name: "Bathroom", description: "Small luxuries, clever storage, and beautiful bathroom finishing touches.", image: bathroomImage },
  { slug: "dining", name: "Dining", description: "Thoughtful tablescapes and dining spaces made for lingering.", image: diningImage },
  { slug: "home-office", name: "Home Office", description: "Focused, comfortable workspaces with a point of view.", image: homeOfficeImage },
  { slug: "entryway", name: "Entryway", description: "Welcoming first impressions and smart solutions for everyday clutter.", image: entrywayImage },
  { slug: "small-spaces", name: "Small Spaces", description: "Room-expanding ideas for apartments, compact homes, and tricky corners.", image: smallSpacesImage },
  { slug: "outdoor", name: "Outdoor", description: "Easy ways to make patios, balconies, and outdoor rooms feel like home.", image: outdoorImage },
];

export const styleTaxonomy: EditorialTaxonomyItem[] = [
  { slug: "modern", name: "Modern", description: "Clean lines, considered contrast, and rooms that feel current without being cold.", image: modernImage },
  { slug: "minimalist", name: "Minimalist", description: "A quieter approach to home, where every object earns its place.", image: minimalistImage },
  { slug: "japandi", name: "Japandi", description: "The balance of Japanese simplicity and Scandinavian warmth.", image: japandiImage },
  { slug: "scandinavian", name: "Scandinavian", description: "Light, practical, and deeply comfortable interiors for everyday living.", image: scandinavianImage },
  { slug: "organic-modern", name: "Organic Modern", description: "Natural materials, soft shapes, and modern rooms with a grounded feeling.", image: organicModernImage },
  { slug: "contemporary", name: "Contemporary", description: "Fresh proportions and expressive details that keep a room feeling alive.", image: modernImage },
  { slug: "traditional", name: "Traditional", description: "Enduring silhouettes, collected layers, and rooms with a sense of history.", image: quietLuxuryImage },
  { slug: "quiet-luxury", name: "Quiet Luxury", description: "Understated materials and refined details that never need to shout.", image: quietLuxuryImage },
  { slug: "warm-minimalism", name: "Warm Minimalism", description: "The uncluttered look, softened with texture, timber, and welcoming light.", image: bedroomImage },
];

export const decorIdeaTaxonomy: EditorialTaxonomyItem[] = [
  { slug: "living-room-decorating", name: "Living Room Decorating", description: "Furniture arrangements, focal points, and finishing details.", image: livingRoomImage },
  { slug: "bedroom-decorating", name: "Bedroom Decorating", description: "Create a bedroom that feels calm, personal, and beautifully layered.", image: bedroomImage },
  { slug: "small-space-ideas", name: "Small-Space Ideas", description: "Practical inspiration for making every square foot work harder.", image: smallSpacesImage },
  { slug: "budget-decorating", name: "Budget Decorating", description: "High-impact changes that make a room feel more finished for less.", image: kitchenImage },
  { slug: "cozy-home-ideas", name: "Cozy Home Ideas", description: "Texture, warmth, and the little rituals that make home feel good.", image: japandiImage },
  { slug: "neutral-interiors", name: "Neutral Interiors", description: "A nuanced guide to layering soft, timeless color.", image: quietLuxuryImage },
];