import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Newsletter from "@/components/Newsletter";
import { Heart, Sparkles, Gem, Users } from "lucide-react";

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label text-accent mb-4 block tracking-[0.3em]">OUR STORY</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              Welcome to
              <br />
              <span className="italic text-accent">Glamify</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curating sophisticated fashion for the modern woman who values timeless elegance and contemporary style.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-medium text-display mb-6">
                  It started with a passion for timeless style
                </h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    Hi there! I'm the curator behind Glamify. Like many fashion-forward women, 
                    I spent endless hours searching for pieces that embodied both quality and 
                    style — investment pieces that would remain elegant season after season.
                  </p>
                  
                  <p>
                    After years of building my own wardrobe and helping friends discover their 
                    signature style, I realized there was a need for a curated destination where 
                    women could find sophisticated, versatile pieces without the endless searching.
                  </p>
                  
                  <p>
                    Now, I dedicate my time to finding the most beautiful, high-quality fashion 
                    pieces so you can focus on what matters — expressing your unique style. Every 
                    item on Glamify has been personally selected for elegance, versatility, and value.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-accent rounded-3xl p-10 lg:p-14">
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Curated with Care</h3>
                        <p className="text-muted-foreground text-sm">
                          Every piece is personally selected for quality, style, and versatility.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Gem className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Timeless Elegance</h3>
                        <p className="text-muted-foreground text-sm">
                          Investment pieces that transcend trends and last for years.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Style Expertise</h3>
                        <p className="text-muted-foreground text-sm">
                          Expert guides to help you build your perfect wardrobe.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">50K+</p>
                <p className="text-sm text-muted-foreground">Style-Conscious Followers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Curated Pieces</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">15K+</p>
                <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">∞</p>
                <p className="text-sm text-muted-foreground">Love for Fashion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-label text-accent mb-4 block tracking-[0.3em]">OUR MISSION</span>
            <h2 className="font-display text-3xl md:text-5xl font-medium text-display mb-6">
              Making luxury style accessible to every woman
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We believe every woman deserves to feel confident and elegant in what she wears. 
              That's why we're committed to finding sophisticated fashion that doesn't compromise 
              on quality or style. Whether you're building a capsule wardrobe or looking for 
              that perfect statement piece, you'll find something here to inspire you.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 text-accent">
              <Users className="w-5 h-5" />
              <span className="font-medium">Join 15,000+ style-conscious women</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Affiliate Disclosure */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-xl font-medium mb-4">Affiliate Disclosure</h3>
            <p className="text-sm text-muted-foreground">
              Glamify is a participant in affiliate advertising programs designed to provide 
              a means for sites to earn advertising fees by advertising and linking to partner 
              retailers. This means we may earn a small commission when you purchase through our 
              links, at no extra cost to you. This helps support the site and allows us to keep 
              curating beautiful fashion finds for you!
            </p>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </PageTransition>
  );
};

export default About;