import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-home-decor.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = memo(() => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  
  const rotatingWords = ["Modern", "Cozy", "Stylish", "Elegant"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
      {/* Background Image with loading state */}
      {!imageError && (
        <motion.img 
          src={heroImage}
          alt="Beautiful home decor interior"
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="100vw"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          initial={{ scale: 1.1 }}
          animate={{ scale: imageLoaded ? 1 : 1.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Premium Multi-Layer Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse hidden lg:block" />
      <div className="absolute bottom-40 left-10 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse hidden lg:block" />
      
      {/* Floating Badge - Top Right */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute top-32 right-8 lg:right-20 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-background/80 backdrop-blur-md border border-border/50 shadow-xl"
      >
        <div className="flex -space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <div className="text-sm">
          <span className="font-semibold text-foreground">4.9</span>
          <span className="text-muted-foreground ml-1">• 2.5k+ Reviews</span>
        </div>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-3xl">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-accent/20 backdrop-blur-md text-accent-foreground text-sm font-medium mb-8 border border-accent/30 shadow-lg">
              <Sparkles className="w-4 h-4 text-accent" />
              Top-Rated Finds on Amazon
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </span>
          </motion.div>
          
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium text-accent-foreground leading-[1.05] mb-4">
              Discover
              <br />
              <span className="relative inline-block">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="italic text-accent"
                >
                  {rotatingWords[currentWord]}
                </motion.span>
              </span>{" "}
              Living
            </h1>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-accent-foreground/80 font-light italic mb-8">
              All Under $100
            </h2>
          </motion.div>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-accent-foreground/75 font-light max-w-xl mb-10 leading-relaxed"
          >
            Handpicked, high-rated pieces from Amazon — expertly curated 
            for spaces that feel like home. New collections every week.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-6"
          >
            <Link to="/shop">
              <Button 
                size="lg" 
                className="group relative rounded-full px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90 font-medium tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-accent/25 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/80 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
            <Link to="/blog">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 py-6 border-accent-foreground/30 bg-accent-foreground/5 text-accent-foreground hover:bg-accent-foreground/15 hover:border-accent-foreground/50 font-medium tracking-wide backdrop-blur-md transition-all duration-300"
              >
                Get Inspired
              </Button>
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-wrap items-center gap-6 text-sm text-accent-foreground/60"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Trusted Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Curated Weekly</span>
            </div>
          </motion.div>
          
          {/* Amazon Affiliate Disclosure */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="text-xs text-accent-foreground/50 mt-8"
          >
            As an Amazon Associate, I earn from qualifying purchases.
          </motion.p>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-accent-foreground/50 cursor-pointer hover:text-accent-foreground/70 transition-colors"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
      
      {/* Decorative Corner Elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-gradient-to-l from-accent/5 to-transparent hidden lg:block" />
      <div className="absolute top-0 left-0 w-px h-40 bg-gradient-to-b from-accent/30 to-transparent ml-6 mt-24 hidden lg:block" />
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
