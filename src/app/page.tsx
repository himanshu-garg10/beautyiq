import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection as Hero } from "@/components/hero/HeroSection";
import { TrustStrip } from "@/components/home/trust-strip";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* 1. Hero Section */}
        <Hero />

        {/* Keep the landing page focused; detailed discovery starts from its actions. */}
        <TrustStrip />
      </main>
      <Footer />
    </>
  );
}
