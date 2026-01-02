import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink } from "lucide-react";

const roomStyles = [
  {
    id: 1,
    title: "Modern Minimalist Living",
    category: "Living Room",
    style: "Minimalist",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    description: "Clean lines, neutral tones, and purposeful simplicity create a serene living space.",
    tips: ["Use a neutral color palette", "Invest in quality over quantity", "Embrace negative space"],
  },
  {
    id: 2,
    title: "Cozy Scandinavian Bedroom",
    category: "Bedroom",
    style: "Scandinavian",
    image: "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&h=600&fit=crop",
    description: "Warm textiles, natural materials, and soft lighting for ultimate comfort.",
    tips: ["Layer different textures", "Add warm wood accents", "Use soft, diffused lighting"],
  },
  {
    id: 3,
    title: "Boho Chic Dining Space",
    category: "Dining Room",
    style: "Bohemian",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop",
    description: "Eclectic patterns, rich textures, and global influences come together beautifully.",
    tips: ["Mix patterns confidently", "Include natural elements", "Add plants for life"],
  },
  {
    id: 4,
    title: "Industrial Loft Kitchen",
    category: "Kitchen",
    style: "Industrial",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
    description: "Exposed elements, metal accents, and raw materials create urban sophistication.",
    tips: ["Embrace raw materials", "Use pendant lighting", "Mix metals thoughtfully"],
  },
  {
    id: 5,
    title: "Coastal Retreat Bathroom",
    category: "Bathroom",
    style: "Coastal",
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop",
    description: "Ocean-inspired hues and natural textures bring the beach home.",
    tips: ["Use blue and white tones", "Add natural textures", "Include organic shapes"],
  },
  {
    id: 6,
    title: "Mid-Century Modern Office",
    category: "Home Office",
    style: "Mid-Century",
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=600&fit=crop",
    description: "Iconic furniture pieces and clean aesthetics for productive work.",
    tips: ["Choose iconic furniture", "Add statement lighting", "Keep it functional"],
  },
];

const categories = ["All", "Living Room", "Bedroom", "Dining Room", "Kitchen", "Bathroom", "Home Office"];
const styles = ["All Styles", "Minimalist", "Scandinavian", "Bohemian", "Industrial", "Coastal", "Mid-Century"];

const Inspiration = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [likedRooms, setLikedRooms] = useState<number[]>([]);

  const filteredRooms = roomStyles.filter((room) => {
    const categoryMatch = selectedCategory === "All" || room.category === selectedCategory;
    const styleMatch = selectedStyle === "All Styles" || room.style === selectedStyle;
    return categoryMatch && styleMatch;
  });

  const toggleLike = (id: number) => {
    setLikedRooms((prev) =>
      prev.includes(id) ? prev.filter((roomId) => roomId !== id) : [...prev, id]
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
              Design Inspiration
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl font-medium text-display mb-6"
            >
              Room <span className="italic">Ideas</span> & Styling
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Explore curated room designs and discover styling tips to transform your space into something extraordinary.
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

        {/* Room Gallery */}
        <section className="pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRooms.map((room, index) => (
                <motion.article
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-hover transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(room.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          likedRooms.includes(room.id)
                            ? "fill-red-500 text-red-500"
                            : "text-foreground"
                        }`}
                      />
                    </button>

                    {/* Badges */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {room.category}
                      </Badge>
                      <Badge className="bg-accent/80 backdrop-blur-sm text-accent-foreground">
                        {room.style}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                      {room.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Tips */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground uppercase tracking-wide">
                        Styling Tips:
                      </p>
                      <ul className="space-y-1">
                        {room.tips.map((tip, i) => (
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

            {filteredRooms.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No rooms match your filters. Try adjusting your selection.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-medium text-display mb-4">
              Ready to Transform Your Space?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse our curated collection of home decor products to bring these inspiring designs to life.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/90 transition-colors font-medium"
            >
              Shop Now
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
