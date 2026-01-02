import { memo } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, NY",
    text: "Found the perfect rattan pendant light for my dining room — rated 4.8 stars on Amazon and under $90! RoomRefine made it so easy.",
    rating: 5,
    avatar: "SM",
    purchasedItem: "Boho Rattan Pendant Light",
  },
  {
    id: 2,
    name: "Jessica L.",
    location: "Austin, TX",
    text: "I've saved so much time finding top-rated pieces. The curated Amazon selection makes shopping for decor actually enjoyable.",
    rating: 5,
    avatar: "JL",
    purchasedItem: "Ceramic Decorative Vase Set",
  },
  {
    id: 3,
    name: "Emily R.",
    location: "Los Angeles, CA",
    text: "The styling tips on the blog are gold! Found a bestselling throw blanket through their links — 5 stars and under $50!",
    rating: 5,
    avatar: "ER",
    purchasedItem: "Chunky Knit Throw Blanket",
  },
];

const SocialProof = memo(() => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-label text-primary mb-4 block">Loved by 10,000+ Home Decor Shoppers</span>
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
                className="bg-card p-8 rounded-sm border border-border relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Purchased: {testimonial.purchasedItem}</p>
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