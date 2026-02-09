"use client";

import { Lock } from "lucide-react";
import Image from "next/image";

export function AppPreview() {
  return (
    <div
      className="sm:mt-0 w-full max-w-6xl mt-20 mx-auto px-4 relative"
      style={{ perspective: "1000px" }}
    >
      <div className="absolute -inset-4 bg-gradient-to-tr from-rose-600/20 via-purple-500/10 to-orange-500/20 rounded-[2rem] blur-3xl opacity-40 -z-10" />

      <div className="relative rounded-2xl border border-white/10 bg-[#050505] shadow-2xl overflow-hidden ring-1 ring-white/5">
        {/* Window Header */}
        <header className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0A0A0A] shrink-0 justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 opacity-50">
            <Lock className="w-3 h-3" />
            cleir.ai/app
          </div>
          <div className="w-10" />
        </header>

        {/* App Screenshot */}
        <div className="relative">
          <Image
            src="/app-preview.png"
            alt="Cleir App Interface"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
          {/* Gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
