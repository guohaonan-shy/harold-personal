"use client";

import { useState, useEffect, useRef, memo } from "react";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
}

const GLYPHS = "ABCDEFGHIKLMNOPQRSTUVWYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

function DecryptedText({
  text,
  className = "",
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousText = useRef(text);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (text !== previousText.current) {
      setIsAnimating(true);
      startAnimation(text);
      previousText.current = text;
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [text]);

  const startAnimation = (targetText: string) => {
    let iteration = 0;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      
      if (elapsed >= iteration * speed) {
        iteration++;
        
        const nextText = targetText
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            
            // Logic for revealing characters
            let shouldReveal = false;
            if (sequential) {
              if (revealDirection === "start") {
                shouldReveal = index < iteration / (maxIterations / targetText.length);
              } else if (revealDirection === "end") {
                shouldReveal = index > targetText.length - iteration / (maxIterations / targetText.length);
              } else {
                const center = targetText.length / 2;
                const dist = Math.abs(index - center);
                shouldReveal = dist < iteration / (maxIterations / (targetText.length / 2));
              }
            } else {
              shouldReveal = iteration >= maxIterations;
            }

            if (shouldReveal) return char;
            
            // Random glyph
            const pool = useOriginalCharsOnly ? targetText : GLYPHS;
            return pool[Math.floor(Math.random() * pool.length)];
          })
          .join("");

        setDisplayText(nextText);

        if (iteration >= maxIterations * 1.5 || nextText === targetText) {
          setDisplayText(targetText);
          setIsAnimating(false);
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <span className={`${className} ${isAnimating ? "font-mono" : ""}`}>
      {displayText}
    </span>
  );
}

export default memo(DecryptedText);
