"use client";

import { Tag, CheckCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="z-10 w-full max-w-6xl mt-28 mx-auto pt-12 px-6 relative mb-28"
    >
      {/* Section Header */}
      <div className="text-center mb-24 relative">
        {/* Red Glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-medium mb-6 backdrop-blur-sm">
          <Tag className="w-3.5 h-3.5" />
          <span>Plans &amp; Pricing</span>
        </div>

        <h2 className="text-5xl sm:text-6xl font-medium tracking-tight text-white mb-6">
          Simple protection pricing
        </h2>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Personal */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 flex flex-col relative group h-full">
          <div className="mb-6">
            <h3 className="text-lg font-normal text-white mb-2">Personal</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-medium text-white tracking-tight">
                $9
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-2 font-light">per month</p>
          </div>

          {/* Inner Box */}
          <div className="rounded-2xl bg-neutral-900/30 border border-white/5 p-5 mb-8 flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-white mb-4">Plan Details</h4>
            <div className="space-y-0 text-sm mb-6">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">Users</span>
                <span className="text-white font-light">1</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">Analyses</span>
                <span className="text-white font-light">
                  50<span className="text-neutral-500">/mo</span>
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-neutral-400 font-light">Focus</span>
                <span className="text-white font-light">
                  Relationships &amp; Scams
                </span>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                href="/app"
                className="block w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm text-center"
              >
                Start Personal
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">Features</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Manipulation Detection
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Basic Scam Checks
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Pattern Tracking
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Secure Journaling
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Business (Highlighted) */}
        <div className="rounded-3xl border border-rose-500/20 bg-[#0A0A0A] p-6 flex flex-col relative shadow-[0_0_40px_-20px_rgba(225,29,72,0.15)] h-full">
          <div className="mb-6">
            <h3 className="text-lg font-normal text-white mb-2">Business</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-medium text-white tracking-tight">
                $39
              </span>
              <span className="text-3xl text-neutral-600 line-through decoration-neutral-600 font-light">
                $59
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-2 font-light">per month</p>
          </div>

          {/* Inner Box */}
          <div className="rounded-2xl bg-neutral-900/30 border border-white/5 p-5 mb-8 flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-white mb-4">Plan Details</h4>
            <div className="space-y-0 text-sm mb-6">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">Users</span>
                <span className="text-white font-light">Up to 3</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">Analyses</span>
                <span className="text-white font-light">Unlimited</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-neutral-400 font-light">Focus</span>
                <span className="text-white font-light">
                  Legal, Visa &amp; B2B
                </span>
              </div>
            </div>
            <div className="mt-auto">
              <Link
                href="/app"
                className="block w-full py-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 transition-colors shadow-lg shadow-rose-900/20 text-sm text-center"
              >
                Start Business Trial
              </Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">
              Everything in Personal, plus:
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle2 className="text-rose-500 w-4 h-4" />
                LegalLens Contract Analysis
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle2 className="text-rose-500 w-4 h-4" />
                VisaLens Document Validator
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle2 className="text-rose-500 w-4 h-4" />
                B2B ScamShield
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle2 className="text-rose-500 w-4 h-4" />
                TripGuard &amp; AI Itineraries
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3: Enterprise */}
        <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 flex flex-col relative group h-full">
          <div className="mb-6">
            <h3 className="text-lg font-normal text-white mb-2">Global</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-medium text-white tracking-tight">
                $199
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-2 font-light">per month</p>
          </div>

          {/* Inner Box */}
          <div className="rounded-2xl bg-neutral-900/30 border border-white/5 p-5 mb-8 flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-white mb-4">Plan Details</h4>
            <div className="space-y-0 text-sm mb-6">
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">Users</span>
                <span className="text-white font-light">Unlimited</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/5">
                <span className="text-neutral-400 font-light">API Access</span>
                <span className="text-white font-light">Full</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-neutral-400 font-light">Support</span>
                <span className="text-white font-light">Dedicated Agent</span>
              </div>
            </div>
            <div className="mt-auto">
              <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium text-white mb-4">
              Everything in Business, plus:
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Bulk Document Scanning
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                API for Custom Integrations
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                Audit Logs &amp; Compliance
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400 font-light">
                <CheckCircle className="text-white w-4 h-4" />
                99.9% Uptime SLA
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
