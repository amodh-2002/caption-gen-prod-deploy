"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createClient } from "@/utils/supabase/client";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  subscription?: {
    plan?: {
      name: string;
      description: string;
    };
  };
}

interface UsageData {
  captions: {
    used: number;
    limit: number;
    label: string;
  };
  premium: {
    used: number;
    limit: number;
    label: string;
  };
}

export default function AccountSettings() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [usageData, setUsageData] = useState<UsageData>({
    captions: {
      used: 0,
      limit: 10, // Free tier limit
      label: "Basic Captions",
    },
    premium: {
      used: 0,
      limit: 0, // Free tier has no premium captions
      label: "Advanced Captions",
    },
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // First, set basic user data
        setUserData({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || "",
          subscription: undefined,
        });

        // Then fetch subscription data
        const { data: subscriptionData, error: subscriptionError } =
          await supabase
            .from("subscriptions")
            .select(
              `
            *,
            plan:plans(*)
          `
            )
            .eq("user_id", user.id)
            .single();

        if (!subscriptionError && subscriptionData) {
          setUserData((prev) => ({
            ...prev!,
            subscription: subscriptionData,
          }));

          // Set usage limits based on plan
          const isPremium =
            subscriptionData?.plan?.name.toLowerCase() !== "free";

          // Fetch caption usage
          const { data: usageData } = await supabase
            .from("caption_usage")
            .select("count")
            .eq("user_id", user.id)
            .single();

          setUsageData({
            captions: {
              used: usageData?.count || 0,
              limit: isPremium ? 200 : 50,
              label: "Basic Captions",
            },
            premium: {
              used: 0,
              limit: isPremium ? 100 : 0,
              label: "Advanced Captions",
            },
          });
        }
      }
    }

    fetchUserData();
  }, [supabase]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <section className="py-12 px-4 bg-soft-gray min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-charcoal mb-2">Settings</h1>
            <p className="text-slate-gray">
              Manage your account, billing, and caption settings here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-gray">
                    Name
                  </label>
                  <p className="text-charcoal">{userData.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-gray">
                    Email
                  </label>
                  <p className="text-charcoal">{userData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-gray">
                    Current Plan
                  </label>
                  <p className="text-charcoal">
                    {userData.subscription?.plan?.name || "Free"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Usage (Last 30 days)
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>{usageData.captions.label}</span>
                      <span>
                        {usageData.captions.used} / {usageData.captions.limit}
                      </span>
                    </div>
                    <Progress
                      value={
                        (usageData.captions.used / usageData.captions.limit) *
                        100
                      }
                      className="h-2 bg-slate-gray/20"
                    />
                  </div>

                  {usageData.premium.limit > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{usageData.premium.label}</span>
                        <span>
                          {usageData.premium.used} / {usageData.premium.limit}
                        </span>
                      </div>
                      <Progress
                        value={
                          (usageData.premium.used / usageData.premium.limit) *
                          100
                        }
                        className="h-2 bg-slate-gray/20"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {userData.subscription?.plan?.name === "Free" && (
                    <>
                      <Button className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal">
                        UPGRADE TO PRO
                      </Button>
                      <Button variant="outline" className="w-full">
                        UPGRADE TO BUSINESS
                      </Button>
                    </>
                  )}

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center text-sky-blue hover:text-sky-blue/80">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Advanced
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        Delete Account
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
