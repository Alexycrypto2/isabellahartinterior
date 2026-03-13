import { Link } from "react-router-dom";
import { Instagram, Mail, Facebook, Twitter, Youtube } from "lucide-react";
import { useSocialSettings } from "@/hooks/useSocialSettings";

const Footer = () => {
  const { data: socialLinks } = useSocialSettings();

  const hasSocialLinks = socialLinks && Object.values(socialLinks).some(link => link);

  return (
    <footer className="bg-muted dark:bg-muted/50 py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                {/* Gold IH monogram */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-lg bg-gradient-gold" />
                  <span className="relative text-accent-foreground font-display text-xs font-bold">IH</span>
                </div>
                <span className="font-display text-xl font-semibold">
                  <span className="text-accent">Isabelle Hart</span> <span className="text-foreground">Interiors</span>
                </span>
              </Link>
              <p className="text-muted-foreground text-sm mb-6">
                Curating beautiful home decor finds to help you create spaces you love.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks?.pinterest && (
                  <a 
                    href={socialLinks.pinterest} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="Pinterest"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="Twitter/X"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.youtube && (
                  <a 
                    href={socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.tiktok && (
                  <a 
                    href={socialLinks.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a 
                    href={socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {/* Fallback if no social links are set */}
                {!hasSocialLinks && (
                  <>
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
                  </>
                )}
                <a 
                  href="mailto:hello@isabellehartinteriors.com"
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
                  <Link to="/shop?category=lighting" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Lighting
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=decor-accents" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Decor & Accents
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=textiles" className="text-muted-foreground hover:text-accent transition-colors text-sm">
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

            {/* Legal */}
            <div className="md:col-span-1">
              <h4 className="font-display text-lg font-medium mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy-policy" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/returns-policy" className="text-muted-foreground hover:text-accent transition-colors text-sm">
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} Isabelle Hart Interiors. All rights reserved.
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
