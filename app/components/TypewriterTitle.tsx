"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface TypewriterTitleProps {
  path: string;
  user?: string;
  command?: string;
  className?: string;
}

export default function TypewriterTitle({ 
  path, 
  user = "harold", 
  command = "", 
  className = "" 
}: TypewriterTitleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = `${path} ${user} ${command}`;
  
  // Break down parts for styling
  const pathPart = path;
  const userPart = user;
  const commandPart = command;

  useEffect(() => {
    if (isInView) {
      let currentText = "";
      const totalLength = fullText.length;
      let i = 0;

      const timer = setInterval(() => {
        if (i < totalLength) {
          currentText += fullText[i];
          setDisplayText(currentText);
          i++;
        } else {
          clearInterval(timer);
          setIsTypingComplete(true);
        }
      }, 50); // Typing speed

      return () => clearInterval(timer);
    }
  }, [isInView, fullText]);

  // Calculate what to show based on current length
  const getVisibleParts = () => {
    let remaining = displayText.length;
    
    const visiblePath = pathPart.slice(0, remaining);
    remaining = Math.max(0, remaining - pathPart.length - 1); // -1 for space
    
    const visibleUser = userPart.slice(0, remaining);
    remaining = Math.max(0, remaining - userPart.length - 1); // -1 for space
    
    const visibleCommand = commandPart.slice(0, remaining);
    
    return { visiblePath, visibleUser, visibleCommand };
  };

  const { visiblePath, visibleUser, visibleCommand } = getVisibleParts();

  return (
    <div ref={ref} className={`flex items-center gap-4 mb-10 font-mono text-[32px] ${className}`}>
      <ChevronRight className="w-8 h-8 text-terminal-green" />
      
      <div className="flex items-center gap-4">
        {visiblePath && (
          <span className="text-terminal-cyan">{visiblePath}</span>
        )}
        
        {visibleUser && (
          <span className="text-main font-bold">{visibleUser}</span>
        )}
        
        {visibleCommand && (
          <span className="text-main font-bold">{visibleCommand}</span>
        )}
        
        {/* Blinking Cursor - only show while typing */}
        {!isTypingComplete && (
          <motion.span
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            className="w-3 h-8 bg-terminal-green inline-block ml-1"
          />
        )}
      </div>
    </div>
  );
}
