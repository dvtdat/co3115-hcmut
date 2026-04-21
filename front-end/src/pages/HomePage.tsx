import HeroSection from "@/components/home/HeroSection";
import BenefitsSection from "@/components/home/BenefitsSection";
// import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      {/* <FeaturedProductsSection /> */}
      <TestimonialsSection />
    </>
  );
}
