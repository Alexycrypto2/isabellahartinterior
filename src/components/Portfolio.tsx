import lookbook1 from "@/assets/lookbook-1.jpg";
import lookbook2 from "@/assets/lookbook-2.jpg";
import lookbook3 from "@/assets/lookbook-3.jpg";

const Portfolio = () => {
  const looks = [
    {
      image: lookbook1,
      title: "THE TIMELESS COAT",
      location: "WINTER COLLECTION",
      description: "An oversized cream wool coat that transitions seamlessly from day to night"
    },
    {
      image: lookbook2,
      title: "POWER TAILORING",
      location: "WORKWEAR ESSENTIALS",
      description: "Sharp lines and confident silhouettes for the modern professional woman"
    },
    {
      image: lookbook3,
      title: "EVENING ELEGANCE",
      location: "BLACK TIE EDIT",
      description: "Champagne satin and delicate diamonds for life's most memorable moments"
    }
  ];

  return (
    <section id="work" className="py-32 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-minimal text-muted-foreground mb-4">STYLE LOOKBOOK</h2>
            <h3 className="text-4xl md:text-6xl font-light text-architectural">
              Featured Looks
            </h3>
          </div>
          
          <div className="space-y-32">
            {looks.map((look, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={look.image} 
                    alt={look.title}
                    className="w-full h-[70vh] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="mt-8 grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-2xl font-light text-architectural mb-2">
                      {look.title}
                    </h4>
                    <p className="text-minimal text-muted-foreground">
                      {look.location}
                    </p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground leading-relaxed">
                      {look.description}
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

export default Portfolio;
