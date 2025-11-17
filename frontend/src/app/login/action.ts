"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4000';

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      redirect(
        "/login?message=" +
          encodeURIComponent(
            error.detail || "Could not authenticate user. Check your email and password."
          )
      );
    }

    const data = await response.json();
    
    // Store token in httpOnly cookie for security
    const cookieStore = await cookies();
    cookieStore.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in,
      path: '/',
    });

    revalidatePath("/", "page");
    redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    redirect(
      "/login?message=" +
        encodeURIComponent("Could not authenticate user. Please try again.")
    );
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  revalidatePath("/", "page");
  redirect("/login");
}
