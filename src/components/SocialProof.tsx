import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarJessica from "@/assets/avatar-jessica.jpg";
import avatarEmily from "@/assets/avatar-emily.jpg";
import ugcLivingRoom from "@/assets/ugc-living-room.jpg";
import ugcBedroom from "@/assets/ugc-bedroom.jpg";
import ugcShelfStyling from "@/assets/ugc-shelf-styling.jpg";
import OptimizedImage from "@/components/OptimizedImage";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, NY",
    text: "Found the perfect rattan pendant light for my dining room — rated 4.8 stars on Amazon and under $90! Isabelle Hart Interiors made it so easy.",
    rating: 5,
    avatar: avatarSarah,
    initials: "SM",
    purchasedItem: "Boho Rattan Pendant Light",
    lifestyleImage: ugcLivingRoom,
  },
  {
    id: 2,
    name: "Jessica L.",
    location: "Austin, TX",
    text: "I've saved so much time finding top-rated pieces. The curated Amazon selection makes shopping for decor actually enjoyable.",
    rating: 5,
    avatar: avatarJessica,
    initials: "JL",
    purchasedItem: "Ceramic Decorative Vase Set",
    lifestyleImage: ugcShelfStyling,
  },
  {
    id: 3,
    name: "Emily R.",
    location: "Los Angeles, CA",
    text: "The styling tips on the blog are gold! Found a bestselling throw blanket through their links — 5 stars and under $50!",
    rating: 5,
    avatar: avatarEmily,
    initials: "ER",
    purchasedItem: "Chunky Knit Throw Blanket",
    lifestyleImage: ugcBedroom,
  },
];

const SocialProof = memo(() => {
  return (
    <section className="py-20 bg-muted/30 dark:bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-label text-muted-foreground mb-4 block">Loved by 10,000+ Home Decor Shoppers</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-display mb-4">
              What Our <span className="italic">Community</span> Says
            </h2>
            <div className="divider-soft mt-6" />
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-card dark:bg-card/80 rounded-xl overflow-hidden border border-border relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Lifestyle Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  <OptimizedImage
                    src={testimonial.lifestyleImage}
                    alt={`${testimonial.name}'s home styled with ${testimonial.purchasedItem}`}
                    width={400}
                    height={300}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>

                <div className="p-8 relative">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: index * 0.1 + i * 0.08,
                        type: "spring",
                        stiffness: 400,
                        damping: 15
                      }}
                      whileHover={{ scale: 1.3, rotate: 15 }}
                      className="cursor-default"
                    >
                      <Star className="w-4 h-4 fill-accent text-accent drop-shadow-[0_0_4px_hsl(var(--accent)/0.5)] transition-all duration-200 hover:drop-shadow-[0_0_10px_hsl(var(--accent))]" />
                    </motion.div>
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Purchased: {testimonial.purchasedItem}</p>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Happy Shoppers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">4.8★</p>
                <p className="text-sm text-muted-foreground">Avg. Product Rating</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Curated Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SocialProof.displayName = "SocialProof";

export default SocialProof;