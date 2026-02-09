"use client";

import { PanelLeftClose, PanelLeft, MessageSquarePlus, Trash2, MessagesSquare, Volume2, X } from "lucide-react";
import { useRef, useState, useEffect, useCallback, TouchEvent } from "react";

export interface ChatHistoryItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AudioData {
  audioBase64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  chatHistory: ChatHistoryItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  audioData?: AudioData | null;
  onSpeakingChange?: (speaking: boolean) => void;
  isMobile?: boolean;
}

export function ChatSidebar({
  isCollapsed,
  onToggleCollapse,
  chatHistory,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  audioData,
  onSpeakingChange,
  isMobile = false,
}: ChatSidebarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const animationRef = useRef<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Notify parent when speaking state changes
  useEffect(() => {
    onSpeakingChange?.(isSpeaking);
  }, [isSpeaking, onSpeakingChange]);

  // Animation for speaking effect
  useEffect(() => {
    if (isSpeaking && audioRef.current) {
      const animate = () => {
        if (!audioRef.current || audioRef.current.paused) {
          setIntensity(0);
          return;
        }
        // Random intensity for visual effect
        setIntensity(0.3 + Math.random() * 0.7);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpeaking]);

  // Setup audio when audioData changes
  useEffect(() => {
    if (!audioData?.audioBase64) return;
    
    const audio = new Audio(`data:audio/mpeg;base64,${audioData.audioBase64}`);
    audioRef.current = audio;
    
    audio.onplay = () => setIsSpeaking(true);
    audio.onpause = () => setIsSpeaking(false);
    audio.onended = () => {
      setIsSpeaking(false);
      setIntensity(0);
    };
    
    // Auto-play
    audio.play().catch(() => {});
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioData]);

  // Handle swipe to close on mobile
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobile || !isDragging) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    // Only allow dragging to the left (negative) to close
    if (diff < 0) {
      setDragOffset(diff);
    }
  }, [isMobile, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);
    // If dragged more than 100px to the left, close the sidebar
    if (dragOffset < -100) {
      onToggleCollapse();
    }
    setDragOffset(0);
  }, [isMobile, isDragging, dragOffset, onToggleCollapse]);

  const handleAvatarClick = () => {
    if (!audioRef.current) return;
    if (isSpeaking) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSelectChatMobile = (id: string) => {
    onSelectChat(id);
    if (isMobile) {
      onToggleCollapse();
    }
  };

  const handleNewChatMobile = () => {
    onNewChat();
    if (isMobile) {
      onToggleCollapse();
    }
  };

  // On mobile when collapsed, render nothing (the button is in the main area)
  if (isMobile && isCollapsed) {
    return null;
  }

  // Desktop collapsed view
  if (!isMobile && isCollapsed) {
    return (
      <aside className="w-16 bg-[#1a1a1a] flex flex-col h-screen min-h-[100dvh] border-r border-white/10 items-center py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors mb-4"
        >
          <PanelLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-xl overflow-hidden mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <button
          onClick={onNewChat}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5 text-gray-400" />
        </button>
      </aside>
    );
  }

  // Mobile overlay sidebar
  if (isMobile && !isCollapsed) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onToggleCollapse}
        />
        {/* Sidebar */}
        <aside 
          ref={sidebarRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed left-0 top-0 w-[85vw] max-w-[320px] bg-[#1a1a1a] flex flex-col border-r border-white/10 z-50 shadow-2xl transition-transform duration-200 overflow-hidden"
          style={{ 
            transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
            height: '100dvh',
          }}
        >
          {/* Header with Logo and Close Button */}
          <div className="flex-shrink-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/avatar.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Cleir<span className="text-rose-400">.</span>
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="flex-shrink-0 px-4 mb-2">
            <button
              onClick={handleNewChatMobile}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <MessageSquarePlus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat History - scrollable area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              Recent Chats
            </div>
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No conversations yet
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                      activeChatId === chat.id
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/5 text-gray-400"
                    }`}
                    onClick={() => handleSelectChatMobile(chat.id)}
                  >
                    <MessagesSquare className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate text-sm">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer - always visible */}
          <div className="flex-shrink-0 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/avatar.png" alt="Guardian" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="text-white font-semibold">Guardian AI</div>
                <div className="text-xs text-gray-400">Ready to help</div>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop expanded view
  return (
    <aside className="w-80 bg-[#1a1a1a] flex flex-col h-screen min-h-[100dvh] border-r border-white/10">
      {/* Header with Logo and Collapse Button */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/avatar.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Cleir<span className="text-rose-400">.</span>
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <PanelLeftClose className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
          Recent Chats
        </div>
        <div className="space-y-1">
          {chatHistory.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-8">
              No conversations yet
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                  activeChatId === chat.id
                    ? "bg-white/10 text-white"
                    : "hover:bg-white/5 text-gray-400"
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessagesSquare className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Profile Card */}
      <div className="p-4">
        <div className="bg-[#c4a962] rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-3 right-3 flex gap-1">
            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
              <span className="text-black text-xs">=</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-black/60 uppercase tracking-wider mb-3">
            Analyzer
          </div>

          <div className="flex justify-center mb-4">
            <div 
              className="relative w-32 h-32 cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {/* Glow effect when speaking */}
              {isSpeaking && (
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/40 to-yellow-300/40 blur-xl transition-all duration-100"
                  style={{ transform: `scale(${1 + intensity * 0.4})` }}
                />
              )}
              
              {/* Avatar with animation */}
              <div
                className="relative w-full h-full transition-transform duration-100"
                style={{ transform: isSpeaking ? `scale(${1 + intensity * 0.08})` : 'scale(1)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatar.png"
                  alt="Guardian Avatar"
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Play indicator when audio ready but not speaking */}
              {audioData && !isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
              )}
              {/* Sound waves when speaking */}
              {isSpeaking && (
                <>
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-ping"
                    style={{ animationDuration: `${1.5 - intensity * 0.5}s` }}
                  />
                  <div 
                    className="absolute rounded-full border border-amber-400/30 transition-all duration-100"
                    style={{ inset: `-${15 * intensity}%`, opacity: 0.6 * intensity }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-black/70">Hey! I&apos;m your</div>
            <div className="text-3xl font-bold text-black tracking-tight">
              GUARDIAN
            </div>
          </div>

          <p className="text-xs text-black/60 text-center mt-3 leading-relaxed">
            I&apos;m here to help you identify manipulation patterns and
            gaslighting in your conversations. Share your concerns safely.
          </p>
        </div>
      </div>
    </aside>
  );
}
