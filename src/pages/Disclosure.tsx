import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Disclosure = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-32 pb-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-8">
                Affiliate Disclosure
              </h1>
              
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p className="text-lg leading-relaxed">
                  <strong className="text-foreground">Isabelle Hart Interiors</strong> is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
                </p>
                
                <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                  What This Means for You
                </h2>
                
                <p>
                  When you click on product links on our website and make a purchase on Amazon, we may earn a small commission at no additional cost to you. This helps us keep creating free content, curating products, and maintaining this website.
                </p>
                
                <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                  Our Promise to You
                </h2>
                
                <ul className="space-y-3 list-disc pl-6">
                  <li>
                    <strong className="text-foreground">We only recommend products we believe in.</strong> Every item on RoomRefine is handpicked based on quality, design, value, and customer reviews.
                  </li>
                  <li>
                    <strong className="text-foreground">Our opinions are our own.</strong> Affiliate commissions do not influence our product selections or recommendations.
                  </li>
                  <li>
                    <strong className="text-foreground">We prioritize your trust.</strong> We're transparent about our affiliate relationships and always aim to provide genuine value.
                  </li>
                </ul>
                
                <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                  Product Accuracy
                </h2>
                
                <p>
                  Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of that product.
                </p>
                
                <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                  Questions?
                </h2>
                
                <p>
                  If you have any questions about our affiliate relationships or anything else, please don't hesitate to <a href="/contact" className="text-primary hover:underline">contact us</a>.
                </p>
                
                <div className="mt-12 p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">FTC Disclosure:</strong> In accordance with the FTC guidelines, we disclose that we may receive compensation for products purchased through links on this website. This does not affect our editorial integrity or the price you pay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Disclosure;
