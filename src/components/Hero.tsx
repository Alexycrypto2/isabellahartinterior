import { memo, useState } from "react";
import heroImage from "@/assets/hero-home-decor.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = memo(() => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
      {/* Background Image with loading state */}
      {!imageError && (
        <img 
          src={heroImage}
          alt="Beautiful home decor interior"
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-2xl">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm text-accent-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              Top-Rated Finds on Amazon
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-accent-foreground leading-[1.1] mb-6 reveal">
            Shop Top-Rated
            <br />
            <span className="italic">Home Decor — All Under $100</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-accent-foreground/80 font-light max-w-lg mb-8 reveal-delayed">
            Handpicked, high-rated pieces from Amazon — curated for modern, cozy, and stylish spaces. New finds added weekly.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4 reveal-delayed">
            <Link to="/shop">
              <Button 
                size="lg" 
                className="rounded-sm px-10 py-6 bg-accent text-accent-foreground hover:brightness-110 font-medium tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop on Amazon
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-sm px-10 py-6 border-accent-foreground/40 bg-accent-foreground/10 text-accent-foreground hover:bg-accent-foreground/20 hover:border-accent-foreground/60 font-medium tracking-wide backdrop-blur-sm transition-all duration-300"
              >
                Get Inspired
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-accent-foreground/60 reveal-delayed">
            As an Amazon Associate, I earn from qualifying purchases.
          </p>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 reveal-delayed hidden md:block">
        <div className="flex flex-col items-center gap-2 text-accent-foreground/60">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-accent-foreground/30" />
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
