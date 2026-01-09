import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useSocialSettings } from '@/hooks/useSocialSettings';

const Contact = () => {
  const { data: contactSetting } = useSiteSetting('contact');
  const { data: socialSettings } = useSocialSettings();
  
  const contact = (contactSetting?.value || {}) as Record<string, string>;
  const email = contact.email || 'hello@glamify.com';
  const phone = contact.phone || '+1 (888) 456-7890';
  const address = contact.address || 'New York, NY';

  // Get social links
  const socialLinks = [
    { name: 'Instagram', url: socialSettings?.instagram },
    { name: 'Pinterest', url: socialSettings?.pinterest },
    { name: 'TikTok', url: socialSettings?.tiktok },
    { name: 'YouTube', url: socialSettings?.youtube },
  ].filter(link => link.url);

  return (
    <section id="contact" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-4">GET IN TOUCH</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                Let's Style
                <br />
                Together
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">EMAIL</h4>
                  <a href={`mailto:${email}`} className="text-xl hover:text-muted-foreground transition-colors duration-300">
                    {email}
                  </a>
                </div>
                
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">PHONE</h4>
                  <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-xl hover:text-muted-foreground transition-colors duration-300">
                    {phone}
                  </a>
                </div>
                
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-2">LOCATION</h4>
                  <address className="text-xl not-italic whitespace-pre-line">
                    {address}
                  </address>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {socialLinks.length > 0 && (
                <div>
                  <h4 className="text-minimal text-muted-foreground mb-6">FOLLOW US</h4>
                  <div className="space-y-4">
                    {socialLinks.map((link) => (
                      <a 
                        key={link.name}
                        href={link.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xl hover:text-muted-foreground transition-colors duration-300"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`${socialLinks.length > 0 ? 'pt-12 border-t border-border' : ''}`}>
                <p className="text-muted-foreground">
                  We believe every woman deserves to feel confident and beautiful in what she wears. 
                  Whether you're building a capsule wardrobe or finding the perfect piece for a special 
                  occasion, we're here to guide you on your style journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
