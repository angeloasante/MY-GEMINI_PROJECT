"use client";

import { MoreVertical, Image } from "lucide-react";
import { SpeakingAvatar } from "./speaking-avatar";
import { AnalysisResult } from "@/types/agents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestion?: string;
  imageBase64?: string;
  mimeType?: string;
  analysisResult?: AnalysisResult;
}

interface ChatMessageProps {
  message: Message;
  isSpeaking?: boolean;
}

// Markdown components with custom styling
const markdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-bold text-white mt-4 mb-2 first:mt-0" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-bold text-white mt-3 mb-2 first:mt-0" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-sm font-bold text-white mt-3 mb-1 first:mt-0" {...props}>{children}</h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-2 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-3 space-y-1 ml-2" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 ml-2" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-gray-200" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-white" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-gray-300" {...props}>{children}</em>
  ),
  code: ({ inline, children, ...props }: any) => (
    inline ? (
      <code className="bg-[#3a3a3a] text-teal-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
    ) : (
      <code className="block bg-[#1a1a1a] text-gray-200 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3" {...props}>{children}</code>
    )
  ),
  pre: ({ children, ...props }: any) => (
    <pre className="bg-[#1a1a1a] p-3 rounded-lg overflow-x-auto mb-3" {...props}>{children}</pre>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-teal-500 pl-4 py-1 my-3 italic text-gray-300 bg-[#1a1a1a]/50 rounded-r" {...props}>{children}</blockquote>
  ),
  a: ({ children, href, ...props }: any) => (
    <a href={href} className="text-teal-400 hover:text-teal-300 underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  ),
  hr: () => (
    <hr className="border-t border-gray-700 my-4" />
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border-collapse border border-gray-700" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: any) => (
    <th className="border border-gray-700 bg-[#2a2a2a] px-3 py-2 text-left font-semibold text-white" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="border border-gray-700 px-3 py-2 text-gray-200" {...props}>{children}</td>
  ),
};

export function ChatMessage({ message, isSpeaking = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasImage = !!message.imageBase64;
  const isAnalysisResponse = !!message.analysisResult;

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="shrink-0">
          <SpeakingAvatar
            audioBase64={null}
            alignment={null}
            size="sm"
            isSpeaking={isSpeaking}
          />
        </div>
      )}

      <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
        {/* Image preview for user messages */}
        {hasImage && isUser && (
          <div className="mb-2 rounded-xl overflow-hidden bg-[#2a2a2a] p-2">
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
              <Image className="w-3 h-3" />
              Screenshot for analysis
            </div>
            <img
              src={`data:${message.mimeType};base64,${message.imageBase64}`}
              alt="Screenshot"
              className="rounded-lg max-h-48 w-auto"
            />
          </div>
        )}

        <div
          className={`relative group rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white"
              : isAnalysisResponse
                ? "bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-gray-100 border border-red-500/20"
                : "bg-[#2a2a2a] text-gray-100"
          }`}
        >
          {/* Analysis badge */}
          {isAnalysisResponse && message.analysisResult && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
              <span className="text-lg">
                {message.analysisResult.guardian?.severityEmoji || message.analysisResult.guardianResponse?.severityEmoji || '🔍'}
              </span>
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                Guardian Analysis
              </span>
              <span className="text-xs text-gray-500">
                • {message.analysisResult.classification?.tacticsDetected?.length || message.analysisResult.raw?.classification?.tacticsDetected?.length || 0} tactics detected
              </span>
            </div>
          )}

          <div className="text-sm leading-relaxed prose prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {message.suggestion && (
          <div className="mt-2 bg-[#3a3a3a] rounded-2xl px-4 py-3 border border-white/10">
            <div className="text-xs text-teal-400 mb-1 font-medium">
              I would say this...
            </div>
            <div className="text-sm text-gray-200 leading-relaxed">
              {message.suggestion}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <button className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-2">
          <MoreVertical className="w-4 h-4 text-white/40" />
        </button>
      )}
    </div>
  );
}
