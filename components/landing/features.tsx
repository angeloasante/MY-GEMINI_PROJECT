"use client";

import {
  ScanEye,
  ShieldCheck,
  TrendingUp,
  FileText,
  CreditCard,
  ShieldAlert,
  Scale,
  BarChart2,
  ShieldX,
  MapPinned,
  ArrowUpRight,
} from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="z-10 w-full max-w-6xl mt-28 mx-auto pt-12 px-6 relative mb-28"
    >
      {/* Section Header */}
      <div className="text-center mb-24 relative">
        {/* Red Glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-rose-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />

        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-6">
          Dual Intelligence Engines
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Whether it&apos;s protecting your emotional well-being or securing your
          business interests, Cleir provides the clarity you need to spot the
          hidden traps.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24">
        {/* Card 1: Personal Mode */}
        <div
          id="personal"
          className="relative group rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 h-[420px] flex flex-col justify-between overflow-hidden hover:border-white/15 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/[0.05] to-transparent pointer-events-none" />

          {/* Graphic */}
          <div className="relative flex-1 w-full flex flex-col items-center pt-8">
            <div className="flex items-start justify-center gap-12 sm:gap-16 z-10">
              {/* Eye Icon */}
              <div className="flex flex-col items-center gap-3 group/icon">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-rose-400 group-hover/icon:text-white group-hover/icon:border-rose-500/30 transition-all">
                  <ScanEye className="w-6 h-6" />
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  Manipulation
                </span>
              </div>
              {/* Shield Icon */}
              <div className="flex flex-col items-center gap-3 group/icon">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-rose-400 group-hover/icon:text-white group-hover/icon:border-rose-500/30 transition-all">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  Self-Defense
                </span>
              </div>
              {/* Graph Icon */}
              <div className="flex flex-col items-center gap-3 group/icon">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-rose-400 group-hover/icon:text-white group-hover/icon:border-rose-500/30 transition-all">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  Patterns
                </span>
              </div>
            </div>

            {/* Connector Lines */}
            <div className="relative h-12 w-full max-w-[280px] mt-[-10px]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-t from-rose-500/20 to-transparent" />
              <div className="absolute bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            </div>

            {/* Table Preview */}
            <div className="w-full max-w-sm mt-8 relative">
              <div className="grid grid-cols-3 gap-4 text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-3 pl-2">
                <div>Topic</div>
                <div>Toxicity</div>
                <div>Status</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-neutral-300 font-mono py-2 pl-2 border-t border-rose-500/10 bg-rose-950/[0.1] rounded-lg">
                <div>Argument #4</div>
                <div className="text-rose-400">High</div>
                <div className="text-rose-400">Gaslighting</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-neutral-600 font-mono py-2 pl-2 border-t border-white/5 opacity-50">
                <div>Chat Log 02</div>
                <div>Low</div>
                <div className="text-emerald-500">Safe</div>
              </div>
              {/* Gradient Fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/20 to-[#0A0A0A] pointer-events-none" />
            </div>
          </div>

          {/* Input Footer */}
          <div className="relative z-20 mx-2 mb-1 flex items-center justify-between px-5 py-3 rounded-xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
            <span className="text-sm text-neutral-400 font-light">
              Personal Protection
            </span>
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <ArrowUpRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Card 2: Business Mode */}
        <div
          id="business"
          className="relative group rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 h-[420px] flex flex-col justify-between overflow-hidden hover:border-white/15 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.05] to-transparent pointer-events-none" />

          {/* Graphic */}
          <div className="relative flex-1 w-full flex items-center justify-center pb-8">
            {/* Connecting Lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
              viewBox="0 0 400 300"
            >
              <path
                d="M200 150 L 200 90"
                stroke="white"
                fill="none"
                strokeWidth="1.5"
              />
              <path
                d="M200 150 L 120 200"
                stroke="white"
                fill="none"
                strokeWidth="1.5"
              />
              <path
                d="M200 150 L 280 200"
                stroke="white"
                fill="none"
                strokeWidth="1.5"
              />
            </svg>

            {/* Nodes */}
            {/* Contract */}
            <div className="absolute top-[30%] left-[20%] w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-purple-400 hover:scale-110 transition-transform duration-500">
              <FileText className="w-5 h-5" />
            </div>
            {/* Visa */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-purple-400 hover:scale-110 transition-transform duration-500">
              <CreditCard className="w-5 h-5" />
            </div>
            {/* B2B Scam */}
            <div className="absolute top-[30%] right-[20%] w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-purple-400 hover:scale-110 transition-transform duration-500">
              <ShieldAlert className="w-5 h-5" />
            </div>

            {/* Center Hub */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center z-10 shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 flex items-center justify-center border border-white/5">
                <Scale className="text-white w-6 h-6" />
              </div>
            </div>

            {/* Fade Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
          </div>

          {/* Input Footer */}
          <div className="relative z-20 mx-2 mb-1 flex items-center justify-between px-5 py-3 rounded-xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
            <span className="text-sm text-neutral-400 font-light">
              Business &amp; Travel Security
            </span>
            <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
              <ArrowUpRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Features Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-2">
        {/* Feature 1: Pattern Tracking */}
        <div className="flex flex-col gap-5 group">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-all">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white mb-3">
              Pattern Tracking
            </h3>
            <p className="text-[15px] text-neutral-400 font-light leading-relaxed">
              Spot behavioral trends over time. Identify toxic cycles or business
              inefficiencies before they become crises.
            </p>
          </div>
        </div>

        {/* Feature 2: ScamShield */}
        <div className="flex flex-col gap-5 group">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-all">
            <ShieldX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white mb-3">B2B ScamShield</h3>
            <p className="text-[15px] text-neutral-400 font-light leading-relaxed">
              Verify vendors and partners instantly. Our AI cross-references
              global fraud databases to prevent B2B scams.
            </p>
          </div>
        </div>

        {/* Feature 3: TripGuard */}
        <div id="tripguard" className="flex flex-col gap-5 group">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-all">
            <MapPinned className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white mb-3">
              TripGuard Planning
            </h3>
            <p className="text-[15px] text-neutral-400 font-light leading-relaxed">
              Multi-city travel planning that checks visa requirements, safety
              advisories, and generates optimized itineraries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
