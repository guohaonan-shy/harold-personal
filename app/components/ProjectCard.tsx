"use client";

import React from "react";
import { Play, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  filename: string;
  link?: string;
  videoUrl?: string; // 默认视频 URL (建议 1080p)
  videoUrl720p?: string; // 移动端优化视频 URL
}

export default function ProjectCard({ 
  title, 
  description, 
  tags, 
  filename, 
  link,
  videoUrl,
  videoUrl720p,
}: ProjectCardProps) {
  const t = useTranslations("projects");
  const [isReady, setIsReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loadingText, setLoadingText] = React.useState("> CONNECTING...");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canPlayRef = React.useRef(false);
  const startTimeRef = React.useRef<number>(0);

  // Update loading text based on real progress
  React.useEffect(() => {
    if (isReady) {
      setLoadingText("> STREAM_READY. PLAYING...");
    } else if (progress >= 90) {
      setLoadingText("> FINALIZING...");
    } else if (progress > 65) {
      setLoadingText("> ALLOCATING MEMORY...");
    } else if (progress > 35) {
      setLoadingText("> DECRYPTING BUFFER...");
    } else if (progress > 10) {
      setLoadingText("> FETCHING VIDEO_STREAM...");
    } else if (progress > 0) {
      setLoadingText("> ESTABLISHING CONNECTION...");
    }
  }, [progress, isReady]);

  // Simulated progress with easing curve
  React.useEffect(() => {
    if (isReady || !videoUrl) return;

    startTimeRef.current = Date.now();
    
    const updateProgress = () => {
      // If video is ready, rush to 100%
      if (canPlayRef.current) {
        setProgress(prev => {
          const next = prev + (100 - prev) * 0.2;
          if (next >= 99.5) {
            setTimeout(() => setIsReady(true), 150);
            return 100;
          }
          return next;
        });
        return;
      }

      // Simulated progress using easing curve
      // Target duration: ~8 seconds to reach 95%
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 8000; // 8 seconds to 95%
      const t = Math.min(elapsed / duration, 1);
      
      // Ease-out curve: starts faster, slows down towards the end
      // Using cubic ease-out: 1 - (1-t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      
      // Map to 0-95% range
      const targetProgress = eased * 95;
      
      setProgress(prev => {
        // Smooth transition to target
        const diff = targetProgress - prev;
        return prev + diff * 0.1;
      });
    };

    // Update every 50ms for smooth animation
    const interval = setInterval(updateProgress, 50);
    
    return () => clearInterval(interval);
  }, [isReady, videoUrl]);

  // Handle video ready to play
  const handleCanPlay = React.useCallback(() => {
    canPlayRef.current = true;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-2xl border border-main bg-card overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 h-9 px-4 border-b border-main">
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
        <span className="ml-2 text-xs font-mono text-dim">~/projects/{filename}</span>
      </div>
      
      {/* Visual Container */}
      <div className="h-[500px] bg-page dark:bg-[#1A1A1A] relative overflow-hidden group">
        {/* Terminal Loading Overlay */}
        {!isReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center font-mono text-terminal-green bg-black/90">
            <div className="flex flex-col gap-2 w-64">
              <div className="flex items-center gap-2">
                <span className="animate-pulse">_</span>
                <span className="text-sm">{loadingText}</span>
              </div>
              <div className="w-full h-1 bg-terminal-green/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-terminal-green"
                />
              </div>
              <div className="text-[10px] text-terminal-green/50 text-right">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}

        {/* Video Element */}
        {videoUrl ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={handleCanPlay}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {videoUrl720p && <source src={videoUrl720p} media="(max-width: 768px)" type="video/mp4" />}
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <Play className="w-12 h-12 text-dim" />
            <span className="text-sm text-dim">{t("videoPlaceholder")}</span>
          </div>
        )}

        {/* CRT Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-20" />
      </div>
      
      {/* Info Section */}
      <div className="p-10 space-y-5 border-t border-main">
        {/* Tags */}
        <div className="flex items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded bg-page dark:bg-[#1A1A1A] border border-main text-xs font-bold text-dim"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Title */}
        <h3 className="text-4xl font-mono font-bold text-main">{title}</h3>
        
        {/* Description */}
        <p className="text-base text-dim leading-[1.6]">{description}</p>
        
      {/* Link */}
      {link && (
        <motion.a 
          href={link}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 text-main hover:underline font-bold text-sm"
        >
          <span>{t("visitProject")}</span>
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      )}
      </div>
    </motion.div>
  );
}
