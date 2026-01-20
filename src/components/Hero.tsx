import { memo, useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

// Get random image path - we'll lazy load the actual image
const heroImagePaths = [
  () => import("@/assets/hero-luxury.jpg"),
  () => import("@/assets/hero-bedroom.jpg"),
  () => import("@/assets/hero-dining.jpg"),
  () => import("@/assets/hero-reading.jpg"),
];

const Hero = memo(() => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [currentWord, setCurrentWord] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Load random image on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * heroImagePaths.length);
    heroImagePaths[randomIndex]().then((module) => {
      // Preload the image
      const img = new Image();
      img.src = module.default;
      img.onload = () => {
        setImageSrc(module.default);
        setImageLoaded(true);
      };
    });
  }, []);
  
  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  const rotatingWords = ["Modern", "Cozy", "Stylish", "Elegant"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
      {/* Placeholder gradient while image loads */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />
      
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y: imageY, scale: imageScale }}
      >
        {imageSrc && (
          <motion.img 
            src={imageSrc}
            alt="Beautiful home decor interior"
            width={1920}
            height={1080}
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full object-cover object-center"
          />
        )}
      </motion.div>
      
      {/* Premium Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      
      {/* Decorative Elements */}
      <motion.div 
        style={{ opacity }}
        className="absolute top-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse hidden lg:block" 
      />
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-40 left-10 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse hidden lg:block" 
      />
      
      {/* Floating Badge - Top Right */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{ opacity }}
        className="absolute top-32 right-8 lg:right-20 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl"
      >
        <div className="flex -space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <div className="text-sm">
          <span className="font-semibold text-gray-900">4.9</span>
          <span className="text-gray-600 ml-1">• 2.5k+ Reviews</span>
        </div>
      </motion.div>
      
      {/* Content with Parallax */}
      <motion.div 
        style={{ y: contentY, opacity }}
        className="relative z-10 container mx-auto px-6 py-32"
      >
        <div className="max-w-3xl">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium mb-8 border border-white/25 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400" />
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
            <h1 
              className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.05] mb-4"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
            >
              <span className="text-white">Discover</span>
              <br />
              <span className="relative inline-block">
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="italic text-amber-400"
                  style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
                >
                  {rotatingWords[currentWord]}
                </motion.span>
              </span>{" "}
              <span className="text-white">Living</span>
            </h1>
            <h2 
              className="font-display text-3xl md:text-4xl lg:text-5xl text-white/90 font-light italic mb-8"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              All Under $100
            </h2>
          </motion.div>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-white/85 font-light max-w-xl mb-10 leading-relaxed"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
          >
            Handpicked, high-rated pieces from Amazon — expertly curated 
            for spaces that feel like home. New collections every week.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <Link to="/shop">
              <Button 
                size="lg" 
                className="group relative rounded-full px-8 py-6 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold tracking-wide transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/30 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link to="/blog">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 py-6 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 font-semibold tracking-wide backdrop-blur-md transition-all duration-300"
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
            className="flex flex-wrap items-center gap-6 text-sm text-white/80"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-medium">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-medium">Trusted Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-medium">Curated Weekly</span>
            </div>
          </motion.div>
          
          {/* Amazon Affiliate Disclosure */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="text-xs text-white/50 mt-8"
          >
            As an Amazon Associate, I earn from qualifying purchases.
          </motion.p>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/60 cursor-pointer hover:text-white/80 transition-colors"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase">Explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
      
      {/* Decorative Corner Elements */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-0 right-0 w-1/3 h-32 bg-gradient-to-l from-amber-500/10 to-transparent hidden lg:block" 
      />
      <motion.div 
        style={{ opacity }}
        className="absolute top-0 left-0 w-px h-40 bg-gradient-to-b from-white/30 to-transparent ml-6 mt-24 hidden lg:block" 
      />
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;
