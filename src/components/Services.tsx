const Services = () => {
  const services = [
    {
      number: "01",
      title: "PERSONAL STYLING",
      description: "Expert guidance to discover your signature style and build a wardrobe you love"
    },
    {
      number: "02", 
      title: "WARDROBE EDIT",
      description: "Curated recommendations to maximize your existing pieces and fill strategic gaps"
    },
    {
      number: "03",
      title: "CAPSULE BUILDING",
      description: "Create a versatile, minimal wardrobe of quality pieces that work effortlessly together"
    },
    {
      number: "04",
      title: "OCCASION STYLING",
      description: "Perfect looks for weddings, events, travel, and life's special moments"
    }
  ];

  return (
    <section id="services" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-minimal text-muted-foreground mb-4">STYLE SERVICES</h2>
            <h3 className="text-4xl md:text-6xl font-light text-architectural">
              How We Help
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
            {services.map((service, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-6">
                  <span className="text-minimal text-muted-foreground font-medium">
                    {service.number}
                  </span>
                  <div>
                    <h4 className="text-2xl font-light mb-4 text-architectural group-hover:text-muted-foreground transition-colors duration-500">
                      {service.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
