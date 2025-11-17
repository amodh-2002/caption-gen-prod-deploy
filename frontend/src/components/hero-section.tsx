"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const captions = [
  {
    emoji: "📜",
    tone: "Formal",
    text: "This serene landscape showcases the beauty of nature's harmony.",
    color: "text-blue-600",
  },
  {
    emoji: "😎",
    tone: "Casual",
    text: "Weekend vibes: A little coffee, a little sunshine, and a lot of good energy! ☀️",
    color: "text-green-500",
  },
  {
    emoji: "💼",
    tone: "Professional",
    text: "Breaking barriers and building a legacy – one step at a time.",
    color: "text-purple-600",
  },
  {
    emoji: "🤝",
    tone: "Friendly",
    text: "Sharing this little slice of joy with you all! What's bringing you happiness today? 💛",
    color: "text-yellow-500",
  },
  {
    emoji: "😂",
    tone: "Humorous",
    text: "When life gives you lemons, trade them for pizza 🍕✨ Priorities, am I right?",
    color: "text-pink-500",
  },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % captions.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 h-[720px] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold text-charcoal"
            >
              AI-Powered Captions for Your{" "}
              <span className="text-sky-blue">Content</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-gray"
            >
              Generate engaging captions for your videos and images in seconds.
              Multiple tones, perfect length, and hashtags included.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4"
            >
              <Link href="/generator">
                <Button className="bg-sky-blue hover:bg-sky-blue/80 text-charcoal px-8 py-6 text-lg">
                  Try It Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  className="text-charcoal border-charcoal hover:bg-charcoal hover:text-white px-8 py-6 text-lg"
                >
                  View Pricing
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-xl p-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Emoji */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl text-center"
                  >
                    {captions[index].emoji}
                  </motion.div>

                  {/* Tone Badge */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center"
                  >
                    <span
                      className={`px-4 py-1 rounded-full ${captions[index].color} bg-opacity-10 font-semibold`}
                    >
                      {captions[index].tone} Tone
                    </span>
                  </motion.div>

                  {/* Caption Text */}
                  <motion.p
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg text-center text-gray-700"
                  >
                    {captions[index].text}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute bottom-0 left-0 h-1 bg-sky-blue"
                style={{ transformOrigin: "0% 50%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
