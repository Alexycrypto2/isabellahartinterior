import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
    if (error) {
      toast({
        title: error.code === "23505" ? "You're already on the list" : "Something went wrong",
        description: error.code === "23505" ? "This email is already subscribed." : "Please try again later.",
        variant: error.code === "23505" ? "default" : "destructive",
      });
    } else {
      toast({ title: "Welcome to the journal", description: "The next letter will be on its way soon." });
      setEmail("");
    }
    setIsSubmitting(false);
  };

  if (variant === "compact") {
    return (
      <div className={`border border-border bg-card p-6 ${className}`}>
        <div className="mb-3 flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /><h3 className="font-display text-2xl">Stay close</h3></div>
        <p className="mb-4 text-sm leading-6 text-muted-foreground">A short, thoughtful note from the journal.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
          <Button type="submit" disabled={isSubmitting} variant="outline">{isSubmitting ? "..." : "Join"}</Button>
        </form>
      </div>
    );
  }

  return (
    <section className={`border-b border-border bg-secondary py-20 md:py-28 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end md:gap-20">
          <div>
            <p className="text-label mb-4 text-accent">The Sunday letter</p>
            <h2 className="text-display max-w-md text-5xl font-normal leading-[0.98] md:text-6xl">Get beautiful home ideas in your inbox.</h2>
          </div>
          <div>
            <p className="max-w-lg text-lg leading-8 text-muted-foreground">Weekly decorating inspiration, practical styling tips, and beautiful finds — thoughtfully edited, never overwhelming.</p>
            <form onSubmit={handleSubmit} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="newsletter-input flex-1" />
              <Button type="submit" disabled={isSubmitting} size="lg" className="rounded-none px-8">{isSubmitting ? "Joining..." : "Join the list"}</Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">No noise. Unsubscribe any time.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;