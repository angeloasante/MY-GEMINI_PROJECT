"use client";

import {
  Briefcase,
  FileCheck,
  CreditCard,
  ShieldAlert,
  MapPin,
  Scale,
  Globe,
  Server,
  Zap,
  CheckCircle,
  Lock,
} from "lucide-react";

export function BusinessMode() {
  return (
    <section
      id="business-mode"
      className="z-10 w-full max-w-6xl mt-28 mx-auto pt-12 px-6 relative mb-28 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="text-center mb-16 relative">
        {/* Orange Glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-orange-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-950/30 text-orange-300 text-xs font-medium mb-6 backdrop-blur-sm">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Business Protection</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-6">
          Enterprise-Grade Security
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Protect your business from fraud, validate documents, and ensure safe
          travel. Four specialized AI agents working 24/7 for your security.
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* VisaLens */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-purple-500/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">VisaLens</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                Validate visa documents and travel requirements for 50+
                countries. Get real-time embassy database verification and
                compliance checks.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Document Validation
                </span>
                <span className="text-[10px] px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  50+ Countries
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LegalLens */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-orange-500/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">LegalLens</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                Analyze contracts for predatory clauses, hidden fees, and unfair
                terms. Get a risk score and detailed breakdown of every
                concerning element.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                  Contract Analysis
                </span>
                <span className="text-[10px] px-2 py-1 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                  Risk Scoring
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ScamShield */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-red-500/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">
                ScamShield
              </h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                Verify vendors, partners, and suppliers against global fraud
                databases. Prevent invoice fraud, fake suppliers, and phishing
                attempts.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
                  Fraud Detection
                </span>
                <span className="text-[10px] px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
                  B2B Verification
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TripGuard */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-teal-500/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white mb-2">TripGuard</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed mb-4">
                AI-powered travel planning with safety advisories, visa
                requirements, and optimized itineraries enriched with Google
                Places data.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-1 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  AI Itineraries
                </span>
                <span className="text-[10px] px-2 py-1 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Google Maps
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reliability Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="text-center p-6 rounded-2xl border border-white/5 bg-neutral-900/20">
          <div className="text-3xl font-bold text-white mb-1">99.9%</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wider">
            Uptime SLA
          </div>
        </div>
        <div className="text-center p-6 rounded-2xl border border-white/5 bg-neutral-900/20">
          <div className="text-3xl font-bold text-white mb-1">&lt;200ms</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wider">
            Response Time
          </div>
        </div>
        <div className="text-center p-6 rounded-2xl border border-white/5 bg-neutral-900/20">
          <div className="text-3xl font-bold text-white mb-1">50+</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wider">
            Countries
          </div>
        </div>
        <div className="text-center p-6 rounded-2xl border border-white/5 bg-neutral-900/20">
          <div className="text-3xl font-bold text-white mb-1">24/7</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wider">
            Monitoring
          </div>
        </div>
      </div>

      {/* Enterprise Security Card */}
      <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-950/30 to-neutral-900/50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-orange-400" />
              <h3 className="text-2xl font-medium text-white">
                Enterprise-Grade Infrastructure
              </h3>
            </div>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">
              Built on secure, scalable infrastructure with SOC 2 Type II
              compliance. Your business data is protected by the same security
              standards used by Fortune 500 companies.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                SOC 2 Type II Certified
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                256-bit AES Encryption
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                Multi-region redundancy
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                Real-time threat monitoring
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                API rate limiting & DDoS protection
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                Audit logs & compliance reports
              </li>
            </ul>
          </div>

          <div className="flex-shrink-0 flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-neutral-900/50 border border-white/10 flex flex-col items-center justify-center">
              <Lock className="w-8 h-8 text-orange-400 mb-1" />
              <span className="text-[10px] text-neutral-500">Encrypted</span>
            </div>
            <div className="w-20 h-20 rounded-xl bg-neutral-900/50 border border-white/10 flex flex-col items-center justify-center">
              <Globe className="w-8 h-8 text-orange-400 mb-1" />
              <span className="text-[10px] text-neutral-500">Global</span>
            </div>
            <div className="w-20 h-20 rounded-xl bg-neutral-900/50 border border-white/10 flex flex-col items-center justify-center">
              <Zap className="w-8 h-8 text-orange-400 mb-1" />
              <span className="text-[10px] text-neutral-500">Fast</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
