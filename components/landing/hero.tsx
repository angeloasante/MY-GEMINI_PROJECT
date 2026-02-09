"use client";

import Link from "next/link";
import { Sparkles, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mb-32">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-950/30 text-rose-300 text-xs font-medium mb-8 backdrop-blur-sm">
        <Sparkles className="w-3 h-3" />
        <span>Cleir Engine v1.0 is now live</span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-7xl font-medium tracking-tight leading-[1.1] mb-6 text-white">
        Truth detection <br className="hidden sm:block" />
        built for{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-orange-400">
          Clarity
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        Your AI shield against the noise. Detect gaslighting in relationships,
        analyze predatory contracts, validate visas, and spot business fraud in
        milliseconds.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 gap-x-2 gap-y-2 items-center justify-center">
        <Link
          href="/auth"
          className="group relative flex items-center justify-center px-12 h-14 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white text-lg font-medium shadow-[0_0_35px_-5px_rgba(220,38,38,0.7),inset_0_1px_0_0_rgba(255,255,255,0.4)] border-t border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_-5px_rgba(220,38,38,0.9),inset_0_1px_0_0_rgba(255,255,255,0.4)]"
        >
          <span className="drop-shadow-md">Start Analysis</span>
        </Link>
        <button className="group relative h-14 px-8 rounded-full bg-black border border-white/20 text-white font-semibold text-sm flex items-center gap-2 overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/40 shadow-[0_0_30px_-5px_rgba(255,255,255,0.15),inset_0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.3),inset_0_0_25px_rgba(255,255,255,0.1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70 pointer-events-none" />
          <div className="absolute top-[35%] right-[25%] w-[2px] h-[2px] bg-white rounded-full opacity-60 shadow-[0_0_2px_white] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[30%] right-[15%] w-[1px] h-[1px] bg-white rounded-full opacity-40 pointer-events-none" />
          <div className="absolute top-[40%] left-[45%] w-[1px] h-[1px] bg-white rounded-full opacity-30 pointer-events-none" />
          <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            <PlayCircle className="w-[18px] h-[18px]" />
            See Demo
          </span>
        </button>
      </div>
    </div>
  );
}
