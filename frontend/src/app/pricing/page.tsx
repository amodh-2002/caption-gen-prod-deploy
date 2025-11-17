import { Metadata } from "next";
import PricingSection from "../../components/pricing-section";
import FAQSection from "../../components/faq-section";

export const metadata: Metadata = {
  title: "CaptionCraft - Pricing",
  description:
    "Flexible pricing plans for every creator. Choose the perfect plan for your caption generation needs.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <section className="py-10 md:py-20">
        <div className="container mx-auto px-4">
          <PricingSection />
        </div>
      </section>
      <section className="py-10 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <FAQSection />
        </div>
      </section>
    </div>
  );
}
