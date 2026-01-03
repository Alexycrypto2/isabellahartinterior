import { useSiteSetting } from '@/hooks/useSiteSettings';
import { useSocialSettings } from '@/hooks/useSocialSettings';

const Contact = () => {
  const { data: contactSetting } = useSiteSetting('contact');
  const { data: socialSettings } = useSocialSettings();
  
  const contact = (contactSetting?.value || {}) as Record<string, string>;
  const email = contact.email || 'hello@archstudio.com';
  const phone = contact.phone || '+1 (234) 567-8900';
  const address = contact.address || '123 Design Avenue\nNew York, NY 10001';

  // Get social links
  const socialLinks = [
    { name: 'Instagram', url: socialSettings?.instagram },
    { name: 'LinkedIn', url: socialSettings?.linkedin },
    { name: 'Facebook', url: socialSettings?.facebook },
    { name: 'Pinterest', url: socialSettings?.pinterest },
    { name: 'Twitter', url: socialSettings?.twitter },
    { name: 'YouTube', url: socialSettings?.youtube },
    { name: 'TikTok', url: socialSettings?.tiktok },
  ].filter(link => link.url);

  return (
    <section id="contact" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-4">GET IN TOUCH</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                Let's Create Something
                <br />
                Extraordinary
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
                  <h4 className="text-minimal text-muted-foreground mb-2">STUDIO</h4>
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
                  We approach each project with curiosity, rigor, and a commitment to excellence. 
                  Our process begins with listening, understanding your vision, and translating 
                  it into spaces that exceed expectations.
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
