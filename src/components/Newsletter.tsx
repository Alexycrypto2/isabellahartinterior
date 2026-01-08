import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewsletterProps {
  variant?: "default" | "compact";
  className?: string;
}

const Newsletter = ({ variant = "default", className = "" }: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Welcome to Glamify!", description: "You'll receive exclusive style updates in your inbox." });
    setEmail("");
    setIsSubmitting(false);
  };

  if (variant === "compact") {
    return (
      <div className={`bg-muted rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-medium">Stay Styled</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Get weekly style tips and exclusive offers.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-4 py-2 text-sm border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-accent/40" />
          <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:brightness-110 rounded-sm px-4">{isSubmitting ? "..." : "Join"}</Button>
        </form>
      </div>
    );
  }

  return (
    <section className={`py-20 bg-muted/50 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Join 15,000+ Style-Conscious Women</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-display mb-4">Get Exclusive Style Updates & Early Access</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Be the first to know about new arrivals, styling tips, and members-only offers.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="newsletter-input flex-1" />
            <Button type="submit" disabled={isSubmitting} size="lg" className="bg-accent text-accent-foreground hover:brightness-110 rounded-sm px-8 py-4 font-medium tracking-wide">{isSubmitting ? "Subscribing..." : "Subscribe"}</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">No spam, unsubscribe anytime. We respect your privacy.</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;