"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { User, Session, AuthChangeEvent, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import {
  ChatSidebar,
  ChatMessages,
  ChatInput,
  Message,
  ChatHistoryItem,
} from "../components/chat";
import { ModeToggle, AppMode } from "../components/chat/mode-toggle";
import { AuthForm, ProfileDropdown } from "../components/auth";
import { AnalysisResult } from "@/types/agents";
import {
  getUserChats,
  createChat,
  updateChat,
  deleteChat,
  UserChat,
  ChatMessage as DBChatMessage,
} from "@/lib/supabase-client";

interface AudioData {
  audioBase64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

// Convert DB messages to component messages
function dbToComponentMessages(dbMessages: DBChatMessage[]): Message[] {
  return dbMessages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
    imageBase64: m.imageBase64,
    mimeType: m.mimeType,
  }));
}

// Convert component messages to DB messages
function componentToDbMessages(messages: Message[]): DBChatMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp.toISOString(),
    imageBase64: m.imageBase64,
    mimeType: m.mimeType,
  }));
}

// Browser console logging
const log = (message: string, data?: unknown) => {
  const style = "color: #8b5cf6; font-weight: bold;";
  if (data !== undefined) {
    console.log(`%c[PAGE] ${message}`, style, data);
  } else {
    console.log(`%c[PAGE] ${message}`, style);
  }
};

