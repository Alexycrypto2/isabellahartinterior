import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Categories from "@/components/Categories";
import SocialProof from "@/components/SocialProof";
import BlogPreview from "@/components/BlogPreview";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ProductRecommendations } from "@/components/ProductRecommendations";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <FeaturedProducts />
          <ProductRecommendations />
          <Categories />
          <SocialProof />
          <BlogPreview />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
