"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

export default function Terminal() {
  const t = useTranslations("terminal");
  return (
    <div className="w-full max-w-[500px] rounded-xl border border-light bg-terminal shadow-lg shadow-black/5 dark:shadow-black/20 -rotate-[5deg]">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
        <div className="w-3 h-3 rounded-full bg-terminal-red" />
        <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
        <div className="w-3 h-3 rounded-full bg-terminal-green" />
        
        <div className="flex-1" />
        
        {/* Language Toggle */}
        <LanguageToggle />
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
      
      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm space-y-2">
        {/* Prompt line */}
        <div className="flex items-center gap-2.5">
          <ChevronRight className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-cyan">~</span>
          <span className="text-main font-bold">harold</span>
          <span className="text-main">--activity --all</span>
        </div>
        
        {/* Activity Output */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-start gap-4">
            <span className="text-terminal-green font-bold min-w-[80px]">{t("active")}</span>
            <span className="text-main">{t("toeflair")}</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-terminal-cyan font-bold min-w-[80px]">{t("crafting")}</span>
            <span className="text-main">{t("mrsteady")}</span>
          </div>
          <div className="flex items-start gap-4 pt-2 border-t border-main/10">
            <span className="text-dim/60 min-w-[80px]">INFO</span>
            <span className="text-dim">{t("status")}</span>
          </div>
        </div>
        
        {/* Cursor line */}
        <div className="flex items-center gap-2.5 mt-6">
          <ChevronRight className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-cyan">~</span>
          <span className="text-main font-bold">harold</span>
          <span className="w-2 h-4 bg-main animate-blink" />
        </div>
      </div>
    </div>
  );
}
