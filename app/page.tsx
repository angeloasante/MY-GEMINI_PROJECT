"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ChatSidebar,
  ChatMessages,
  ChatInput,
  Message,
  ChatHistoryItem,
} from "../components/chat";
import { AnalysisResult } from "@/types/agents";

interface StoredChat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface AudioData {
  audioBase64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
}

const STORAGE_KEY = "gaslighter-detect-chats";

function loadChatsFromStorage(): StoredChat[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveChatsToStorage(chats: StoredChat[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

// Browser console logging with prefix
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
  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchTTS = async (text: string): Promise<AudioData | null> => {
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log("fetchTTS called", { textLength: text.length, voiceEnabled });
    
    try {
      log("Sending TTS request to /api/tts...");
      const startTime = Date.now();
      
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const elapsed = Date.now() - startTime;
      log(`TTS response received in ${elapsed}ms`, { status: response.status });

      if (!response.ok) {
        const errorData = await response.text();
        logError("TTS request failed:", { status: response.status, error: errorData });
        return null;
      }

      const data = await response.json();
      log("TTS data parsed successfully", {
        hasAudioBase64: !!data.audio_base64,
        audioLength: data.audio_base64?.length || 0,
        hasAlignment: !!data.alignment,
        alignmentChars: data.alignment?.characters?.length || 0
      });
      
      log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      return {
        audioBase64: data.audio_base64,
        alignment: data.alignment,
      };
    } catch (error) {
      logError("fetchTTS exception:", error);
      return null;
    }
  };

  // Load chats from localStorage on mount
  useEffect(() => {
    const storedChats = loadChatsFromStorage();
    setChats(storedChats);
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToStorage(chats);
    }
  }, [chats]);

  const chatHistory: ChatHistoryItem[] = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    createdAt: new Date(chat.createdAt),
    updatedAt: new Date(chat.updatedAt),
  }));

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setActiveChatId(id);
      setMessages(
        chat.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    }
  }, [chats]);

  const handleDeleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveChatsToStorage(updated);
      return updated;
    });
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [activeChatId]);

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
      log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      log("handleSendMessage called", { contentLength: content.length, voiceEnabled });
      
      // Clear any previous audio
      setCurrentAudio(null);
      log("Previous audio cleared");

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      log("User message added to state");

      // Create new chat if needed
      let currentChatId = activeChatId;
      if (!currentChatId) {
        currentChatId = crypto.randomUUID();
        log("Creating new chat:", currentChatId);
        const newChat: StoredChat = {
          id: currentChatId,
          title: "New Chat...",
          messages: updatedMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(currentChatId);
      } else {
        log("Updating existing chat:", currentChatId);
        // Update existing chat with new message
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() }
              : c
          )
        );
      }

      setIsLoading(true);
      log("Sending request to /api/chat...");

      try {
        const chatStartTime = Date.now();
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const chatElapsed = Date.now() - chatStartTime;
        log(`Chat response received in ${chatElapsed}ms`, { status: response.status });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        log("Chat response parsed", { contentLength: data.content?.length || 0 });

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        setIsLoading(false);
        log("Assistant message added to state");

        // Fetch TTS (after showing the message) if voice is enabled
        if (voiceEnabled) {
          log("Voice enabled, initiating TTS fetch...");
          
          fetchTTS(data.content).then((audioData) => {
            log("TTS fetch completed", { hasData: !!audioData });
            if (audioData) {
              log("Setting currentAudio state with audio data");
              setCurrentAudio(audioData);
            } else {
              logError("TTS returned null audio data");
            }
          });
        } else {
          log("Voice disabled, skipping TTS");
        }

        // Update chat with assistant message
        const chatIdToUpdate = currentChatId;
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatIdToUpdate
              ? { ...c, messages: finalMessages, updatedAt: new Date().toISOString() }
              : c
          )
        );

        // Generate title after first exchange (2 messages: user + assistant)
        if (updatedMessages.length === 1) {
          const title = await generateTitle(finalMessages);
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatIdToUpdate ? { ...c, title } : c
            )
          );
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
    },
    [messages, activeChatId, voiceEnabled]
  );

  // Handle image analysis with multi-agent pipeline (auto-detection)
  const handleImageAnalysis = useCallback(
    async (imageBase64: string, mimeType: string) => {
      log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      log("handleImageAnalysis called", { mimeType, imageLength: imageBase64.length, mode: 'auto-detect' });

      // Clear any previous audio
      setCurrentAudio(null);

      // Create a user message showing they sent an image
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
      log("User image message added to state");

      // Create new chat if needed
      let currentChatId = activeChatId;
      if (!currentChatId) {
        currentChatId = crypto.randomUUID();
        log("Creating new chat for image analysis:", currentChatId);
        const newChat: StoredChat = {
          id: currentChatId,
          title: "🛡️ Screenshot Analysis",
          messages: updatedMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(currentChatId);
      } else {
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId
              ? { ...c, messages: updatedMessages, updatedAt: new Date().toISOString() }
              : c
          )
        );
      }

      setIsLoading(true);
      log("Sending image to /api/analyze for multi-agent analysis (auto-detection)...");

      try {
        const startTime = Date.now();
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: imageBase64,
            mimeType,
            // No mode specified - will be auto-detected by the API
            saveToDatabase: true,
          }),
        });

        const elapsed = Date.now() - startTime;
        log(`Analysis response received in ${elapsed}ms`, { status: response.status });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Analysis failed: ${errorData}`);
        }

        const result = await response.json();
        log("Analysis result received", {
          success: result.success,
          hasTiming: !!result.timing,
        });

        const analysisData = result.data as AnalysisResult;
        
        // Create the assistant message with the full markdown response
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: analysisData.guardian.fullMarkdownResponse,
          timestamp: new Date(),
          analysisResult: analysisData, // Store full analysis for reference
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        setIsLoading(false);
        log("Analysis response added to messages");

        // Fetch TTS for the voice script if voice is enabled
        if (voiceEnabled && analysisData.guardian.voiceScript) {
          log("Voice enabled, generating TTS for analysis...");
          fetchTTS(analysisData.guardian.voiceScript).then((audioData) => {
            if (audioData) {
              log("TTS for analysis ready");
              setCurrentAudio(audioData);
            }
          });
        }

        // Update chat with assistant message
        const chatIdToUpdate = currentChatId;
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatIdToUpdate
              ? { ...c, messages: finalMessages, updatedAt: new Date().toISOString() }
              : c
          )
        );
      } catch (error) {
        logError("Image analysis failed:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "😔 Sorry bestie, I couldn't analyze that screenshot. Try uploading again or make sure it's a clear image of a conversation.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }
    },
    [messages, activeChatId, voiceEnabled]
  );

  return (
    <div className="flex h-screen bg-[#121212]">
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        audioData={currentAudio}
        onSpeakingChange={setIsSpeaking}
      />
      <main className="flex-1 flex flex-col">
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading}
          isSpeaking={isSpeaking}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendImage={handleImageAnalysis}
          isLoading={isLoading}
          placeholder="Paste a conversation or upload a screenshot..."
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
        />
      </main>
    </div>
  );
}
