import { Metadata } from "next";
import CaptionGeneratorForm from "../../components/caption-generator-form";

export const metadata: Metadata = {
  title: "CaptionCraft - Caption Generator",
  description:
    "Generate AI-powered captions for your images and videos. Customize your tone, length, and hashtags.",
};

export default function CaptionGeneratorPage() {
  return (
    <section className="py-10 md:py-20 bg-soft-gray min-h-screen">
      <div className="container mx-auto px-4">
        <CaptionGeneratorForm />
      </div>
    </section>
  );
}
