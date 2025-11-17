'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll be able to use your plan until the end of your current billing cycle."
  },
  {
    question: "What is the character limit per caption?",
    answer: "The character limit per caption varies depending on the platform you're using. We support up to 2,200 characters for Instagram captions, 280 characters for Twitter, and custom limits for other platforms."
  },
  {
    question: "How accurate are the AI-generated captions?",
    answer: "Our AI model is trained on a vast dataset and continuously improved. While the accuracy is high, we always recommend reviewing and adjusting the generated captions to ensure they perfectly match your voice and style."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for our Pro plan. If you're not satisfied with our service, you can request a full refund within the first 14 days of your subscription."
  },
  {
    question: "Can I switch between plans?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. The changes will be reflected in your next billing cycle."
  }
]

export default function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-12 text-center text-charcoal"
        >
          Frequently Asked Questions
        </motion.h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-semibold text-charcoal hover:text-sky-blue">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-gray">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

