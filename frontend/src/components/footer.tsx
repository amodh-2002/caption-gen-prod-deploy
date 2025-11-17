import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; 2025 CaptionCraft. All rights reserved.</p>
        </div>
        <div className="flex space-x-4 mb-4 md:mb-0">
          <Link
            href="/privacy"
            className="hover:text-sky-blue transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-sky-blue transition-colors">
            Terms of Service
          </Link>
          <Link href="/blog" className="hover:text-sky-blue transition-colors">
            Blog
          </Link>
          <Link href="/about" className="hover:text-sky-blue transition-colors">
            About
          </Link>
        </div>
        <div className="flex space-x-4">
          <a
            href="#"
            className="text-white hover:text-sky-blue transition-colors"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="#"
            className="text-white hover:text-sky-blue transition-colors"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="#"
            className="text-white hover:text-sky-blue transition-colors"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="#"
            className="text-white hover:text-sky-blue transition-colors"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
