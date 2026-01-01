import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                {/* Gold R monogram */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-lg bg-gradient-gold" />
                  <span className="relative text-accent-foreground font-display text-base font-bold">R</span>
                </div>
                <span className="font-display text-xl font-semibold">
                  <span className="text-accent">Room</span><span className="text-foreground">Refine</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-6">
                Curating beautiful home decor finds to help you create spaces you love.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                  aria-label="Pinterest"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="mailto:hello@roomrefine.com"
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg font-medium mb-4">Shop</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/shop" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories?filter=lighting" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Lighting
                  </Link>
                </li>
                <li>
                  <Link to="/categories?filter=decor" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Decor & Accents
                  </Link>
                </li>
                <li>
                  <Link to="/categories?filter=textiles" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Textiles
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-display text-lg font-medium mb-4">Inspiration</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/blog" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/blog/cozy-bedroom-styling-guide" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Bedroom Ideas
                  </Link>
                </li>
                <li>
                  <Link to="/blog/living-room-styling-tips" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Living Room Tips
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-display text-lg font-medium mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/disclosure" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Affiliate Disclosure
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} RoomRefine. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm text-center md:text-right">
                As an Amazon Associate, I earn from qualifying purchases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
