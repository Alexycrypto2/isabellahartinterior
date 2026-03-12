import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { Package, ExternalLink, Info } from "lucide-react";

const ShippingPolicy = () => {
  const { data: setting } = useSiteSetting('legal_shipping_policy');
  const custom = setting?.value as Record<string, any> | null;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-32 pb-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Shipping Policy
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
                      <strong>RoomRefine is an affiliate marketing website.</strong> We do not sell, stock, or ship any products directly. All products featured on our site are sold and fulfilled by Amazon.
                    </p>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    How It Works
                  </h2>
                  <p>
                    When you click on a product link on RoomRefine, you are redirected to Amazon.com where the product is sold. All ordering, payment processing, and shipping are handled entirely by Amazon.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-4 my-8">
                    <div className="p-5 bg-muted rounded-xl text-center">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🔗</span>
                      </div>
                      <h3 className="font-display text-sm font-medium text-foreground mb-1">Browse & Click</h3>
                      <p className="text-xs text-muted-foreground">Find products you love on RoomRefine</p>
                    </div>
                    <div className="p-5 bg-muted rounded-xl text-center">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="font-display text-sm font-medium text-foreground mb-1">Shop on Amazon</h3>
                      <p className="text-xs text-muted-foreground">Complete your purchase on Amazon.com</p>
                    </div>
                    <div className="p-5 bg-muted rounded-xl text-center">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📦</span>
                      </div>
                      <h3 className="font-display text-sm font-medium text-foreground mb-1">Amazon Ships</h3>
                      <p className="text-xs text-muted-foreground">Amazon handles all shipping & delivery</p>
                    </div>
                  </div>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Shipping Information
                  </h2>
                  <p>
                    Since all products are sold and shipped by Amazon, shipping options, costs, and delivery times vary depending on:
                  </p>
                  <ul className="space-y-2 list-disc pl-6">
                    <li>The specific product and seller</li>
                    <li>Your delivery location</li>
                    <li>Your Amazon membership status (Prime vs. non-Prime)</li>
                    <li>Available shipping methods</li>
                  </ul>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Check Amazon for Details
                  </h2>
                  <p>
                    For specific shipping information, costs, estimated delivery dates, and tracking, please visit the product page on Amazon or check your Amazon account after placing an order.
                  </p>
                  <a
                    href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468520"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors no-underline"
                  >
                    View Amazon Shipping Info
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Questions?
                  </h2>
                  <p>
                    If you have any questions about how our site works, please{" "}
                    <a href="/contact" className="text-accent hover:underline">contact us</a>.
                    For shipping-related inquiries about a specific order, please contact Amazon directly.
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

export default ShippingPolicy;