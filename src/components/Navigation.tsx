import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logoIcon} 
            alt="RoomRefine" 
            className="h-10 w-10"
          />
          <span className="font-display text-xl font-semibold tracking-tight" style={{ color: '#C4A86B' }}>
            RoomRefine
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
            Shop
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
            Categories
          </Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
            Inspiration
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
            About
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300">
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
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              to="/categories" 
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/blog" 
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Inspiration
            </Link>
            <Link 
              to="/about" 
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
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
