"use client";

import { ChevronRight, Globe } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Terminal() {
  return (
    <div className="w-full max-w-[500px] rounded-xl border border-light bg-terminal shadow-2xl shadow-black/30 dark:shadow-black/80 -rotate-[5deg]">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
        <div className="w-3 h-3 rounded-full bg-terminal-red" />
        <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
        <div className="w-3 h-3 rounded-full bg-terminal-green" />
        
        <div className="flex-1" />
        
        {/* Language Toggle */}
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-main text-xs font-mono hover:bg-page transition-colors">
          <Globe className="w-3 h-3 text-dim" />
          <span className="text-dim">EN</span>
        </button>
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
      
      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm space-y-1.5">
        {/* Prompt line */}
        <div className="flex items-center gap-2.5">
          <ChevronRight className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-cyan">~</span>
          <span className="text-main font-bold">harold</span>
          <span className="text-main">help</span>
        </div>
        
        {/* Commands */}
        <p className="text-dim">Available commands:</p>
        <p className="text-main pl-4">whoami    - Intro &amp; Bio</p>
        <p className="text-main pl-4">status    - Live activity log</p>
        <p className="text-terminal-cyan font-bold pl-4">projects  - View selected work</p>
        <p className="text-main pl-4">contact   - Get in touch</p>
        
        {/* Cursor line */}
        <div className="flex items-center gap-2.5 mt-4">
          <ChevronRight className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-cyan">~</span>
          <span className="text-main font-bold">harold</span>
          <span className="w-2 h-4 bg-main animate-pulse" />
        </div>
      </div>
    </div>
  );
}
