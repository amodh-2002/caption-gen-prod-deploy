'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Social Media Influencer',
    image: '/placeholder.svg?height=100&width=100',
    quote: 'CaptionCraft has revolutionized my content creation process. It saves me hours every week!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Marketing Manager',
    image: '/placeholder.svg?height=100&width=100',
    quote: 'The AI-generated captions are spot-on and easily customizable. A must-have tool for any marketer.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Small Business Owner',
    image: '/placeholder.svg?height=100&width=100',
    quote: 'CaptionCraft has helped me engage with my audience more effectively. It\'s user-friendly and produces great results.',
    rating: 4,
  },
]

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-12 text-center text-charcoal"
        >
          What Our Users Say
        </motion.h2>
        <div className="relative">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-soft-gray p-6 rounded-lg shadow-md"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="w-24 h-24 rounded-full mb-4"
              />
              <h3 className="text-xl font-semibold mb-2 text-charcoal">{testimonials[currentTestimonial].name}</h3>
              <p className="text-sky-blue mb-2">{testimonials[currentTestimonial].role}</p>
              <p className="text-slate-gray mb-4">{testimonials[currentTestimonial].quote}</p>
              <div className="flex">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
            </div>
          </motion.div>
          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index === currentTestimonial ? 'bg-sky-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

