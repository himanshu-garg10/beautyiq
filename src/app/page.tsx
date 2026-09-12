import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Categories } from "@/components/home/categories";
import { Ingredients } from "@/components/home/ingredients";
import { FeaturedProducts } from "@/components/home/featured-products";
import { RecommendationExplanation } from "@/components/home/recommendation-explanation";
import { PriceComparison } from "@/components/home/price-comparison";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Categories />
        <Ingredients />
        <FeaturedProducts />
        <RecommendationExplanation />
        <PriceComparison />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
