import { Metadata } from "next";
import ContactForm from "../../components/contact-form";

export const metadata: Metadata = {
  title: "CaptionCraft - Contact Us",
  description:
    "Get in touch with the CaptionCraft team. We're here to help with any questions or concerns.",
};

export default function ContactPage() {
  return (
    <section className="py-10 md:py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <ContactForm />
      </div>
    </section>
  );
}
