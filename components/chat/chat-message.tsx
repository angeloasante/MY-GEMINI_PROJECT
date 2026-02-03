"use client";

import { MoreVertical, Image } from "lucide-react";
import { SpeakingAvatar } from "./speaking-avatar";
import { AnalysisResult } from "@/types/agents";

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

// Simple markdown-like rendering for the analysis response
function renderContent(content: string) {
  // Split by double newlines to get paragraphs
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    // Headers with emoji
    if (line.startsWith('🚩 **') || line.startsWith('💀 **') || 
        line.startsWith('🗣️ **') || line.startsWith('🧠 **') || 
        line.startsWith('💪 **') || line.startsWith('## ')) {
      const headerText = line.replace(/\*\*/g, '').replace('## ', '');
      return (
        <h3 key={index} className="text-base font-bold text-white mt-4 mb-2 first:mt-0">
          {headerText}
        </h3>
      );
    }
    
    // Bold text
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={index} className="mb-1">
          {parts.map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
          )}
        </p>
      );
    }
    
    // Empty lines become spacing
    if (line.trim() === '') {
      return <div key={index} className="h-2" />;
    }
    
    // Regular text
    return <p key={index} className="mb-1">{line}</p>;
  });
}

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

          <div className="text-sm leading-relaxed">
            {isAnalysisResponse ? renderContent(message.content) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
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
