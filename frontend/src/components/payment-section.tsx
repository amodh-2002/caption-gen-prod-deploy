"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSection() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "pro";

  // Plan details mapping
  const planDetails = {
    pro: {
      name: "Pro Plan",
      price: "$10",
      features: [
        "Unlimited captions",
        "Multi-language support",
        "Custom tones",
        "Priority support",
        "Advanced analytics",
      ],
    },
    business: {
      name: "Business Plan",
      price: "Custom",
      features: [
        "All Pro features",
        "Team accounts",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
    },
  };

  const defaultPlan = {
    name: "Basic Plan",
    price: "$0",
    features: ["Limited features"],
  };

  const selectedPlan =
    planDetails[plan as keyof typeof planDetails] || defaultPlan;

  return (
    <section className="py-12 px-4 bg-soft-gray min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <Link
            href="/pricing"
            className="inline-flex items-center text-sky-blue hover:text-sky-blue/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-charcoal mb-2">
              Complete Your Payment
            </h1>
            <p className="text-slate-gray">
              You're upgrading to the {selectedPlan.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <Card className="p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-charcoal mb-4">
                  Scan QR Code to Pay
                </h2>
                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                  {/* Replace with your actual QR code */}
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Payment QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-center text-slate-gray">
                  Scan the QR code with your payment app to complete the
                  transaction
                </p>
              </div>
            </Card>

            {/* Payment Details Section */}
            <Card className="p-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-charcoal mb-4">
                  Payment Details
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-gray/20">
                    <span className="text-slate-gray">Plan</span>
                    <span className="font-semibold text-charcoal">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-gray/20">
                    <span className="text-slate-gray">Billing</span>
                    <span className="font-semibold text-charcoal">Monthly</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-gray/20">
                    <span className="text-slate-gray">Amount</span>
                    <span className="font-semibold text-charcoal">
                      {selectedPlan.price}/month
                    </span>
                  </div>
                </div>

                <div className="bg-soft-gray rounded-lg p-4">
                  <h3 className="font-semibold text-charcoal mb-3">
                    What's included:
                  </h3>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-slate-gray"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2 text-sky-blue" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal"
                    onClick={() => {
                      // Handle payment confirmation
                      console.log("Payment confirmed");
                    }}
                  >
                    Confirm Payment
                  </Button>
                  <p className="text-xs text-center text-slate-gray">
                    By confirming your payment, you agree to our Terms of
                    Service and Privacy Policy
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
