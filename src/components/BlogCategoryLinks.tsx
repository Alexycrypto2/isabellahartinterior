import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Map blog categories to relevant shop product categories
const categoryLinks: Record<string, { label: string; slug: string; description: string }[]> = {
  BEDROOM: [
    { label: "Textiles", slug: "textiles", description: "Cozy throws, blankets & pillows" },
    { label: "Lighting", slug: "lighting", description: "Table lamps & ambient lighting" },
    { label: "Decor & Accents", slug: "decor-accents", description: "Vases, candles & finishing touches" },
  ],
  "LIVING ROOM": [
    { label: "Furniture", slug: "furniture", description: "Sofas, tables & seating" },
    { label: "Lighting", slug: "lighting", description: "Floor lamps & statement pieces" },
    { label: "Textiles", slug: "textiles", description: "Throws & decorative pillows" },
    { label: "Decor & Accents", slug: "decor-accents", description: "Vases, art & accents" },
  ],
  ORGANIZATION: [
    { label: "Storage", slug: "storage", description: "Baskets, shelves & organizers" },
    { label: "Furniture", slug: "furniture", description: "Console tables & entryway pieces" },
    { label: "Decor & Accents", slug: "decor-accents", description: "Mirrors, trays & hooks" },
  ],
  DECOR: [
    { label: "Decor & Accents", slug: "decor-accents", description: "Curated decorative pieces" },
    { label: "Lighting", slug: "lighting", description: "Ambient & statement lighting" },
  ],
  KITCHEN: [
    { label: "Storage", slug: "storage", description: "Kitchen organization essentials" },
    { label: "Decor & Accents", slug: "decor-accents", description: "Kitchen styling accents" },
  ],
};

interface BlogCategoryLinksProps {
  category: string;
}

const BlogCategoryLinks = ({ category }: BlogCategoryLinksProps) => {
  const links = categoryLinks[category.toUpperCase()] || categoryLinks["DECOR"] || [];

  if (links.length === 0) return null;

  return (
    <div className="bg-muted/40 dark:bg-muted/20 rounded-2xl p-8 my-12">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-accent" />
        <h3 className="font-display text-xl font-medium">Shop the Look</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Browse our curated picks inspired by this article:
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => (
          <Link
            key={link.slug}
            to={`/shop?category=${link.slug}`}
            className="group flex items-center justify-between bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
          >
            <div>
              <p className="font-medium text-sm group-hover:text-accent transition-colors">
                {link.label}
              </p>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link to="/shop">
          <Button variant="outline" size="sm" className="rounded-full">
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BlogCategoryLinks;
