"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 pt-20 pb-10 relative overflow-hidden font-sans">
      {/* Ambient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-rose-900/20 ring-1 ring-white/10">
                <Image
                  src="/avatar.png"
                  alt="Cleir"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-medium tracking-tight text-xl text-white group-hover:text-rose-100 transition-colors">
                Cleir
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Protection from the noise. Intelligent detection of manipulation,
              fraud, and legal risks for individuals and businesses.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group/icon"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover/icon:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group/icon"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover/icon:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group/icon"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover/icon:scale-110"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1 - Platform */}
          <div>
            <h4 className="text-white font-medium mb-6 text-sm">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#personal-mode"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Personal Mode
                </Link>
              </li>
              <li>
                <Link
                  href="#business-mode"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Business Mode
                </Link>
              </li>
              <li>
                <Link
                  href="#business-mode"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  VisaLens
                </Link>
              </li>
              <li>
                <Link
                  href="#business-mode"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  TripGuard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column - COMMENTED OUT */}
          {/* <div>
            <h4 className="text-white font-medium mb-6 text-sm">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                detectScam Database
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Pattern Library
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  API Docs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div> */}

          {/* Links Column 3 - Company */}
          <div>
            <h4 className="text-white font-medium mb-6 text-sm">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 4 - Legal */}
          <div>
            <h4 className="text-white font-medium mb-6 text-sm">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-neutral-400 hover:text-white transition-colors font-light"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter / CTA Section */}
        <div className="mb-16 p-8 rounded-2xl border border-white/5 bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-medium text-white mb-2">
                Subscribe to security alerts
              </h3>
              <p className="text-sm text-neutral-400 font-light">
                Get the latest updates on emerging scam patterns and travel
                advisories.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <form className="flex w-full md:w-96 items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-10 px-4 rounded-lg bg-neutral-900 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/5 transition-all"
                />
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 font-light">
            © 2026 Cleir Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </div>
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">
                Threat Detection Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
