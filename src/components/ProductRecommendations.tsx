import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const styles = ["Modern Minimalist", "Boho Chic", "Scandinavian", "Traditional"];
const rooms = ["Living Room", "Bedroom", "Dining Room", "Home Office"];
const budgets = ["Under $50", "$50-$100", "Over $100", "No Budget Limit"];
const priorities = ["Style & Aesthetics", "Comfort & Coziness", "Functionality", "Value for Money"];

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
      setTimeout(() => setStep(step + 1), 200);
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
      // Only log in development to prevent info leakage
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
    { key: "style" as const, question: "What's your preferred style?", options: styles },
    { key: "room" as const, question: "Which room are you decorating?", options: rooms },
    { key: "budget" as const, question: "What's your budget range?", options: budgets },
    { key: "priority" as const, question: "What matters most to you?", options: priorities },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recommendations
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Find Your Perfect Pieces
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions and our AI will curate personalized product recommendations just for you.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step < 4 ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-background rounded-2xl p-8 shadow-lg border border-border"
              >
                {step < 4 && (
                  <>
                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= step ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>

                    <h3 className="font-display text-xl font-semibold mb-6">
                      {questions[step].question}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {questions[step].options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelect(questions[step].key, option)}
                          className={`p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:bg-primary/5 ${
                            preferences[questions[step].key] === option
                              ? "border-primary bg-primary/10"
                              : "border-border"
                          }`}
                        >
                          <span className="font-medium">{option}</span>
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
                          className="w-full"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Finding your perfect products...
                            </>
                          ) : (
                            <>
                              Get My Recommendations
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-xl font-semibold">
                    Your Personalized Picks
                  </h3>
                  <Button variant="outline" size="sm" onClick={reset}>
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
                        transition={{ delay: index * 0.1 }}
                        className="bg-background rounded-xl p-4 shadow-lg border border-border flex gap-4"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-primary font-medium">{product.price}</p>
                            </div>
                            {product.badge && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {rec.reason}
                          </p>
                          <a
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                          >
                            View Product <ArrowRight className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
