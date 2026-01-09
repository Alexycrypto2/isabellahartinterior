import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";
import lookbook1 from "@/assets/lookbook-1.jpg";
import lookbook2 from "@/assets/lookbook-2.jpg";
import lookbook3 from "@/assets/lookbook-3.jpg";
import lookbook4 from "@/assets/lookbook-4.jpg";
import lookbook5 from "@/assets/lookbook-5.jpg";
import lookbook6 from "@/assets/lookbook-6.jpg";

const fashionLooks = [
  {
    id: 1,
    title: "The Classic Cream Coat",
    category: "Outerwear",
    style: "Minimalist",
    image: lookbook1,
    description: "Effortlessly chic in an oversized cream coat. The ultimate investment piece for your capsule wardrobe.",
    tips: ["Invest in quality fabrics", "Choose versatile neutral tones", "Let the coat be the statement piece"],
  },
  {
    id: 2,
    title: "Power Dressing",
    category: "Workwear",
    style: "Professional",
    image: lookbook2,
    description: "Command the room in a perfectly tailored black blazer and wide-leg trousers. Modern power dressing at its finest.",
    tips: ["Ensure impeccable tailoring", "Keep accessories minimal", "Confidence is your best accessory"],
  },
  {
    id: 3,
    title: "Golden Hour Glamour",
    category: "Evening",
    style: "Black Tie",
    image: lookbook3,
    description: "Make an entrance in flowing champagne satin. Perfect for galas, weddings, and special celebrations.",
    tips: ["Match jewelry to dress undertones", "Keep makeup elegant and timeless", "Choose comfortable heels you can dance in"],
  },
  {
    id: 4,
    title: "Casual Luxury",
    category: "Everyday",
    style: "Elevated Casual",
    image: lookbook4,
    description: "Weekend-ready in a cozy cream knit and designer accessories. Effortless style for the modern woman.",
    tips: ["Mix high and low pieces", "Add gold accessories for polish", "A great bag elevates everything"],
  },
  {
    id: 5,
    title: "Office Elegance",
    category: "Workwear",
    style: "Classic",
    image: lookbook5,
    description: "Silk blouse meets tailored skirt — the timeless formula for looking polished and put-together.",
    tips: ["Invest in quality silk pieces", "Pearl accessories add sophistication", "Neutral tones work for any meeting"],
  },
  {
    id: 6,
    title: "Autumn Cozy",
    category: "Casual",
    style: "Weekend",
    image: lookbook6,
    description: "Embrace the season in chunky knits and leather. Cozy meets chic for your fall adventures.",
    tips: ["Layer textures for visual interest", "Leather adds edge to soft knits", "Don't forget a warm beverage"],
  },
];

const categories = ["All", "Outerwear", "Workwear", "Evening", "Everyday", "Casual"];
const styles = ["All Styles", "Minimalist", "Professional", "Black Tie", "Elevated Casual", "Classic", "Weekend"];

const Inspiration = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [likedLooks, setLikedLooks] = useState<number[]>([]);

  const filteredLooks = fashionLooks.filter((look) => {
    const categoryMatch = selectedCategory === "All" || look.category === selectedCategory;
    const styleMatch = selectedStyle === "All Styles" || look.style === selectedStyle;
    return categoryMatch && styleMatch;
  });

  const toggleLike = (id: number) => {
    setLikedLooks((prev) =>
      prev.includes(id) ? prev.filter((lookId) => lookId !== id) : [...prev, id]
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-label text-primary mb-4 block"
            >
              Style Lookbook
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-medium text-display mb-6"
            >
              Outfit <span className="italic">Inspiration</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Discover curated looks for every occasion. From workwear to evening glam — 
              find your next signature style.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <section className="pb-8 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                      selectedCategory === category
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Style Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                      selectedStyle === style
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lookbook Gallery */}
        <section className="pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLooks.map((look, index) => (
                <motion.article
                  key={look.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-hover transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(look.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          likedLooks.includes(look.id)
                            ? "fill-red-500 text-red-500"
                            : "text-foreground"
                        }`}
                      />
                    </button>

                    {/* Badges */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {look.category}
                      </Badge>
                      <Badge className="bg-accent/80 backdrop-blur-sm text-accent-foreground">
                        {look.style}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                      {look.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {look.description}
                    </p>

                    {/* Tips */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground uppercase tracking-wide">
                        Style Tips:
                      </p>
                      <ul className="space-y-1">
                        {look.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {filteredLooks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No looks match your filters. Try adjusting your selection.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-display mb-4">
              Ready to Elevate Your Wardrobe?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Shop our curated collection of luxury fashion pieces to recreate these stunning looks.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/90 transition-colors font-medium"
            >
              Shop the Collection
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Inspiration;
