import { useState, useEffect } from "react";
import { X, Gift, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const POPUP_DELAY = 15000; // 15 seconds
const STORAGE_KEY = "build-better-popup-shown";
const STORAGE_EXPIRY_DAYS = 7; // Don't show again for 7 days

export const EmailCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if popup was already shown recently
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const { timestamp } = JSON.parse(storedData);
      const daysSinceShown = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < STORAGE_EXPIRY_DAYS) {
        return; // Don't show popup
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Store that popup was shown
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

    // Simulate API call (replace with actual email service integration)
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Store that user subscribed
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      timestamp: Date.now(),
      subscribed: true 
    }));

    toast({
      title: "You're in! 🎉",
      description: "Check your inbox for the Home Decor Essentials Guide.",
    });

    // Close popup after success
    setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[60]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-[90vw] max-w-md"
          >
            <div className="bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground mb-2">
                  Free Design Guide
                </h2>
                <p className="text-primary-foreground/90 text-sm">
                  25 pages of pro tips & checklists
                </p>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {!isSuccess ? (
                  <>
                    <h3 className="font-display text-xl font-medium text-center mb-2">
                      Home Decor Essentials Guide
                    </h3>
                    <p className="text-muted-foreground text-center text-sm mb-6">
                      Get our most popular guide with room-by-room tips, 
                      budget hacks, and a complete decorating checklist.
                    </p>

                    {/* Benefits */}
                    <ul className="space-y-2 mb-6">
                      {[
                        "Room-by-room styling checklists",
                        "Budget-friendly decorating tips",
                        "Color palette inspiration",
                        "Exclusive product recommendations"
                      ].map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 rounded-full border-border"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Get My Free Guide"
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-medium mb-2">
                      You're all set!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Check your inbox for your free guide. Happy decorating! 🏠
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
