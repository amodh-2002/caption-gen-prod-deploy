'use client'

import { motion } from 'framer-motion'
import { FaPencilAlt, FaLanguage, FaMagic } from 'react-icons/fa'

const features = [
  {
    icon: <FaPencilAlt className="text-4xl mb-4 text-sky-blue" />,
    title: 'Customizable Captions',
    description: 'Tailor your captions to any style, tone, or audience.',
  },
  {
    icon: <FaLanguage className="text-4xl mb-4 text-sky-blue" />,
    title: 'Multi-Language Support',
    description: 'Supports English, Hindi, and more.',
  },
  {
    icon: <FaMagic className="text-4xl mb-4 text-sky-blue" />,
    title: 'Hassle-Free',
    description: 'Generate captions in seconds without any technical knowledge.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-12 text-center text-charcoal"
        >
          Why Choose CaptionCraft?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2 text-charcoal">{feature.title}</h3>
                <p className="text-slate-gray">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

