'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone } from 'lucide-react'

export default function ContactForm() {
  return (
    <section className="py-20 bg-soft-gray">
      <div className="container mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center text-charcoal"
        >
          Contact Us
        </motion.h1>
        <p className="text-center text-slate-gray mb-12">
          We're here to help. Send us a message and we'll get back to you as soon as possible.
        </p>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <form className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Your message" className="h-40" />
            </div>
            <Button className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal">
              Send Message
            </Button>
          </form>
        </div>
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-charcoal">Support Info</h2>
          <p className="text-slate-gray mb-4">Available Monday to Friday, 9 AM to 6 PM (GMT)</p>
          <div className="flex justify-center space-x-8">
            <a href="mailto:support@captioncraft.com" className="flex items-center text-sky-blue hover:underline">
              <Mail className="w-5 h-5 mr-2" />
              support@captioncraft.com
            </a>
            <a href="tel:+12345678901" className="flex items-center text-sky-blue hover:underline">
              <Phone className="w-5 h-5 mr-2" />
              +1 (234) 567-8901
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

