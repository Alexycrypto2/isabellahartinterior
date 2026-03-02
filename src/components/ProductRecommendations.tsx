import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, RefreshCw, Palette, Home, Wallet, Heart, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { withUtm } from "@/lib/utm";
import { useToast } from "@/hooks/use-toast";
import StarRating from "@/components/StarRating";

type Preferences = {
  style: string;
  room: string;
  budget: string;
  priority: string;
};

type Recommendation = {
  productId: string;
  reason: string;
};

const styleOptions = [
  { label: "Modern Minimalist", icon: "🏛️", desc: "Clean lines & simplicity" },
  { label: "Boho Chic", icon: "🌿", desc: "Eclectic & free-spirited" },
  { label: "Scandinavian", icon: "❄️", desc: "Warm & functional" },
  { label: "Traditional", icon: "🏡", desc: "Classic & timeless" },
  { label: "Industrial Chic", icon: "⚙️", desc: "Raw & urban" },
  { label: "Coastal Retreat", icon: "🌊", desc: "Breezy & relaxed" },
];

const roomOptions = [
  { label: "Living Room", icon: "🛋️", desc: "The heart of your home" },
  { label: "Bedroom", icon: "🛏️", desc: "Your personal sanctuary" },
  { label: "Dining Room", icon: "🍽️", desc: "Where memories are made" },
  { label: "Home Office", icon: "💻", desc: "Productive & inspiring" },
];

const budgetOptions = [
  { label: "Under $50", icon: "💰", desc: "Smart finds" },
  { label: "$50-$100", icon: "💎", desc: "Best value" },
  { label: "Over $100", icon: "✨", desc: "Premium picks" },
  { label: "No Budget Limit", icon: "👑", desc: "The very best" },
];

const priorityOptions = [
  { label: "Style & Aesthetics", icon: "🎨", desc: "Look & feel first" },
  { label: "Comfort & Coziness", icon: "☁️", desc: "Maximum comfort" },
  { label: "Functionality", icon: "🔧", desc: "Practical & useful" },
  { label: "Value for Money", icon: "⭐", desc: "Best bang for buck" },
];

const questionIcons = [Palette, Home, Wallet, Heart];

export const ProductRecommendations = () => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<Preferences>({
    style: "",
    room: "",
    budget: "",
    priority: "",
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSelect = (key: keyof Preferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (step < 3) {
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("product-recommendations", {
        body: { preferences },
      });

      if (error) throw error;
      
      setRecommendations(data.recommendations || []);
      setStep(4);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Recommendations error:", error instanceof Error ? error.message : "Unknown error");
      }
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setPreferences({ style: "", room: "", budget: "", priority: "" });
    setRecommendations([]);
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const questions = [
    { key: "style" as const, question: "What's your design style?", subtitle: "Choose the aesthetic that speaks to you", options: styleOptions },
    { key: "room" as const, question: "Which room are you styling?", subtitle: "We'll tailor picks for your space", options: roomOptions },
    { key: "budget" as const, question: "What's your budget range?", subtitle: "Great finds at every price point", options: budgetOptions },
    { key: "priority" as const, question: "What matters most to you?", subtitle: "This helps us prioritize the perfect match", options: priorityOptions },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-gold text-accent-foreground px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Style Assistant
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4"
          >
            Your Perfect Decor,{" "}
            <span className="text-accent">Handpicked by AI</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Answer 4 quick questions and our AI stylist will curate personalized Amazon picks just for you. No sign-up needed.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step < 4 ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-background rounded-2xl p-6 md:p-10 shadow-xl border border-border"
              >
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                          i < step ? "bg-accent" : i === step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      <span className={`text-[10px] font-medium hidden sm:block ${
                        i <= step ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {["Style", "Room", "Budget", "Priority"][i]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center mb-8">
                  {(() => {
                    const Icon = questionIcons[step];
                    return (
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    );
                  })()}
                  <h3 className="font-display text-2xl font-semibold mb-2">
                    {questions[step].question}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {questions[step].subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {questions[step].options.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleSelect(questions[step].key, option.label)}
                      className={`group p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                        preferences[questions[step].key] === option.label
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:bg-primary/5"
                      }`}
                    >
                      <span className="text-2xl block mb-2">{option.icon}</span>
                      <span className="font-semibold text-sm block">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </button>
                  ))}
                </div>

                {step === 3 && preferences.priority && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={getRecommendations}
                      disabled={isLoading}
                      className="w-full bg-gradient-gold hover:opacity-90 text-accent-foreground shadow-lg"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Our AI stylist is curating your picks...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Get My Personalized Picks
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* Navigation */}
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto block"
                  >
                    ← Go back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-background rounded-2xl p-6 md:p-8 shadow-xl border border-border">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-accent fill-accent" />
                        <h3 className="font-display text-xl font-semibold">
                          Your Personalized Picks
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on your {preferences.style.toLowerCase()} style for your {preferences.room.toLowerCase()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={reset} className="shrink-0">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {recommendations.map((rec, index) => {
                      const product = getProduct(rec.productId);
                      if (!product) return null;

                      return (
                        <motion.div
                          key={rec.productId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 p-4 group"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg"
                            />
                            {product.badge && (
                              <span className="absolute top-2 left-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium shadow">
                                {product.badge}
                              </span>
                            )}
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-primary">
                              #{index + 1} Pick
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={product.rating} />
                              <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-lg font-bold text-primary">{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{rec.reason}"
                            </p>
                            <a
                              href={withUtm(product.affiliateUrl, "ai-stylist", "recommendation")}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline mt-3 group-hover:gap-2 transition-all"
                            >
                              Shop on Amazon <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {recommendations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recommendations found. Please try again with different preferences.</p>
                      <Button onClick={reset} className="mt-4" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  As an Amazon Associate, I earn from qualifying purchases. Recommendations are AI-generated based on your preferences.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
