"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Message } from "./chat-message";
import { SpeakingAvatar } from "./speaking-avatar";

type AppMode = "personal" | "business";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  isSpeaking?: boolean;
  mode?: AppMode;
}

export function ChatMessages({ messages, isLoading, isSpeaking = false, mode = "personal" }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-16 text-center">
        <div className="w-24 h-24 mb-6">
          <SpeakingAvatar
            audioBase64={null}
            alignment={null}
            size="lg"
            isSpeaking={isSpeaking}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {mode === "personal" 
            ? "Welcome to Gaslighter Detect" 
            : "Business Assistant"
          }
        </h2>
        <p className="text-gray-400 max-w-md leading-relaxed">
          {mode === "personal"
            ? "I'm here to help you analyze conversations and identify potential manipulation or gaslighting patterns. Share a conversation or describe a situation you'd like me to examine."
            : "I'm your professional business assistant. I can help with visa requirements, travel planning, document analysis, and business inquiries."
          }
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
          {mode === "personal" ? (
            <>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer border border-purple-500/20">
                <div className="text-sm font-medium text-white mb-1">
                  📸 Upload Screenshot
                </div>
                <div className="text-xs text-gray-500">
                  Analyze text messages or chats
                </div>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer border border-purple-500/20">
                <div className="text-sm font-medium text-white mb-1">
                  💬 Describe Situation
                </div>
                <div className="text-xs text-gray-500">
                  Tell me what happened
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer border border-blue-500/20">
                <div className="text-sm font-medium text-white mb-1">
                  🛂 Visa Requirements
                </div>
                <div className="text-xs text-gray-500">
                  Check travel requirements
                </div>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer border border-blue-500/20">
                <div className="text-sm font-medium text-white mb-1">
                  ✈️ Travel Planning
                </div>
                <div className="text-xs text-gray-500">
                  Get travel assistance
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 pt-14 space-y-2">
        {messages.map((message, index) => {
          const isLastAssistantMessage = 
            message.role === "assistant" && 
            index === messages.length - 1;
          
          return (
            <ChatMessage 
              key={message.id} 
              message={message}
              isSpeaking={isLastAssistantMessage ? isSpeaking : false}
            />
          );
        })}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/avatar.png" alt="AI" className="w-full h-full object-cover" />
            </div>
            <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${
                  mode === "personal" ? "bg-teal-400" : "bg-blue-400"
                }`} />
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${
                  mode === "personal" ? "bg-teal-400" : "bg-blue-400"
                }`} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${
                  mode === "personal" ? "bg-teal-400" : "bg-blue-400"
                }`} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
