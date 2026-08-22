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
  /** true = 挂载即从乱码解密到 text(供 boot 编排使用;默认保持原行为:仅 text 变化时解密) */
  animateOnMount?: boolean;
}

const GLYPHS = "ABCDEFGHIKLMNOPQRSTUVWYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

const scrambled = (source: string) =>
  source
    .split("")
    .map((char) =>
      char === " " || char === "\n"
        ? char
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    )
    .join("");

function DecryptedText({
  text,
  className = "",
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  animateOnMount = false,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(() =>
    animateOnMount ? scrambled(text) : text
  );
  const [isAnimating, setIsAnimating] = useState(animateOnMount);
  const previousText = useRef(text);
  const animationRef = useRef<number | null>(null);

  // 声明须在下方两个 effect 之前:两者都在挂载/text 变化时同步调用它
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

  useEffect(() => {
    if (animateOnMount) startAnimation(text);
    // 仅挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <span className={`${className} ${isAnimating ? "font-mono" : ""}`}>
      {displayText}
    </span>
  );
}

export default memo(DecryptedText);
