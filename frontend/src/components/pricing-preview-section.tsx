'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    features: ['10 captions/month', 'Single language', 'Basic tones'],
  },
  {
    name: 'Pro',
    price: '$10',
    features: ['Unlimited captions', 'Multi-language support', 'Custom tones'],
  },
]

export default function PricingPreviewSection() {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-12 text-center text-charcoal"
        >
          Pricing Preview
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-semibold mb-4 text-charcoal">{tier.name}</h3>
              <p className="text-3xl font-bold mb-6 text-sky-blue">{tier.price}<span className="text-base font-normal text-slate-gray">/month</span></p>
              <ul className="mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="mb-2 text-slate-gray">✓ {feature}</li>
                ))}
              </ul>
              <Button className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal">
                Choose Plan
              </Button>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-sky-blue text-sky-blue hover:bg-sky-blue/10">
            <Link href="/pricing">See Full Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

