"use client";

import {
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  Brain,
  MessageCircle,
  TrendingUp,
  Fingerprint,
  CheckCircle,
} from "lucide-react";

export function PersonalMode() {
  return (
    <section
      id="personal-mode"
      className="z-10 w-full max-w-6xl mt-28 mx-auto pt-12 px-6 relative mb-28 scroll-mt-24"
    >
      {/* Section Header */}
      <div className="text-center mb-16 relative">
        {/* Rose Glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-rose-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-950/30 text-rose-300 text-xs font-medium mb-6 backdrop-blur-sm">
          <Shield className="w-3.5 h-3.5" />
          <span>Personal Protection</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-6">
          Your Personal Guardian
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Protect yourself from manipulation, gaslighting, and emotional abuse.
          Our AI analyzes conversations to identify harmful patterns before they
          escalate.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {/* Feature 1 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Manipulation Detection
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Instantly identify gaslighting, DARVO, love bombing, and other
            manipulation tactics in text conversations.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            5-Agent Analysis Pipeline
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Five specialized AI agents work together: Classifier, Severity
            Assessor, Tactic Extractor, Counter Generator, and Guardian
            synthesizer.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Suggested Responses
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Get AI-generated healthy response suggestions to help you navigate
            difficult conversations with confidence.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Pattern Tracking
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Track manipulation patterns over time to identify recurring toxic
            behaviors and relationship red flags.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
          detectScam Protection
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Detect phishing attempts, romance scams, and social engineering
            tactics designed to exploit your trust.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="group p-6 rounded-2xl border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Screenshot Analysis
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Upload screenshots of text messages or social media conversations
            for instant AI-powered analysis.
          </p>
        </div>
      </div>

      {/* Security & Privacy Card */}
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-neutral-900/50 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-rose-400" />
              <h3 className="text-2xl font-medium text-white">
                Private & Secure by Design
              </h3>
            </div>
            <p className="text-neutral-400 font-light leading-relaxed mb-6">
              Your personal conversations deserve absolute privacy. Cleir uses
              local processing and end-to-end encryption to ensure your
              sensitive data never leaves your control.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                No conversation logs stored on servers
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                End-to-end encryption for all analyses
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                GDPR & CCPA compliant data handling
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0" />
                Delete your data anytime with one click
              </li>
            </ul>
          </div>

          <div className="flex-shrink-0 w-48 h-48 rounded-2xl bg-neutral-900/50 border border-white/10 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500/20 to-orange-500/20 flex items-center justify-center border border-rose-500/30">
                <Shield className="w-12 h-12 text-rose-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
