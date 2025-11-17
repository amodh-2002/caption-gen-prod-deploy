import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/navbar";
import Footer from "../components/footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </div>
      </body>
    </html>
  );
}
