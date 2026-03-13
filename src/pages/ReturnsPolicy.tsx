import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { ExternalLink, Info, RotateCcw, ShieldCheck } from "lucide-react";

const ReturnsPolicy = () => {
  const { data: setting } = useSiteSetting('legal_returns_policy');
  const custom = setting?.value as Record<string, any> | null;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-32 pb-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Returns & Refunds Policy
              </h1>
              <p className="text-muted-foreground mb-10 text-sm">
                Last updated: {custom?.last_updated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {custom?.custom_content ? (
                <div className="prose prose-lg max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: custom.custom_content }} />
              ) : (
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <div className="p-6 bg-accent/10 border border-accent/20 rounded-xl flex gap-4 items-start">
                    <Info className="w-6 h-6 text-accent shrink-0 mt-1" />
                    <p className="text-foreground m-0">
                      <strong>Isabelle Hart Interiors is an affiliate marketing website.</strong> We do not process orders, payments, or returns. All purchases are made directly through Amazon, and returns follow Amazon's policies.
                    </p>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Our Role
                  </h2>
                  <p>
                    Isabelle Hart Interiors curates and recommends home decor products available on Amazon. When you purchase a product through one of our affiliate links, the transaction occurs entirely on Amazon. We are not a party to the sale and therefore do not handle returns, exchanges, or refunds.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 my-8">
                    <div className="p-6 bg-muted rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <RotateCcw className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="font-display text-base font-medium text-foreground m-0">Returns</h3>
                      </div>
                      <p className="text-sm text-muted-foreground m-0">
                        All returns are processed through Amazon. Most items can be returned within 30 days of delivery.
                      </p>
                    </div>
                    <div className="p-6 bg-muted rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="font-display text-base font-medium text-foreground m-0">A-to-Z Guarantee</h3>
                      </div>
                      <p className="text-sm text-muted-foreground m-0">
                        Amazon's A-to-z Guarantee protects your purchases, covering both delivery and condition of items.
                      </p>
                    </div>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    How to Return a Product
                  </h2>
                  <p>
                    If you need to return a product purchased through an affiliate link on our website, please follow these steps:
                  </p>
                  <ol className="space-y-3 list-decimal pl-6">
                    <li>Log in to your <strong className="text-foreground">Amazon account</strong></li>
                    <li>Go to <strong className="text-foreground">Your Orders</strong></li>
                    <li>Find the item you wish to return</li>
                    <li>Click <strong className="text-foreground">"Return or Replace Items"</strong></li>
                    <li>Follow Amazon's return instructions</li>
                  </ol>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Amazon's Return Policy
                  </h2>
                  <p>
                    Amazon generally allows returns within 30 days of delivery for most items. Some items may have different return windows or conditions. For complete details about Amazon's return policy, please visit:
                  </p>
                  <a
                    href="https://www.amazon.com/returns"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors no-underline"
                  >
                    Amazon Returns Center
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Refunds
                  </h2>
                  <p>
                    Refunds for returned items are processed by Amazon according to their refund policy. Refund timelines depend on the payment method and the type of return. Typically, refunds are issued within 3–5 business days after Amazon receives the returned item.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Questions?
                  </h2>
                  <p>
                    If you have questions about our website, please{" "}
                    <a href="/contact" className="text-accent hover:underline">contact us</a>.
                    For order-specific issues (shipping, returns, refunds), please contact{" "}
                    <a href="https://www.amazon.com/hz/contact-us" target="_blank" rel="nofollow noopener noreferrer" className="text-accent hover:underline">
                      Amazon Customer Service
                    </a> directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ReturnsPolicy;