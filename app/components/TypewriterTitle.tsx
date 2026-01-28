"use client";

import { useRef, useState, useEffect, memo } from "react";
import { ChevronRight } from "lucide-react";

interface TypewriterTitleProps {
  path: string;
  user?: string;
  command?: string;
  className?: string;
}

/**
 * Optimized TypewriterTitle
 * Uses requestAnimationFrame and useRef to avoid React state lag.
 * Only triggers once when visible.
 */
function TypewriterTitle({ 
  path, 
  user = "harold", 
  command = "", 
  className = "" 
}: TypewriterTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [displayedPath, setDisplayedPath] = useState("");
  const [displayedUser, setDisplayedUser] = useState("");
  const [displayedCommand, setDisplayedCommand] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasStarted.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          observer.disconnect();
          startTyping();
        }
      },
      { threshold: 0.2 } // Trigger earlier
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const startTyping = () => {
    const fullText = `${path} ${user} ${command}`;
    let index = 0;
    let lastTime = 0;
    const interval = 40; // Slightly faster for better feel

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;

      if (timestamp - lastTime >= interval) {
        index++;
        
        // Use a single update logic to minimize re-renders
        let remaining = index;
        
        // Path part
        const pathPart = path.slice(0, remaining);
        setDisplayedPath(pathPart);
        
        // User part
        remaining = Math.max(0, remaining - path.length - 1);
        const userPart = user.slice(0, remaining);
        setDisplayedUser(userPart);
        
        // Command part
        remaining = Math.max(0, remaining - user.length - 1);
        const commandPart = command.slice(0, remaining);
        setDisplayedCommand(commandPart);
        
        lastTime = timestamp;

        if (index >= fullText.length) {
          setIsTypingComplete(true);
          return;
        }
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <div ref={ref} className={`flex items-center gap-4 mb-10 font-mono text-[32px] ${className}`}>
      <ChevronRight className="w-8 h-8 text-terminal-green" />
      
      <div className="flex items-center gap-4">
        {displayedPath && (
          <span className="text-terminal-cyan">{displayedPath}</span>
        )}
        
        {displayedUser && (
          <span className="text-main font-bold">{displayedUser}</span>
        )}
        
        {displayedCommand && (
          <span className="text-main font-bold">{displayedCommand}</span>
        )}
        
        {!isTypingComplete && (
          <span className="w-3 h-8 bg-terminal-green inline-block ml-1 animate-blink" />
        )}
      </div>
    </div>
  );
}

export default memo(TypewriterTitle);
