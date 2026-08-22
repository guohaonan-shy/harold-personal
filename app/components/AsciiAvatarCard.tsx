"use client";

import { memo, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { asciiAvatar, type AsciiVariant } from "../generated/ascii-avatar";

/** Hero boot 编排的卡片入场阶段:chrome 头先现,内容随后淡入 */
export type AvatarBootStage = "pending" | "chrome" | "content";

function AsciiArt({
  variant,
  className,
}: {
  variant: AsciiVariant;
  className?: string;
}) {
  return (
    <pre
      aria-hidden
      className={`font-mono leading-none text-[2.6cqw] text-dim select-none ${className ?? ""}`}
    >
      {variant.lines.map((line, r) => {
        const runs = variant.green[r];
        const segments: ReactNode[] = [];
        let cursor = 0;
        runs.forEach(([start, end], i) => {
          if (start > cursor) segments.push(line.slice(cursor, start));
          segments.push(
            <span key={i} className="text-terminal-green">
              {line.slice(start, end)}
            </span>
          );
          cursor = end;
        });
        if (cursor < line.length) segments.push(line.slice(cursor));
        segments.push("\n");
        return <span key={r}>{segments}</span>;
      })}
    </pre>
  );
}

interface AsciiAvatarCardProps {
  /** 不传 = 静态呈现(SSR / 无 JS / reduced-motion);传入后由 boot 编排驱动入场 */
  bootStage?: AvatarBootStage;
  /** boot 时间缩放系数(移动端压缩档位),与 cue 表同源 */
  bootScale?: number;
}

function AsciiAvatarCard({ bootStage, bootScale = 1 }: AsciiAvatarCardProps) {
  const t = useTranslations("hero");
  const [showPhoto, setShowPhoto] = useState(false);

  const chrome = (
    <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
      <span className="flex-1 text-center text-xs font-mono text-dim">
        {showPhoto ? "~/harold/avatar.jpg" : "~/harold/avatar.ascii"}
      </span>
    </div>
  );

  const body = (
    <div className="@container relative aspect-square">
      {showPhoto ? (
        <Image
          src="/avatar.jpg"
          alt={t("avatarAlt")}
          fill
          sizes="(max-width: 640px) 100vw, 500px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <AsciiArt variant={asciiAvatar.dark} className="hidden dark:block" />
          <AsciiArt variant={asciiAvatar.light} className="dark:hidden" />
        </div>
      )}
    </div>
  );

  const frameClass =
    "rounded-2xl border border-main bg-terminal shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden transition-colors hover:border-light";

  return (
    <button
      type="button"
      onClick={() => setShowPhoto((v) => !v)}
      aria-pressed={showPhoto}
      aria-label={t("avatarToggle")}
      className="block w-full cursor-pointer text-left"
    >
      {bootStage ? (
        <motion.div
          className={frameClass}
          initial={{ opacity: 0 }}
          animate={bootStage === "pending" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.3 * bootScale, ease: "easeOut" }}
        >
          {chrome}
          {/* bootStage 变为 "content" 的这次转变是明确的触发槽位:
              本刀只做静态内容淡入,后续 WebGL settle 动画挂在同一触发点上 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={bootStage === "content" ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.35 * bootScale, ease: "easeOut" }}
          >
            {body}
          </motion.div>
        </motion.div>
      ) : (
        <div className={frameClass}>
          {chrome}
          {body}
        </div>
      )}
    </button>
  );
}

export default memo(AsciiAvatarCard);
