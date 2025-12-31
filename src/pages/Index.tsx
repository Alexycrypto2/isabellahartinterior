import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import PageTransition from "@/components/PageTransition";

// Lazy load below-fold components for better initial load performance
const Categories = lazy(() => import("@/components/Categories"));
const SocialProof = lazy(() => import("@/components/SocialProof"));
const BlogPreview = lazy(() => import("@/components/BlogPreview"));
const Newsletter = lazy(() => import("@/components/Newsletter"));
const Footer = lazy(() => import("@/components/Footer"));
const ProductRecommendations = lazy(() => 
  import("@/components/ProductRecommendations").then(module => ({ 
    default: module.ProductRecommendations 
  }))
);

const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <FeaturedProducts />
          <Suspense fallback={<SectionLoader />}>
            <ProductRecommendations />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <Categories />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <SocialProof />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <BlogPreview />
          </Suspense>
          <Suspense fallback={<SectionLoader />}>
            <Newsletter />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </PageTransition>
  );
};

export default Index;
