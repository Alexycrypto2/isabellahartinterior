import { useState, useEffect, useCallback } from "react";
import { X, Gift, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useSubscribeNewsletter } from "@/hooks/useNewsletterSubscribers";
import { useNewsletterSettings, DEFAULT_NEWSLETTER_SETTINGS } from "@/hooks/useNewsletterSettings";

const STORAGE_KEY = "cozy-nest-newsletter-shown";

export const EmailCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const subscribeMutation = useSubscribeNewsletter();
  const { data: settings, isLoading: settingsLoading } = useNewsletterSettings();

  const shouldShowPopup = useCallback((expiryDays: number) => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const { timestamp, subscribed } = JSON.parse(storedData);
      if (subscribed) return false; // Never show again if subscribed
      const daysSinceShown = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < expiryDays) return false;
    }
    return true;
  }, []);

  useEffect(() => {
    // Wait for settings to load
    if (settingsLoading) return;
    
    const config = settings || DEFAULT_NEWSLETTER_SETTINGS;
    
    // Check if popup is disabled
    if (!config.enabled) return;
    
    if (!shouldShowPopup(config.expiry_days)) return;

    let hasShown = false;
    const scrollThreshold = config.scroll_threshold / 100;
    const delayMs = config.delay_seconds * 1000;
    let timeoutId: NodeJS.Timeout;

    // Combined trigger: scroll threshold OR time delay
    const handleScroll = () => {
      if (hasShown) return;
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent >= scrollThreshold) {
        hasShown = true;
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
      }
    };

    // Time-based fallback
    timeoutId = setTimeout(() => {
      if (!hasShown) {
        hasShown = true;
        setIsOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    }, delayMs);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [shouldShowPopup, settings, settingsLoading]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await subscribeMutation.mutateAsync(email);
      setIsSuccess(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        timestamp: Date.now(),
        subscribed: true 
      }));
      toast({
        title: "You're in! 🎉",
        description: "Check your inbox for the Home Decor Essentials Guide.",
      });
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error: any) {
      if (error?.message?.includes("duplicate")) {
        toast({
          title: "Already subscribed!",
          description: "You're already on our list.",
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          timestamp: Date.now(),
          subscribed: true 
        }));
        setTimeout(() => setIsOpen(false), 1500);
      } else {
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] z-50"
        >
          <div className="bg-background rounded-2xl shadow-2xl overflow-hidden border border-border dark:border-border/60">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {!isSuccess ? (
              <div className="flex flex-col md:flex-row">
                {/* Icon section */}
                <div className="bg-gradient-to-br from-primary to-primary/80 p-5 flex items-center justify-center md:w-24">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 flex-1">
                  <h3 className="font-display text-lg font-medium mb-1 pr-6">
                    Free Design Guide
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get our 25-page home decor essentials guide with pro tips!
                  </p>
                  
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 rounded-full border-border text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="sm"
                      className="h-10 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        "Get It Free"
                      )}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium mb-1">
                  You're all set!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Check your inbox for your free guide 🏠
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
