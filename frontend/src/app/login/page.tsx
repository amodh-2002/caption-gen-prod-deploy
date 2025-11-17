import { Metadata } from "next";

import LoginForm from "../../components/login-form";

export const metadata: Metadata = {
  title: "CaptionCraft - Login",
  description:
    "Log in to your CaptionCraft account to start creating AI-powered captions.",
};

export default function LoginPage() {
  return <LoginForm />;
}
