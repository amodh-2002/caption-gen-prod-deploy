"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("name") as string,
      },
    },
  };

  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.signUp(data);

  if (signUpError) {
    redirect(
      "/signup?message=" + encodeURIComponent("Could not create account")
    );
  }

  if (user) {
    // Get the free plan ID
    const { data: freePlan } = await supabase
      .from("plans")
      .select("id")
      .eq("name", "Free")
      .single();

    if (freePlan) {
      // Create subscription record
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: freePlan.id,
          status: "active",
          start_date: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error("Error creating subscription:", subscriptionError);
      }
    }
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Check your email to confirm your account")
  );
}
