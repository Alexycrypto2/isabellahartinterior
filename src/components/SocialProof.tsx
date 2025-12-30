import { memo } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "New York, NY",
    text: "Room Refine has completely transformed how I shop for home decor. Every recommendation has been spot-on for my aesthetic!",
    rating: 5,
    avatar: "SM",
  },
  {
    id: 2,
    name: "Jessica L.",
    location: "Austin, TX",
    text: "I've saved so much time finding the perfect pieces. The curated selection makes shopping for decor actually enjoyable.",
    rating: 5,
    avatar: "JL",
  },
  {
    id: 3,
    name: "Emily R.",
    location: "Los Angeles, CA",
    text: "The styling tips on the blog are gold! I've completely redone my living room based on their suggestions.",
    rating: 5,
    avatar: "ER",
  },
];

const featuredIn = [
  { name: "Apartment Therapy", logo: "🏠" },
  { name: "House Beautiful", logo: "✨" },
  { name: "Elle Decor", logo: "🌟" },
  { name: "Architectural Digest", logo: "🏛️" },
  { name: "Better Homes", logo: "🌿" },
];

const SocialProof = memo(() => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-label text-primary mb-4 block">Trusted by Thousands</span>
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
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
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
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured In */}
          <div className="text-center">
            <p className="text-label text-muted-foreground mb-8">As Featured In</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {featuredIn.map((brand) => (
                <div
                  key={brand.name}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <span className="text-2xl">{brand.logo}</span>
                  <span className="font-display text-lg font-medium">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SocialProof.displayName = "SocialProof";

export default SocialProof;