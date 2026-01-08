import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import avatarSarah from "@/assets/avatar-sarah.jpg";
import avatarJessica from "@/assets/avatar-jessica.jpg";
import avatarEmily from "@/assets/avatar-emily.jpg";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, NY",
    text: "The quality of the cashmere sweater exceeded my expectations. Glamify has become my go-to for timeless, elegant pieces.",
    rating: 5,
    avatar: avatarSarah,
    initials: "SM",
    purchasedItem: "Cream Cashmere Sweater",
  },
  {
    id: 2,
    name: "Jessica L.",
    location: "Los Angeles, CA",
    text: "Finally found a fashion brand that understands minimalist luxury. Every piece I've ordered fits perfectly and looks stunning.",
    rating: 5,
    avatar: avatarJessica,
    initials: "JL",
    purchasedItem: "Taupe Leather Chain Bag",
  },
  {
    id: 3,
    name: "Emily R.",
    location: "Chicago, IL",
    text: "The journal's style guides helped me build a capsule wardrobe I actually love. And the jewelry collection is exquisite!",
    rating: 5,
    avatar: avatarEmily,
    initials: "ER",
    purchasedItem: "Minimalist Gold Jewelry Set",
  },
];

const SocialProof = memo(() => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-label text-primary mb-4 block">Loved by 15,000+ Women</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-display mb-4">
              What Our <span className="italic">Clients</span> Say
            </h2>
            <div className="divider-soft mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="bg-card p-8 rounded-sm border border-border relative">
                <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 + i * 0.08 }}>
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-accent/20">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Purchased: {testimonial.purchasedItem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">15,000+</p>
                <p className="text-sm text-muted-foreground">Happy Clients</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">4.9★</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl font-semibold text-foreground">200+</p>
                <p className="text-sm text-muted-foreground">Curated Pieces</p>
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