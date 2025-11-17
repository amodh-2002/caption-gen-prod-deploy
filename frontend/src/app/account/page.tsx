import { Metadata } from "next";
import AccountSettings from "../../components/account-settings";

export const metadata: Metadata = {
  title: "CaptionCraft - Account Settings",
  description: "Manage your CaptionCraft account settings, billing, and usage.",
};

export default function AccountPage() {
  return (
    <section className="py-10 md:py-20 min-h-screen">
      <div className="container mx-auto px-4">
        <AccountSettings />
      </div>
    </section>
  );
}
