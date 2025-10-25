import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {

  useEffect(() => {
    // ✅ Scroll to top whenever this page loads
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <FeaturedProperties />
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
