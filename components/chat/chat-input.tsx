"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { Mic, Send, Volume2, VolumeX, Paperclip, X, Image } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (imageBase64: string, mimeType: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

interface ImagePreview {
  base64: string;
  mimeType: string;
  name: string;
}

export function ChatInput({
  onSendMessage,
  onSendImage,
  isLoading,
  placeholder = "Type anything here...",
  voiceEnabled,
  onToggleVoice,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    // If we have an image, send the image for analysis
    if (imagePreview && onSendImage && !isLoading) {
      onSendImage(imagePreview.base64, imagePreview.mimeType);
      setImagePreview(null);
      setInput("");
      return;
    }

    // Otherwise send text message
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (PNG, JPEG, WebP, or GIF)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large. Please select an image under 10MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1]; // Remove data URL prefix
      setImagePreview({
        base64,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 bg-[#1a1a1a]">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 bg-[#2a2a2a] rounded-xl p-3 flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#3a3a3a] flex-shrink-0">
            <img
              src={`data:${imagePreview.mimeType};base64,${imagePreview.base64}`}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300 font-medium truncate">
                {imagePreview.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              📸 Screenshot ready for analysis
            </p>
          </div>
          <button
            onClick={handleRemoveImage}
            className="w-8 h-8 rounded-full bg-[#3a3a3a] flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 bg-[#2a2a2a] rounded-2xl px-4 py-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          onClick={handleAttachClick}
          disabled={isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
            imagePreview
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "bg-[#3a3a3a] text-gray-400 hover:bg-[#444] hover:text-purple-400"
          }`}
          title="Attach screenshot for analysis"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Mic Button */}
        <button className="w-10 h-10 rounded-full bg-[#3a3a3a] flex items-center justify-center hover:bg-[#444] transition-colors shrink-0">
          <Mic className="w-5 h-5 text-gray-400" />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={imagePreview ? "Press send to analyze screenshot..." : placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm py-2 min-h-[40px] max-h-[120px]"
          rows={1}
        />

        {/* Voice Toggle Button */}
        <button
          onClick={onToggleVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
            voiceEnabled
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "bg-[#3a3a3a] text-gray-400 hover:bg-[#444]"
          }`}
          title={voiceEnabled ? "Voice responses ON" : "Voice responses OFF"}
        >
          {voiceEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={(!input.trim() && !imagePreview) || isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
            imagePreview
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-teal-500 to-cyan-500"
          }`}
          title={imagePreview ? "Analyze Screenshot 🚩" : "Send Message"}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
