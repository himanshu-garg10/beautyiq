import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection as Hero } from "@/components/hero/HeroSection";
import { TrustStrip } from "@/components/home/trust-strip";
import { PersonalizedDiscovery } from "@/components/recommendations/PersonalizedDiscovery";
import { FinalCta } from "@/components/home/final-cta";
import { HomeQuickStart } from "@/components/home/home-quick-start";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* 1. Hero Section */}
        <Hero />

        <TrustStrip />
        <HomeQuickStart />
        <PersonalizedDiscovery />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
