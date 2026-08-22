"use client";

import React, { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "./Lightbox";

interface ProjectCardProps {
  /** section prompt 打完后置 true,卡片入场动画以此为触发(不再各自 whileInView) */
  revealed?: boolean;
  /**
   * 已水合且非 reduced-motion 时置 true(来自 useSectionEntrance),才挂 framer 入场分支。
   * false(SSR / 无 JS / reduced-motion)走 boot-hide 静态分支——framer 会把 initial
   * 的 opacity:0 内联进 SSR HTML,无 JS 访客将永远看不到卡片。
   */
  motionReady?: boolean;
  title: string;
  description: string;
  tags: string[];
  filename: string;
  link?: string;
  videoUrl?: string;
  videoUrl720p?: string;
  imageUrl?: string;
}

export default function ProjectCard({
  revealed = false,
  motionReady = false,
  title,
  description,
  tags,
  filename,
  link,
  videoUrl,
  videoUrl720p,
  imageUrl,
}: ProjectCardProps) {
  const t = useTranslations("projects");
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loadingText, setLoadingText] = React.useState("> CONNECTING...");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canPlayRef = React.useRef(false);
  const startTimeRef = React.useRef<number>(0);
  const coarseTriggeredRef = React.useRef(false);
  const coarseObserverRef = React.useRef<IntersectionObserver | null>(null);

  /**
   * 粗指针(spec §4「移动端…hover 触发的效果改为进入视口触发一次」)设备没有 hover:
   * onMouseEnter/Leave 永不触发,isHovered 常驻 false,"visit project" 外链胶囊
   * 因此永远不可达。用回调 ref(而非 useEffect + 固定 ref 对象)是因为卡片根节点
   * 会在 motionReady 分支切换(静态 boot-hide div ↔ framer motion.div)时被整体替换,
   * 回调 ref 能在节点重挂载时重新绑定 observer;仅触发一次,不随滚出视口撤回。
   */
  const setCardNode = React.useCallback((node: HTMLDivElement | null) => {
    coarseObserverRef.current?.disconnect();
    coarseObserverRef.current = null;
    if (!node || coarseTriggeredRef.current) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          coarseTriggeredRef.current = true;
          setIsHovered(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(node);
    coarseObserverRef.current = io;
  }, []);

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

  React.useEffect(() => {
    if (isReady || !videoUrl) return;

    startTimeRef.current = Date.now();

    const updateProgress = () => {
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

      const elapsed = Date.now() - startTimeRef.current;
      const duration = 8000;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const targetProgress = eased * 95;

      setProgress(prev => {
        const diff = targetProgress - prev;
        return prev + diff * 0.1;
      });
    };

    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [isReady, videoUrl]);

  const handleCanPlay = React.useCallback(() => {
    canPlayRef.current = true;
  }, []);

  const cardBody = (
    <>
      {/* Card Header */}
      <div className="flex items-center gap-2 h-9 px-4 border-b border-main">
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
        <span className="ml-2 text-xs font-mono text-dim">~/projects/{filename}</span>
      </div>

      {/* Visual Container */}
      <div className="bg-page dark:bg-[#1A1A1A] relative overflow-hidden group" style={{ height: "360px" }}>
        {!isReady && !imageUrl && (
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
        ) : imageUrl ? (
          <button onClick={() => setLightboxOpen(true)} className="block w-full h-full cursor-zoom-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain"
              style={{ backgroundColor: "#0a0a0a" }}
            />
          </button>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <Play className="w-12 h-12 text-dim" />
            <span className="text-sm text-dim">{t("videoPlaceholder")}</span>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03] z-20" />
      </div>

      {/* Info Section */}
      <div className="p-6 border-t border-main" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        <div className="flex items-center justify-between gap-3" style={{ minHeight: "2.25rem" }}>
          <h3 className="text-2xl font-mono font-bold text-main leading-none tracking-tight">{title}</h3>
          {link && (
            <AnimatePresence>
              {isHovered && (
                <motion.a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-main font-mono text-xs font-bold bg-main/5 hover:bg-main/10 border border-main/20 hover:border-main/40 px-4 py-2 rounded-full transition-colors duration-200 shrink-0"
                  style={{ marginLeft: "auto" }}
                >
                  <span>{t("visitProject")}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </motion.a>
              )}
            </AnimatePresence>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-md bg-main/5 border border-main/20 text-xs font-bold text-main/80 uppercase tracking-widest"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-dim leading-[1.6]">{description}</p>
      </div>
    </>
  );

  return (
    <>
    {motionReady ? (
      <motion.div
        ref={setCardNode}
        initial={{ opacity: 0, y: 20 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        // reduced-motion 不会进本分支(motionReady 恒 false),无需归零时长
        transition={{ duration: 0.6, ease: "easeOut" }}
        onMouseEnter={() => setIsHovered(true)}
        // 粗指针触摸偶发的合成 mouseleave 不该撤销"进视口一次性触发"的状态
        onMouseLeave={() => !coarseTriggeredRef.current && setIsHovered(false)}
        className="rounded-2xl bg-card overflow-hidden transition-all duration-300"
        style={{ border: "1px solid rgba(128,128,128,0.3)" }}
      >
        {cardBody}
      </motion.div>
    ) : (
      // 静态分支:boot-hide 只在 html[data-boot](JS 开、boot 编排接管前)时隐藏,
      // 无 JS / reduced-motion 下内容直接可见
      <div
        ref={setCardNode}
        className="boot-hide rounded-2xl bg-card overflow-hidden transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !coarseTriggeredRef.current && setIsHovered(false)}
        style={{ border: "1px solid rgba(128,128,128,0.3)" }}
      >
        {cardBody}
      </div>
    )}

    {/* Lightbox */}
    {imageUrl && (
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={imageUrl}
        alt={title}
      />
    )}
    </>
  );
}
