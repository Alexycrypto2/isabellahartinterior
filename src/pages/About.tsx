import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Newsletter from "@/components/Newsletter";
import { Heart, Sparkles, Home, Users } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const About = () => {
  const { data: aboutSetting } = useSiteSetting('about');
  const about = (aboutSetting?.value || {}) as Record<string, string>;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label text-accent mb-4 block">Our Story</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              {about.title ? (
                <>
                  {about.title.split(' ').slice(0, -1).join(' ')}
                  <br />
                  <span className="italic">{about.title.split(' ').slice(-1)[0]}</span>
                </>
              ) : (
                <>
                  Welcome to
                  <br />
                  <span className="italic">Isabelle Hart Interiors</span>
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {about.description || 'An editorial journal of home decor ideas, room-by-room styling, and spaces with warmth and character.'}
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
                  It started with a love of rooms that feel lived in
                </h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    I'm Isabelle Hart, the editor behind Isabelle Hart Interiors. Like many of you, I spent
                    years saving rooms that moved me — sunlit linen, worn oak, plaster walls — and wondering
                    what made them feel so quietly right.
                  </p>

                  <p>
                    That curiosity became this journal: a place to study rooms closely, decode the formulas
                    designers use, and translate them into homes with warmth, character, and a point of view.
                  </p>

                  <p>
                    Today I research room-by-room styling guides, designer-approved palettes, and tactile
                    materials, so every story here gives you something real to bring home.
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
                        <h3 className="font-display text-xl font-medium mb-2">Thoughtfully Curated</h3>
                        <p className="text-muted-foreground text-sm">
                          Every piece and palette is chosen for craft, texture, and longevity.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Intentional Sourcing</h3>
                        <p className="text-muted-foreground text-sm">
                          A high-low approach: lasting investments paired with accessible accents.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-medium mb-2">Designer Formulas</h3>
                        <p className="text-muted-foreground text-sm">
                          Measurements, materials, and palettes you can actually use.
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
                <p className="text-sm text-muted-foreground">Pinterest Followers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Design Guides &amp; Room Studies</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">10K+</p>
                <p className="text-sm text-muted-foreground">Newsletter Subscribers</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-2">∞</p>
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
            <span className="text-label text-accent mb-4 block">Our Mission</span>
            <h2 className="font-display text-3xl md:text-5xl font-medium text-display mb-6">
              Homes with warmth, poise, and perspective
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              I believe everyone deserves to live in a space that brings them joy. Every guide here
              is written to help you shape rooms that feel personal and timeless. Whether you're 
              decorating your first apartment or refreshing your forever home, you'll find something 
              here to inspire you.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 text-accent">
              <Users className="w-5 h-5" />
              <span className="font-medium">Join 10,000+ home decor lovers</span>
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
              Isabelle Hart Interiors is a participant in the Amazon Services LLC Associates Program, 
              an affiliate advertising program designed to provide a means for sites to earn 
              advertising fees by advertising and linking to Amazon.com. This means I may earn 
              a small commission when you purchase through my links, at no extra cost to you. 
              This helps support the site and allows me to keep publishing in-depth design stories.
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
