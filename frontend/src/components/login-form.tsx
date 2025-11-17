"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Github } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/login/action";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted", { email, password, rememberMe });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-soft-gray py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"
      >
        {message && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {message}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-charcoal">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-slate-gray">
            Please enter your details to sign in
          </p>
        </div>
        <form action={login} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-charcoal">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-slate-gray/30 focus:border-sky-blue focus:ring-sky-blue"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-charcoal">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-slate-gray/30 focus:border-sky-blue focus:ring-sky-blue"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-sky-blue hover:text-sky-blue/80"
            >
              Forgot your password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-sky-blue hover:bg-sky-blue/80 text-charcoal font-semibold"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-gray/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-gray">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-gray/30 hover:bg-soft-gray"
            >
              <FaGoogle className="w-5 h-5 text-[#1877F2]" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-slate-gray/30 hover:bg-soft-gray"
            >
              <Github className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-gray">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-sky-blue hover:text-sky-blue/80 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
