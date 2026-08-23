"use client";

import { memo, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { asciiAvatar, type AsciiVariant } from "../generated/ascii-avatar";
import CharFieldCanvas from "./charfield/CharFieldCanvas";

/** Hero boot 编排的卡片入场阶段:chrome 头先现,内容随后淡入 */
export type AvatarBootStage = "pending" | "chrome" | "content";

/**
 * static = 01 的形态(SSR / 粗指针 / reduced-motion / WebGL 不可用):
 *   静态 ASCII,tap/click 切换照片。
 * field = 细指针增强:WebGL 字符场,照片常驻底层,hover 整卡解密,click 不切换。
 */
type AvatarMode = "static" | "field";

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

/** 细指针 + 非 reduced-motion → 有资格升级到 field 模式(WebGL 字符场) */
function isFieldEligible() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function subscribeFieldEligible(onChange: () => void) {
  const fine = window.matchMedia("(pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  fine.addEventListener("change", onChange);
  reduced.addEventListener("change", onChange);
  return () => {
    fine.removeEventListener("change", onChange);
    reduced.removeEventListener("change", onChange);
  };
}
/** SSR 与首次客户端渲染必须一致,保守判不合格——粗指针 / reduced-motion 访客据此不建 WebGL 上下文 */
const fieldEligibleServerSnapshot = () => false;

function AsciiAvatarCard({ bootStage, bootScale = 1 }: AsciiAvatarCardProps) {
  const t = useTranslations("hero");
  const [showPhoto, setShowPhoto] = useState(false);
  // 派生自 matchMedia 的外部状态(useSyncExternalStore),取代手动 effect+setState 的
  // 挂载态跳变——SSR 与首帧客户端渲染保持一致,水合后随媒体查询变化自动同步
  const fieldEligible = useSyncExternalStore(
    subscribeFieldEligible,
    isFieldEligible,
    fieldEligibleServerSnapshot
  );
  // WebGL 引擎创建/运行失败时的单向降级开关,与 matchMedia 资格判定相互独立
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const mode: AvatarMode = fieldEligible && !webglUnavailable ? "field" : "static";
  // hover/focus 整卡 → 字符层渐隐露出照片(仅 field 模式)
  const [revealed, setRevealed] = useState(false);
  // undefined = 等待槽位;null = 无编排,直达稳态;number = settle 起算时刻
  const [settleAt, setSettleAt] = useState<number | null | undefined>(undefined);

  // settle 挂在 02 分镜预留的 cardBody 槽位(bootStage → "content")上,不另起触发时机。
  // setState 挪到 rAF 回调里触发(而不是效果体内直接调用),避免 cascading render 告警;
  // 单帧(~16ms)延迟不影响"起算时刻,不顺延"的语义
  useEffect(() => {
    if (mode !== "field") return;
    if (bootStage === "content") {
      const raf = requestAnimationFrame(() => {
        setSettleAt((v) => (v === undefined ? performance.now() : v));
      });
      return () => cancelAnimationFrame(raf);
    }
    if (bootStage === undefined) {
      // 防御:field 模式正常时序下必有 boot 编排;缺席则直达稳态
      const raf = requestAnimationFrame(() => {
        setSettleAt((v) => (v === undefined ? null : v));
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [mode, bootStage]);

  const showingPhoto = mode === "field" ? revealed : showPhoto;

  const chrome = (
    <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
      <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
      <span className="flex-1 text-center text-xs font-mono text-dim">
        {showingPhoto ? "~/harold/avatar.jpg" : "~/harold/avatar.ascii"}
      </span>
    </div>
  );

  const photo = (
    <Image
      src="/avatar.jpg"
      alt={t("avatarAlt")}
      fill
      sizes="(max-width: 640px) 100vw, 500px"
      className="object-cover"
      // field 模式照片常驻底层(首屏 LCP),eager 加载保证首次 hover 解密时已就绪
      priority={mode === "field"}
    />
  );

  const body =
    mode === "field" ? (
      <div className="relative aspect-square">
        {/* 照片常驻底层,字符层渐隐即"解密" */}
        {photo}
        <div
          className="absolute inset-0 bg-terminal"
          style={{
            opacity: revealed ? 0 : 1,
            // 渐隐带 250ms 起步延迟:划过只见扰动,驻留才解密;移开立即恢复
            transition: revealed
              ? "opacity 0.4s ease 0.25s"
              : "opacity 0.25s ease",
          }}
        >
          <CharFieldCanvas
            settleAt={settleAt}
            onUnavailable={() => setWebglUnavailable(true)}
          />
        </div>
      </div>
    ) : (
      <div className="@container relative aspect-square">
        {showPhoto ? (
          photo
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

  const frame = bootStage ? (
    <motion.div
      className={frameClass}
      initial={{ opacity: 0 }}
      animate={bootStage === "pending" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.3 * bootScale, ease: "easeOut" }}
    >
      {chrome}
      {/* bootStage 变为 "content" 的转变就是触发槽位:静态形态淡入内容,
          field 形态在同一时刻开始 WebGL settle */}
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
  );

  if (mode === "field") {
    // 细指针上 hover 取代点按切换;tabIndex + focus 让键盘同样可解密
    return (
      <div
        tabIndex={0}
        className="block w-full text-left outline-none"
        onPointerEnter={() => setRevealed(true)}
        onPointerLeave={() => setRevealed(false)}
        onFocus={() => setRevealed(true)}
        onBlur={() => setRevealed(false)}
      >
        {frame}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowPhoto((v) => !v)}
      aria-pressed={showPhoto}
      aria-label={t("avatarToggle")}
      className="block w-full cursor-pointer text-left"
    >
      {frame}
    </button>
  );
}

export default memo(AsciiAvatarCard);
