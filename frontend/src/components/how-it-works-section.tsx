'use client'

import { motion } from 'framer-motion'
import { FaUpload, FaEdit, FaDownload } from 'react-icons/fa'

const steps = [
  {
    icon: <FaUpload className="text-4xl mb-4 text-sky-blue" />,
    title: 'Upload your image or video',
    description: 'Drag-and-drop interface or a file uploader with preview.',
  },
  {
    icon: <FaEdit className="text-4xl mb-4 text-sky-blue" />,
    title: 'Customize your captions',
    description: 'Choose writing tone, caption length, and hashtags.',
  },
  {
    icon: <FaDownload className="text-4xl mb-4 text-sky-blue" />,
    title: 'Get captions instantly',
    description: 'Copy, download, or share captions with a click.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-12 text-center text-charcoal"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              {step.icon}
              <h3 className="text-xl font-semibold mb-2 text-charcoal">{step.title}</h3>
              <p className="text-slate-gray">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

