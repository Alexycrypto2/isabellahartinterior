import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Heart, Sparkles, Home, Users } from "lucide-react";

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label text-primary mb-4 block">Our Story</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              Welcome to
              <br />
              <span className="italic">Cozy Nest</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Helping you create spaces that feel like home, one beautiful find at a time.
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
                  It started with a Pinterest board and a dream home
                </h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    Hi there! I'm the creator behind Cozy Nest Decor. Like many of you, I spent 
                    countless hours scrolling through Pinterest, saving beautiful home inspiration 
                    but never quite knowing where to find the pieces I loved.
                  </p>
                  
                  <p>
                    After moving into my first apartment and struggling to create that "Pinterest-worthy" 
                    space on a budget, I realized there had to be a better way. That's when I started 
                    curating the best home decor finds from Amazon – pieces that look expensive but 
                    won't break the bank.
                  </p>
                  
                  <p>
                    Now, I spend my days hunting down the most beautiful, cozy, and affordable home 
                    decor so you don't have to. Every product on this site has been personally vetted 
                    for quality, style, and value.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-accent rounded-3xl p-10 lg:p-14">
                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Handpicked with Love</h3>
                        <p className="text-muted-foreground text-sm">
                          Every product is personally selected for quality and style.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Budget-Friendly Finds</h3>
                        <p className="text-muted-foreground text-sm">
                          Beautiful home decor that won't break the bank.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Styling Inspiration</h3>
                        <p className="text-muted-foreground text-sm">
                          Tips and guides to help you style like a pro.
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
                <p className="font-display text-4xl md:text-5xl font-medium text-primary mb-2">50K+</p>
                <p className="text-sm text-muted-foreground">Pinterest Followers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-primary mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Curated Products</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-primary mb-2">10K+</p>
                <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-primary mb-2">∞</p>
                <p className="text-sm text-muted-foreground">Love for Home Decor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-label text-primary mb-4 block">Our Mission</span>
            <h2 className="font-display text-3xl md:text-5xl font-medium text-display mb-6">
              Making beautiful homes accessible to everyone
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              I believe everyone deserves to live in a space that brings them joy. That's why I'm 
              committed to finding affordable decor that doesn't compromise on style. Whether you're 
              decorating your first apartment or refreshing your forever home, you'll find something 
              here to inspire you.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground">
              <Users className="w-5 h-5" />
              <span className="font-medium">Join 10,000+ home decor lovers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-display text-xl font-medium mb-4">Affiliate Disclosure</h3>
            <p className="text-sm text-muted-foreground">
              Cozy Nest Decor is a participant in the Amazon Services LLC Associates Program, 
              an affiliate advertising program designed to provide a means for sites to earn 
              advertising fees by advertising and linking to Amazon.com. This means I may earn 
              a small commission when you purchase through my links, at no extra cost to you. 
              This helps support the site and allows me to keep curating beautiful finds for you!
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
