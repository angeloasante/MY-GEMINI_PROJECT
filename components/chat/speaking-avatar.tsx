"use client";

import { useEffect, useState, useRef } from "react";

// Simple avatar component - visual animation only
// Audio plays from the sidebar

interface SpeakingAvatarProps {
  audioBase64: string | null;
  alignment: unknown;
  onAudioEnd?: () => void;
  size?: "sm" | "md" | "lg";
  isSpeaking?: boolean;
}

export function SpeakingAvatar({ 
  size = "md",
  isSpeaking = false,
}: SpeakingAvatarProps) {
  const [intensity, setIntensity] = useState(0);
  const animationRef = useRef<number | null>(null);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  // Animate intensity when speaking
  useEffect(() => {
    if (isSpeaking) {
      const animate = () => {
        setIntensity(0.3 + Math.random() * 0.7);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      setIntensity(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);

  return (
    <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/30 to-cyan-400/30 blur-md transition-all duration-75"
          style={{ transform: `scale(${1.2 + intensity * 0.3})` }}
        />
      )}
      
      {/* Avatar image */}
      <div 
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden transition-transform duration-75`}
        style={{ transform: isSpeaking ? `scale(${1 + intensity * 0.05})` : 'scale(1)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar.png"
          alt="AI Avatar"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Speaking indicator rings */}
      {isSpeaking && (
        <>
          <div 
            className="absolute inset-0 rounded-full border border-teal-400/40 animate-ping"
            style={{ animationDuration: '1.5s' }}
          />
        </>
      )}
    </div>
  );
}
