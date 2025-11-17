import { Metadata } from "next";

import SignupForm from "../../components/signup-form";

export const metadata: Metadata = {
  title: "CaptionCraft - Sign Up",
  description:
    "Create a CaptionCraft account to start generating AI-powered captions for your content.",
};

export default function SignupPage() {
  return <SignupForm />;
}
