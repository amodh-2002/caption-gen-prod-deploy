"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4000';

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("name") as string;

  try {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      redirect(
        "/signup?message=" + encodeURIComponent(error.detail || "Could not create account")
      );
    }

    const data = await response.json();
    
    // Store token in cookie for server-side access
    // Note: In production, use httpOnly cookies via middleware
    
    redirect(
      "/login?message=" +
        encodeURIComponent("Account created successfully! Please login.")
    );
  } catch (error) {
    console.error("Signup error:", error);
    redirect(
      "/signup?message=" + encodeURIComponent("Could not create account")
    );
  }
}
