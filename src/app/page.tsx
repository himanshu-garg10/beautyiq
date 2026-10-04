import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection as Hero } from "@/components/hero/HeroSection";
import { TrustStrip } from "@/components/home/trust-strip";
import { PersonalizedDiscovery } from "@/components/recommendations/PersonalizedDiscovery";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* 1. Hero Section */}
        <Hero />

        <TrustStrip />
        <PersonalizedDiscovery />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