const logError = (message: string, data?: unknown) => {
  const style = "color: #ef4444; font-weight: bold;";
  if (data !== undefined) {
    console.error(`%c[PAGE ERROR] ${message}`, style, data);
  } else {
    console.error(`%c[PAGE ERROR] ${message}`, style);
  }
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [chats, setChats] = useState<UserChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("personal");
  const [businessMessages, setBusinessMessages] = useState<Message[]>([]);
  const [businessChatId, setBusinessChatId] = useState<string | null>(null);
  const [businessVoiceEnabled, setBusinessVoiceEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Create Supabase client only on client-side using useMemo
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (typeof window === "undefined") return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth state on mount
  useEffect(() => {
    if (!supabase) return;
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load chats from database when user is authenticated or mode changes
  useEffect(() => {
    const loadChats = async () => {
      if (!user) {
        setChats([]);
        return;
      }
      try {
        const userChats = await getUserChats(user.id, appMode);
        setChats(userChats || []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          console.log("Chat table not set up yet - run the SQL in supabase/user-chats.sql");
        } else {
          console.error("Failed to load chats:", errorMessage);
        }
        setChats([]);
      }
    };
    loadChats();
  }, [user, appMode]);

  // Check screen size for mobile sidebar
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsSidebarCollapsed(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const fetchTTS = async (text: string): Promise<AudioData | null> => {
    log("fetchTTS called", { textLength: text.length, voiceEnabled });
    
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        audioBase64: data.audio_base64,
        alignment: data.alignment,
      };
    } catch (error) {
      logError("fetchTTS exception:", error);
      return null;
    }
  };

  const chatHistory: ChatHistoryItem[] = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    createdAt: new Date(chat.created_at),
    updatedAt: new Date(chat.updated_at),
  }));

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setBusinessChatId(null);
    setBusinessMessages([]);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      if (appMode === "personal") {
        setActiveChatId(id);
        setMessages(dbToComponentMessages(chat.messages));
      } else {
        setBusinessChatId(id);
        setBusinessMessages(dbToComponentMessages(chat.messages));
      }
    }
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  }, [chats, appMode]);

  const handleDeleteChat = useCallback(async (id: string) => {
    try {
      await deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
        setMessages([]);
      }
      if (businessChatId === id) {
        setBusinessChatId(null);
        setBusinessMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }, [activeChatId, businessChatId]);

  const generateTitle = async (chatMessages: Message[]) => {
    try {
      const response = await fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
    }
    return chatMessages[0]?.content.slice(0, 30) + "..." || "New Chat";
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!user) return;
      log("handleSendMessage called", { contentLength: content.length });
      
      setCurrentAudio(null);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      let currentChatId = activeChatId;
      
      // Create new chat in database if needed
      if (!currentChatId) {
        try {
          const newChat = await createChat(user.id, "personal", "New Chat...", componentToDbMessages(updatedMessages));
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
          setChats((prev) => [newChat, ...prev]);
        } catch (error) {
          console.error("Failed to create chat:", error);
        }
      } else {
        try {
          await updateChat(currentChatId, { messages: componentToDbMessages(updatedMessages) });
        } catch (error) {
          console.error("Failed to update chat:", error);
        }
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        setIsLoading(false);

        // Update chat in database
        if (currentChatId) {
          try {
            if (updatedMessages.length === 1) {
              const title = await generateTitle(finalMessages);
              await updateChat(currentChatId, { title, messages: componentToDbMessages(finalMessages) });
              setChats((prev) => prev.map((c) => c.id === currentChatId ? { ...c, title, messages: componentToDbMessages(finalMessages) } : c));
            } else {
              await updateChat(currentChatId, { messages: componentToDbMessages(finalMessages) });
            }
          } catch (error) {
            console.error("Failed to update chat:", error);
          }
        }

        // TTS if enabled
        if (voiceEnabled) {
          fetchTTS(data.content).then((audioData) => {
            if (audioData) setCurrentAudio(audioData);
          });
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
    },
    [messages, activeChatId, voiceEnabled, user]
  );

  // Handle business mode chat
  const handleBusinessMessage = useCallback(
    async (content: string) => {
      if (!user) return;
      log("handleBusinessMessage called", { contentLength: content.length });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...businessMessages, userMessage];
      setBusinessMessages(updatedMessages);

      let currentChatId = businessChatId;

      // Create new chat in database if needed
      if (!currentChatId) {
        try {
          const newChat = await createChat(user.id, "business", "Business Chat", componentToDbMessages(updatedMessages));
          currentChatId = newChat.id;
          setBusinessChatId(currentChatId);
          setChats((prev) => [newChat, ...prev]);
        } catch (error) {
          console.error("Failed to create chat:", error);
        }
      } else {
        try {
          await updateChat(currentChatId, { messages: componentToDbMessages(updatedMessages) });
        } catch (error) {
          console.error("Failed to update chat:", error);
        }
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/business-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) throw new Error("Failed to get response");

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setBusinessMessages(finalMessages);
        setIsLoading(false);

        // TTS if voice enabled for business mode
        if (businessVoiceEnabled) {
          fetchTTS(data.content).then((audioData) => {
            if (audioData) setCurrentAudio(audioData);
          });
        }

        // Update chat in database
        if (currentChatId) {
          try {
            if (updatedMessages.length === 1) {
              const title = await generateTitle(finalMessages);
              await updateChat(currentChatId, { title, messages: componentToDbMessages(finalMessages) });
              setChats((prev) => prev.map((c) => c.id === currentChatId ? { ...c, title, messages: componentToDbMessages(finalMessages) } : c));
            } else {
              await updateChat(currentChatId, { messages: componentToDbMessages(finalMessages) });
            }
          } catch (error) {
            console.error("Failed to update chat:", error);
          }
        }
      } catch (error) {
        console.error("Business chat error:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setBusinessMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
    },
    [businessMessages, businessChatId, businessVoiceEnabled, user]
  );

  // Handle image analysis with multi-agent pipeline
  const handleImageAnalysis = useCallback(
    async (imageBase64: string, mimeType: string) => {
      if (!user) return;
      log("handleImageAnalysis called", { mimeType, imageLength: imageBase64.length });

      setCurrentAudio(null);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `📸 *Sent a screenshot for analysis*`,
        timestamp: new Date(),
        imageBase64,
        mimeType,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      let currentChatId = activeChatId;
      
      if (!currentChatId) {
        try {
          const newChat = await createChat(user.id, "personal", "🛡️ Screenshot Analysis", componentToDbMessages(updatedMessages));
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
          setChats((prev) => [newChat, ...prev]);
        } catch (error) {
          console.error("Failed to create chat:", error);
        }
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: imageBase64,
            mimeType,
            saveToDatabase: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Analysis failed: ${errorData}`);
        }

        const result = await response.json();
        const analysisData = result.data as AnalysisResult;

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: analysisData.guardian.fullMarkdownResponse,
          timestamp: new Date(),
          analysisResult: analysisData,
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        setIsLoading(false);

        // Update chat in database
        if (currentChatId) {
          try {
            await updateChat(currentChatId, { messages: componentToDbMessages(finalMessages) });
          } catch (error) {
            console.error("Failed to update chat:", error);
          }
        }

        // TTS if enabled
        if (voiceEnabled && analysisData.guardian.voiceScript) {
          fetchTTS(analysisData.guardian.voiceScript).then((audioData) => {
            if (audioData) setCurrentAudio(audioData);
          });
        }
      } catch (error) {
        logError("Image analysis failed:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "😔 Sorry bestie, I couldn't analyze that screenshot. Try uploading again or make sure it's a clear image of a conversation.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
    },
    [messages, activeChatId, voiceEnabled, user]
  );

  // Mode change handler - preserve messages when switching
  const handleModeChange = useCallback((newMode: AppMode) => {
    setAppMode(newMode);
    // Don't clear messages - they should persist when switching back
  }, []);

  // Show loading spinner while mounting or checking auth
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-[#121212]">
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        chatHistory={chatHistory}
        activeChatId={appMode === "personal" ? activeChatId : businessChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        audioData={currentAudio}
        onSpeakingChange={setIsSpeaking}
      />
      <main className="flex-1 flex flex-col relative">
        {/* Mode Toggle & Profile - Top Right */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <ModeToggle
            mode={appMode}
            onModeChange={handleModeChange}
            disabled={isLoading}
          />
          <ProfileDropdown user={user} />
        </div>
        
        {appMode === "personal" ? (
          <>
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              mode="personal"
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              onSendImage={handleImageAnalysis}
              isLoading={isLoading}
              placeholder="Paste a conversation or upload a screenshot..."
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
            />
          </>
        ) : (
          <>
            <ChatMessages 
              messages={businessMessages} 
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              mode="business"
            />
            <ChatInput
              onSendMessage={handleBusinessMessage}
              isLoading={isLoading}
              placeholder="Ask about business, visa requirements, travel..."
              voiceEnabled={businessVoiceEnabled}
              onToggleVoice={() => setBusinessVoiceEnabled((prev) => !prev)}
            />
          </>
        )}
      </main>
    </div>
  );
}
