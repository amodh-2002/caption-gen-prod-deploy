import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Database } from "@/types/supabase";

interface CaptionUsage {
  count: number;
  user_id: string;
}

interface Plan {
  name: string;
}

interface SubscriptionWithPlan {
  plan: {
    name: string;
  };
}

export async function incrementCaptionUsage(): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Get current usage and plan
  const { data: usageData } = await supabase
    .from("caption_usage")
    .select("count")
    .eq("user_id", user.id)
    .single();

  const { data: subscriptionData } = (await supabase
    .from("subscriptions")
    .select("plan:plans(name)")
    .eq("user_id", user.id)
    .single()) as { data: SubscriptionWithPlan | null };

  const limit =
    subscriptionData?.plan?.name?.toLowerCase() === "free" ? 50 : 200;
  const currentCount = usageData?.count || 0;

  if (currentCount >= limit) {
    toast.error(
      "You've reached your caption limit. Please upgrade to continue."
    );
    return false;
  }

  // Increment usage
  const { error } = await supabase
    .from("caption_usage")
    .upsert({
      user_id: user.id,
      count: currentCount + 1,
    })
    .match({ user_id: user.id });

  if (error) {
    toast.error("Failed to update usage count");
    return false;
  }

  if (currentCount + 1 >= limit) {
    toast.warning(
      "You've reached your caption limit. Please upgrade to continue."
    );
  }

  return true;
}
