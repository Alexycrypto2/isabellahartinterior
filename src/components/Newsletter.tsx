import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Welcome to Cozy Nest! Check your inbox for a welcome gift 🎁");
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="py-24 bg-gradient-accent">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free Styling Guide Inside
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">
            Join the Cozy Nest
            <br />
            <span className="italic">Community</span>
          </h2>
          
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Get weekly styling tips, exclusive product finds, and early access to sales. 
            Plus, a free home styling guide when you subscribe!
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input flex-1"
            />
            <Button 
              type="submit" 
              size="lg"
              className="rounded-full px-8"
              disabled={isLoading}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-4">
            No spam, unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
