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
  onViewItinerary?: () => void;
}

export function ChatMessages({ messages, isLoading, isSpeaking = false, mode = "personal", onViewItinerary }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-16 text-center bg-[#121212]">
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
            ? "Welcome to Cleir Detect" 
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
    <div className="flex-1 overflow-y-auto bg-[#121212]">
      <div className="p-6 pt-14 space-y-2">
        {messages.map((message, index) => {
          const isLastAssistantMessage = 
            message.role === "assistant" && 
            index === messages.length - 1;
          
          return (
            <div key={message.id}>
              <ChatMessage 
                message={message}
                isSpeaking={isLastAssistantMessage ? isSpeaking : false}
              />
              {/* Show View Itinerary button after the last assistant message if itinerary is available */}
              {isLastAssistantMessage && onViewItinerary && message.content.includes("itinerary is ready") && (
                <div className="flex gap-3 mt-2 ml-13">
                  <div className="w-10 shrink-0" /> {/* Spacer for avatar alignment */}
                  <button
                    type="button"
                    onClick={onViewItinerary}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    View Itinerary & Map
                  </button>
                </div>
              )}
            </div>
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
                  mode === "personal" ? "bg-rose-400" : "bg-orange-400"
                }`} />
                <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${
                  mode === "personal" ? "bg-rose-400" : "bg-orange-400"
                }`} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${
                  mode === "personal" ? "bg-rose-400" : "bg-orange-400"
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
