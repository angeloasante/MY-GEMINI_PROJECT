"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User } from "lucide-react";

export type AppMode = "personal" | "business";

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as AppMode)}
      className="w-auto"
    >
      <TabsList className="bg-[#2a2a2a] border border-[#3a3a3a] h-9">
        <TabsTrigger
          value="personal"
          disabled={disabled}
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-1.5 px-3 h-7 text-xs"
        >
          <User className="h-3.5 w-3.5" />
          <span>Personal</span>
        </TabsTrigger>
        <TabsTrigger
          value="business"
          disabled={disabled}
          className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-1.5 px-3 h-7 text-xs"
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Business</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
