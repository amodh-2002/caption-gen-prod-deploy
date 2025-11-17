import { Metadata } from "next";
import HeroSection from "../components/hero-section";
import HowItWorksSection from "../components/how-it-works-section";
import FeaturesSection from "../components/features-section";
import TestimonialsSection from "../components/testimonials-section";

export const metadata: Metadata = {
  title: "CaptionCraft - AI-Generated Captions for Your Videos and Images",
  description:
    "Effortless AI-Generated Captions for Your Videos and Images. Captions crafted in seconds to suit your tone, style, and audience.",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  );
}
