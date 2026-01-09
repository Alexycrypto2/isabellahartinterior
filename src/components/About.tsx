const About = () => {
  return (
    <section id="about" className="py-32 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-minimal text-muted-foreground mb-4">ABOUT GLAMIFY</h2>
              <h3 className="text-4xl md:text-6xl font-light text-architectural mb-12">
                Our Philosophy
              </h3>
              
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At Glamify, we believe that true style transcends trends. Our curated 
                  collection focuses on timeless pieces that empower women to express 
                  their authentic selves with confidence and grace.
                </p>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Founded with a passion for minimalist luxury, we've helped thousands of 
                  women build capsule wardrobes that work harder and last longer. Every 
                  piece we recommend is chosen for its quality, versatility, and enduring appeal.
                </p>
              </div>
            </div>
            
            <div className="space-y-12">
              <div>
                <h4 className="text-minimal text-muted-foreground mb-6">OUR VALUES</h4>
                <div className="space-y-6">
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Quality Over Quantity</h5>
                    <p className="text-muted-foreground">Investment pieces that stand the test of time</p>
                  </div>
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Timeless Elegance</h5>
                    <p className="text-muted-foreground">Classic designs that transcend seasonal trends</p>
                  </div>
                  <div className="border-l-2 border-architectural pl-6">
                    <h5 className="text-lg font-medium mb-2">Effortless Style</h5>
                    <p className="text-muted-foreground">Pieces that mix, match, and elevate any look</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-border">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-minimal text-muted-foreground mb-2">HAPPY CLIENTS</h4>
                    <p className="text-xl">50,000+</p>
                  </div>
                  <div>
                    <h4 className="text-minimal text-muted-foreground mb-2">CURATED PIECES</h4>
                    <p className="text-xl">500+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
