import heroImage from "@/assets/hero-home-decor.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-2xl">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Curated Home Decor Finds
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-primary-foreground leading-[1.1] mb-6 reveal">
            Make Your House
            <br />
            <span className="italic">Feel Like Home</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/80 font-light max-w-lg mb-10 reveal-delayed">
            Discover handpicked home decor pieces that bring warmth, style, and personality to every corner of your space.
          </p>
          
          <div className="flex flex-wrap gap-4 reveal-delayed">
            <Link to="/shop">
              <Button 
                size="lg" 
                className="rounded-none px-10 py-6 bg-white text-neutral-900 hover:bg-white/95 font-medium tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-none px-10 py-6 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 font-medium tracking-wide backdrop-blur-sm transition-all duration-300"
              >
                Get Inspired
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 reveal-delayed hidden md:block">
        <div className="flex flex-col items-center gap-2 text-primary-foreground/60">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-primary-foreground/30" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
