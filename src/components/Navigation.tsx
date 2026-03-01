import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useActiveProducts();

  const searchResults = searchQuery.trim().length >= 2
    ? (products || []).filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/shop?product=${productId}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsMenuOpen(false);
  };

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

        <div className="hidden md:flex items-center space-x-3">
          {/* Search */}
          <div ref={searchRef} className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 w-64 h-9 rounded-full border-border bg-background text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-muted"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search products"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Dropdown results */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <img
                          src={resolveImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.price} · {product.category}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit as any}
                      className="w-full px-4 py-2.5 text-sm text-accent hover:bg-muted/50 transition-colors border-t border-border text-center font-medium"
                    >
                      View all results →
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMenuOpen(false); }}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false); }}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in-up">
          <div className="container mx-auto px-6 py-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 rounded-full border-border bg-background"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
            {searchQuery.trim().length >= 2 && (
              <div className="mt-3 space-y-1">
                {searchResults.length > 0 ? searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-lg transition-colors text-left"
                  >
                    <img
                      src={resolveImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price} · {product.category}</p>
                    </div>
                  </button>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in-up">
          <div className="container mx-auto px-6 py-6 space-y-4">
            <Link to="/shop" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link to="/inspiration" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Inspiration</Link>
            <Link to="/blog" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Blog</Link>
            <Link to="/about" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>Contact</Link>
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
