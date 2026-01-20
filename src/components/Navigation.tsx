import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {/* Elegant R monogram with Gold accent */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-gold opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-accent-foreground font-display text-xl font-bold tracking-tight">R</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">
              <span className="text-accent">Room</span><span className="text-foreground">Refine</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Interior Design</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 gold-underline">
            Shop
          </Link>
          <Link to="/inspiration" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 gold-underline">
            Inspiration
          </Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 gold-underline">
            Blog
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 gold-underline">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 gold-underline">
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-muted"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in-up">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link 
              to="/shop" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              to="/inspiration" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Inspiration
            </Link>
            <Link 
              to="/blog" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="pt-4 border-t border-border">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
