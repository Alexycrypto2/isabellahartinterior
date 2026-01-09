import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, Instagram } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent! We'll get back to you soon 💌");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-label text-primary mb-4 block">Get In Touch</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              Let's Connect
            </h1>
            <p className="text-xl text-muted-foreground">
              Have a styling question, want to collaborate, or just want to say hello? 
              We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-16">
              
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-10">
                <div>
                  <h2 className="font-display text-2xl font-medium mb-6">
                    Ways to Connect
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Whether you need styling advice, want to collaborate on a project, 
                    or just want to share your latest outfit win — we're here for it all!
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email Us</h3>
                      <a 
                        href="mailto:hello@glamify.com" 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        hello@glamify.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.627-.134-1.594.028-2.28.147-.627.946-4.012.946-4.012s-.241-.484-.241-1.199c0-1.123.652-1.962 1.462-1.962.69 0 1.023.518 1.023 1.139 0 .694-.442 1.732-.67 2.694-.19.805.404 1.462 1.199 1.462 1.439 0 2.544-1.517 2.544-3.703 0-1.936-1.392-3.29-3.38-3.29-2.302 0-3.654 1.727-3.654 3.513 0 .695.268 1.441.602 1.847a.242.242 0 0 1 .056.232c-.061.256-.199.805-.226.918-.035.147-.116.178-.268.107-1-.466-1.625-1.928-1.625-3.103 0-2.525 1.835-4.844 5.29-4.844 2.777 0 4.937 1.979 4.937 4.623 0 2.759-1.739 4.981-4.153 4.981-.811 0-1.573-.422-1.835-.92l-.499 1.902c-.181.695-.67 1.566-.997 2.097A12 12 0 1 0 12 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Follow on Pinterest</h3>
                      <a 
                        href="https://pinterest.com/glamify" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        @glamify
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Instagram</h3>
                      <a 
                        href="https://instagram.com/glamify" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        @glamify
                      </a>
                    </div>
                  </div>
                </div>

                {/* FAQ Quick Links */}
                <div className="pt-8 border-t border-border">
                  <h3 className="font-display text-lg font-medium mb-4">Quick Answers</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">How do I shop the products?</p>
                        <p className="text-muted-foreground">Click any product to be taken directly to our trusted retail partners.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Do you offer personal styling?</p>
                        <p className="text-muted-foreground">Coming soon! In the meantime, check out our blog for free styling tips.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Want to collaborate?</p>
                        <p className="text-muted-foreground">We'd love to hear from brands! Send us an email with details.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-3xl p-8 md:p-10 border border-border">
                  <h2 className="font-display text-2xl font-medium mb-6">
                    Send a Message
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Your Name *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jane Smith"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us what's on your mind..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="rounded-xl resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto rounded-full px-10"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
