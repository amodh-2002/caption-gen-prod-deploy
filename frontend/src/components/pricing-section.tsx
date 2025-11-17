'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

const pricingTiers = [
  {
    name: 'Free',
    description: 'Great for getting started',
    price: '$0',
    features: [
      '10 captions/month',
      'Single language',
      'Basic tones',
      'Standard support',
    ],
  },
  {
    name: 'Pro',
    description: 'Perfect for influencers and marketers',
    price: '$10',
    features: [
      'Unlimited captions',
      'Multi-language support',
      'Custom tones',
      'Priority support',
      'Advanced analytics',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For businesses and teams',
    price: 'Custom',
    features: [
      'All Pro features',
      'Team accounts',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
  },
]

export default function PricingSection() {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center text-charcoal"
        >
          Flexible Pricing for Every Creator
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-8 rounded-lg shadow-md flex flex-col"
            >
              <h2 className="text-2xl font-semibold mb-2 text-charcoal">{tier.name}</h2>
              <p className="text-slate-gray mb-4">{tier.description}</p>
              <p className="text-4xl font-bold mb-6 text-sky-blue">
                {tier.price}
                <span className="text-base font-normal text-slate-gray">
                  {tier.price !== 'Custom' ? '/month' : ''}
                </span>
              </p>
              <ul className="mb-8 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="mb-2 flex items-center text-slate-gray">
                    <Check className="mr-2 h-5 w-5 text-sky-blue" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link 
                href={`/payments?plan=${tier.name.toLowerCase()}`}
                className="w-full"
              >
                <Button className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal">
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Choose Plan'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

