import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection as Hero } from "@/components/hero/HeroSection";
import { TrustStrip } from "@/components/home/trust-strip";
import { PersonalizedDiscovery } from "@/components/recommendations/PersonalizedDiscovery";
import { AiRecommendationShowcase } from "@/components/recommendations/AiRecommendationShowcase";
import { ProductDiscovery } from "@/components/product/ProductDiscovery";
import { ComparisonShowcase } from "@/components/comparison/ComparisonShowcase";
import { IngredientIntelligence } from "@/components/ingredients/IngredientIntelligence";
import { WhyBeautyIq } from "@/components/home/why-beautyiq";
import { TrendingProducts } from "@/components/product/TrendingProducts";
import { ReviewsSection } from "@/components/home/reviews-section";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Trust Strip */}
        <TrustStrip />

        {/* 3. Personalized Discovery */}
        <PersonalizedDiscovery />

        {/* 4. AI Recommendations */}
        <AiRecommendationShowcase />

        {/* 5. Product Discovery */}
        <ProductDiscovery />

        {/* 6. Comparison Showcase */}
        <ComparisonShowcase />

        {/* 7. Ingredient Intelligence */}
        <IngredientIntelligence />

        {/* 8. Value Pillars (Why BeautyIQ) */}
        <WhyBeautyIq />

        {/* 9. Trending Products */}
        <TrendingProducts />

        {/* 10. Community Reviews */}
        <ReviewsSection />

        {/* 11. Final Call-to-Action */}
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
