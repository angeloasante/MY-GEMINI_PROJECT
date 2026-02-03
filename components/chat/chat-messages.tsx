"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, Message } from "./chat-message";
import { SpeakingAvatar } from "./speaking-avatar";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  isSpeaking?: boolean;
}

export function ChatMessages({ messages, isLoading, isSpeaking = false }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 mb-6">
          <SpeakingAvatar
            audioBase64={null}
            alignment={null}
            size="lg"
            isSpeaking={isSpeaking}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Welcome to Gaslighter Detect
        </h2>
        <p className="text-gray-400 max-w-md leading-relaxed">
          I&apos;m here to help you analyze conversations and identify potential
          manipulation or gaslighting patterns. Share a conversation or describe
          a situation you&apos;d like me to examine.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
          <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer">
            <div className="text-sm font-medium text-white mb-1">
              Paste a conversation
            </div>
            <div className="text-xs text-gray-500">
              Share text messages or chat logs
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded-xl p-4 text-left hover:bg-[#333] transition-colors cursor-pointer">
            <div className="text-sm font-medium text-white mb-1">
              Describe a situation
            </div>
            <div className="text-xs text-gray-500">
              Tell me what happened in your words
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-2">
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
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
