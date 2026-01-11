import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Sparkles, Shirt, Calendar, Gift } from "lucide-react";

const Services = () => {
  const services = [
    {
      number: "01",
      title: "PERSONAL STYLING",
      description: "Expert guidance to discover your signature style and build a wardrobe that reflects your personality and lifestyle. Our stylists work closely with you to understand your preferences.",
      icon: Sparkles
    },
    {
      number: "02", 
      title: "WARDROBE EDIT",
      description: "Curated recommendations to maximize your existing pieces and identify strategic gaps. We'll help you create a cohesive collection that works effortlessly together.",
      icon: Shirt
    },
    {
      number: "03",
      title: "OCCASION STYLING",
      description: "Perfect looks for weddings, galas, vacations, and life's most memorable moments. Let us ensure you look stunning for every important event on your calendar.",
      icon: Calendar
    },
    {
      number: "04",
      title: "GIFT CONSULTING",
      description: "Thoughtful, curated gift recommendations for the fashion-lovers in your life. We'll help you find pieces that are both meaningful and beautifully on-trend.",
      icon: Gift
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <span className="text-label text-primary mb-4 block">What We Offer</span>
              <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
                Style <span className="italic">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Elevate your personal style with our curated services designed for the modern woman.
              </p>
            </div>
          </div>
        </section>
        
        {/* Services Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={index} className="group bg-card p-8 lg:p-10 rounded-lg border border-border hover:border-primary/30 hover:shadow-warm transition-all duration-300">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground font-medium tracking-wider">
                            {service.number}
                          </span>
                          <h3 className="font-display text-xl lg:text-2xl font-medium mb-4 text-foreground group-hover:text-primary transition-colors">
                            {service.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-medium text-display mb-6">
                Ready to Transform Your Wardrobe?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Get in touch to learn more about our styling services and how we can help you discover your signature look.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Services;