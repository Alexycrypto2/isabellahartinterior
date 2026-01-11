import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import lookbook1 from "@/assets/lookbook-1.jpg";
import lookbook2 from "@/assets/lookbook-2.jpg";
import lookbook3 from "@/assets/lookbook-3.jpg";
import lookbook4 from "@/assets/lookbook-4.jpg";
import lookbook5 from "@/assets/lookbook-5.jpg";
import lookbook6 from "@/assets/lookbook-6.jpg";

const Work = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  
  const lookbooks = [
    {
      image: lookbook1,
      title: "WINTER LUXE",
      collection: "SEASONAL 2024",
      category: "OUTERWEAR",
      description: "Elegant cream coats and layered knits for the discerning winter wardrobe. Investment pieces that transcend seasons.",
      pieces: "12 LOOKS",
      season: "WINTER"
    },
    {
      image: lookbook2,
      title: "POWER DRESSING",
      collection: "WORKWEAR EDIT",
      category: "PROFESSIONAL",
      description: "Sharp tailoring meets modern femininity. Blazers, trousers, and elevated separates for commanding the room.",
      pieces: "18 LOOKS",
      season: "ALL YEAR"
    },
    {
      image: lookbook3,
      title: "GOLDEN HOUR",
      collection: "EVENING WEAR",
      category: "EVENING",
      description: "Champagne satin, delicate jewelry, and timeless elegance for life's most memorable celebrations.",
      pieces: "8 LOOKS",
      season: "SPECIAL"
    },
    {
      image: lookbook4,
      title: "WEEKEND EASE",
      collection: "CASUAL LUXE",
      category: "CASUAL",
      description: "Elevated everyday essentials. Cozy knits paired with designer accessories for effortless sophistication.",
      pieces: "15 LOOKS",
      season: "ALL YEAR"
    },
    {
      image: lookbook5,
      title: "OFFICE POLISH",
      collection: "CORPORATE CHIC",
      category: "PROFESSIONAL",
      description: "Silk blouses, tailored skirts, and refined accessories. The formula for polished perfection.",
      pieces: "10 LOOKS",
      season: "ALL YEAR"
    },
    {
      image: lookbook6,
      title: "AUTUMN LAYERS",
      collection: "FALL ESSENTIALS",
      category: "OUTERWEAR",
      description: "Chunky knits and leather accents for cozy-meets-chic autumn dressing. Texture play at its finest.",
      pieces: "14 LOOKS",
      season: "FALL"
    }
  ];

  const categories = ["ALL", "OUTERWEAR", "PROFESSIONAL", "EVENING", "CASUAL"];

  const filteredLookbooks = activeCategory === "ALL" 
    ? lookbooks 
    : lookbooks.filter(look => look.category === activeCategory);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-label text-primary mb-4 block"
              >
                Style Portfolio
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl md:text-7xl font-medium text-display mb-6"
              >
                Our <span className="italic">Lookbooks</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Curated collections showcasing our styling philosophy. Each lookbook tells a story of elegance, quality, and timeless appeal.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="pb-16">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 text-sm tracking-wider rounded-full transition-all duration-300 ${
                    activeCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Lookbooks Grid */}
        <section className="pb-24">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                {filteredLookbooks.map((lookbook, index) => (
                  <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-6">
                      <img 
                        src={lookbook.image} 
                        alt={lookbook.title}
                        className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-xs font-medium text-foreground tracking-wider">
                          {lookbook.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-display text-2xl font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                          {lookbook.title}
                        </h3>
                        <p className="text-sm text-muted-foreground tracking-wider">
                          {lookbook.collection}
                        </p>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {lookbook.description}
                      </p>
                      
                      <div className="flex gap-8 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 tracking-wider">PIECES</p>
                          <p className="text-foreground font-medium">{lookbook.pieces}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 tracking-wider">SEASON</p>
                          <p className="text-foreground font-medium">{lookbook.season}</p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-medium text-display mb-6">
                Want to Recreate These Looks?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Shop our curated collection to find the pieces featured in our lookbooks.
              </p>
              <a 
                href="/shop" 
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                Shop the Collection
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Work;