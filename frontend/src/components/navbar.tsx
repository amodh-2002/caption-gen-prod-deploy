"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { apiClient, User as ApiUser } from "@/lib/api-client";
import { logout } from "@/app/login/action";

interface NavbarProps {
  user: ApiUser | null;
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(initialUser);

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    }
    
    if (!initialUser) {
      getUser();
    }
  }, [initialUser]);

  const handleSignOut = async () => {
    apiClient.logout();
    await logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-charcoal text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            CaptionCraft
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            <Link href="/" className="hover:text-sky-blue transition-colors">
              Home
            </Link>
            {user && (
              <Link
                href="/generator"
                className="hover:text-sky-blue transition-colors"
              >
                Caption Generator
              </Link>
            )}
            <Link
              href="/pricing"
              className="hover:text-sky-blue transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="hover:text-sky-blue transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:text-sky-blue"
                  >
                    {user.full_name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem>
                    <Link href="/account" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center text-red-600 w-full cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-sky-blue"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-sky-blue hover:bg-sky-blue/80 text-charcoal">
                    Try Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="hover:text-sky-blue transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                {user && (
                  <Link
                    href="/generator"
                    className="hover:text-sky-blue transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Caption Generator
                  </Link>
                )}
                <Link
                  href="/pricing"
                  className="hover:text-sky-blue transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-sky-blue transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                  {user ? (
                    <>
                      <Link href="/account" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full text-left">
                          <User className="mr-2 h-4 w-4" />
                          Account
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full text-left text-red-600 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="text-white hover:text-sky-blue w-full"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link
                        href="/signup"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <Button className="bg-sky-blue hover:bg-sky-blue/80 text-charcoal w-full">
                          Try Free
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
