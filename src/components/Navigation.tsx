import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Input } from "@/components/ui/input";
import { useActiveProducts } from "@/hooks/useProducts";
import { resolveImageUrl } from "@/lib/imageResolver";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useActiveProducts();
  const logoUrl = useBrandingLogo();

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
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4 md:py-5">
        <Link to="/" className="flex items-center group shrink-0" aria-label="Isabelle Hart Interiors — Home">
          <img
            src={logoUrl}
            alt="Isabelle Hart Interiors"
            className="h-7 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80 md:h-9"
          />
        </Link>
        
        <div className="hidden items-center space-x-8 md:flex">
          <Link to="/" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">
            Home
          </Link>
          <Link to="/blog" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">
            Decor Ideas
          </Link>
          <Link to="/blog?category=Rooms" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">
            Rooms
          </Link>
          <Link to="/blog?category=Style Guides" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">
            Style Guides
          </Link>
          <Link to="/shop" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">
            Shop My Finds
          </Link>
          <Link to="/about" className="text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground gold-underline">About</Link>
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
                    placeholder="Search the journal..."
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
                 aria-label="Search the journal"
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
          <Link to="/cart" className="relative h-9 w-9 inline-flex items-center justify-center hover:bg-muted rounded-md transition-colors" aria-label="Cart">
            <ShoppingCart className={`h-4 w-4 ${cartCount > 0 ? "text-accent" : ""}`} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
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
          <Link to="/cart" className="relative h-10 w-10 inline-flex items-center justify-center hover:bg-muted rounded-md transition-colors" aria-label="Cart">
            <ShoppingCart className={`h-5 w-5 ${cartCount > 0 ? "text-accent" : ""}`} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
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
                   placeholder="Search the journal..."
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
            <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/blog" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Decor Ideas</Link>
            <Link to="/blog?category=Rooms" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Rooms</Link>
            <Link to="/blog?category=Style Guides" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Style Guides</Link>
            <Link to="/shop" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Shop My Finds</Link>
            <Link to="/about" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>About</Link>
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
