"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    // Small delay to ensure the page is ready
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 10);
    setMobileMenuOpen(false);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden">
              <Image
                src="/avatar.png"
                alt="Cleir"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium tracking-tight text-sm text-neutral-200 group-hover:text-white transition-colors">
              Cleir
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#personal-mode"
              onClick={(e) => handleNavClick(e, "personal-mode")}
              className="text-sm font-normal text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Personal Mode
            </a>
            <a
              href="#business-mode"
              onClick={(e) => handleNavClick(e, "business-mode")}
              className="text-sm font-normal text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Business Mode
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="text-sm font-normal text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="hidden sm:block text-sm font-normal text-neutral-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-4 py-1.5 transition-all text-neutral-200"
          >
            Get Protected
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-neutral-950/95 backdrop-blur-md">
          <div className="px-6 py-4 space-y-3">
            <a
              href="#personal-mode"
              onClick={(e) => handleNavClick(e, "personal-mode")}
              className="block text-sm text-neutral-400 hover:text-white transition-colors py-2 cursor-pointer"
            >
              Personal Mode
            </a>
            <a
              href="#business-mode"
              onClick={(e) => handleNavClick(e, "business-mode")}
              className="block text-sm text-neutral-400 hover:text-white transition-colors py-2 cursor-pointer"
            >
              Business Mode
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="block text-sm text-neutral-400 hover:text-white transition-colors py-2 cursor-pointer"
            >
              FAQ
            </a>
            <Link
              href="/auth"
              className="block text-sm text-neutral-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
