"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0A0A0A] transition-all duration-300 ${
        isOpen ? "bg-neutral-900/30" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between p-6 w-full text-left"
      >
        <span
          className={`text-base font-medium transition-colors ${
            isOpen ? "text-rose-200" : "text-white hover:text-rose-200"
          }`}
        >
          {question}
        </span>
        <span className="transition-transform duration-200">
          {isOpen ? (
            <Minus className="text-white w-5 h-5" />
          ) : (
            <Plus className="text-neutral-400 hover:text-white w-5 h-5" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 text-sm text-neutral-400 leading-relaxed font-light">
          {answer}
        </div>
      </div>
    </div>
  );
}

const faqData = [
  {
    question: "Is my personal chat data private?",
    answer:
      "Absolutely. Cleir uses local encryption for Personal Mode analyses. We analyze patterns to detect gaslighting or scams, but we do not store your conversation logs on our servers for training purposes.",
  },
  {
    question: "How accurate is VisaLens?",
    answer:
      "VisaLens connects directly to official embassy databases and is updated daily. While we provide a high-confidence pre-check to prevent rejections due to missing documents, final approval always rests with the consulate.",
  },
  {
    question: "Can LegalLens replace a lawyer?",
    answer:
      "LegalLens is designed to flag predatory clauses, non-standard terms, and risk areas in contracts. It serves as a powerful first line of defense but should be used to inform your consultation with a qualified attorney, not replace them.",
  },
  {
    question: "What is B2B ScamShield?",
    answer:
      "ScamShield cross-references vendor details against global fraud registries, domain age data, and known scam patterns. It helps businesses avoid invoice fraud, fake suppliers, and phishing attempts.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="z-10 w-full max-w-4xl mx-auto mb-32 px-6 relative scroll-mt-24">
      <div className="text-center mb-16 relative">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />
        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-6">
          Common Questions
        </h2>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Understanding how Cleir protects your data, privacy, and peace of mind.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
