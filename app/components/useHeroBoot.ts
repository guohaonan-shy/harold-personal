"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** 徽章行逐字打出的命令(全场唯一逐字打字) */
export const BOOT_COMMAND = "init --workspace";

/** 每字符打字间隔(ms,桌面基准)。16 字符 × 30ms = 480ms,收在 0–500ms 窗口内 */
const TYPE_MS = 30;

/**
 * boot 分镜 cue 表(桌面基准,ms)。移动端(pointer: coarse)整体乘 MOBILE_SCALE 压缩到 ~0.8s。
 * 键序必须按时刻升序排列——passed() 依赖这个顺序判定。
 */
export const BOOT_CUES = {
  /** H1 第一行整行回显 */
  h1Line1: 400,
  /** 光标从徽章行跳到 H1 尾部,闪两次(CSS 动画 210ms 后常灭) */
  h1Cursor: 500,
  /** H1 第二行整行回显(与第一行 stagger 100ms) */
  h1Line2: 500,
  /** 副标题开始字符解密 */
  subtitle: 640,
  /** 光标交接到副标题尾部 */
  subtitleCursor: 710,
  /** 描述段 fade-in */
  description: 720,
  /** ASCII 卡片 chrome 头先现 */
  cardChrome: 800,
  /** 卡片内容淡入(后续 WebGL settle 动画的触发槽位) */
  cardBody: 950,
  /** 编排完成:光标退场,徽章行绿点常驻脉冲 */
  done: 1400,
} as const;

export type BootCue = keyof typeof BOOT_CUES;

const CUE_ORDER = Object.keys(BOOT_CUES) as BootCue[];

/** 移动端同一分镜压缩到 ~0.8s */
const MOBILE_SCALE = 0.8 / 1.4;

/** SSR 时 useLayoutEffect 会告警,服务端降级为 useEffect(服务端本来就不执行) */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

interface BootState {
  active: boolean;
  typed: number;
  cuesPassed: number;
  scale: number;
}

export interface HeroBoot {
  /** true = 编排接管渲染(播放中或已播完);false = 静态呈现(SSR / 无 JS / reduced-motion) */
  active: boolean;
  /** 徽章命令已打出的字符数 */
  typed: number;
  /** 时间缩放系数(桌面 1,移动 ~0.57),动效时长与 cue 同步缩放 */
  scale: number;
  passed: (cue: BootCue) => boolean;
  done: boolean;
}

export function useHeroBoot(): HeroBoot {
  const [state, setState] = useState<BootState>({
    active: false,
    typed: 0,
    cuesPassed: 0,
    scale: 1,
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 内联脚本此时不会置位;兜底清掉,保证直接呈现终态
      document.documentElement.removeAttribute("data-boot");
      return;
    }
    const scale = window.matchMedia("(pointer: coarse)").matches
      ? MOBILE_SCALE
      : 1;
    setState({ active: true, typed: 0, cuesPassed: 0, scale });

    const start = performance.now();
    const tick = (now: number) => {
      // 归一化到桌面基准时间轴,cue 表不用按档位换算
      const elapsed = (now - start) / scale;
      const typed = Math.min(BOOT_COMMAND.length, Math.floor(elapsed / TYPE_MS));
      const cuesPassed = CUE_ORDER.filter((c) => elapsed >= BOOT_CUES[c]).length;
      setState((prev) =>
        prev.typed === typed && prev.cuesPassed === cuesPassed
          ? prev
          : { ...prev, typed, cuesPassed }
      );
      if (elapsed < BOOT_CUES.done) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // 编排分支带着内联隐藏样式渲染提交后、绘制前,才能安全移除 CSS 门控,避免终态闪现
  useIsoLayoutEffect(() => {
    if (state.active) document.documentElement.removeAttribute("data-boot");
  }, [state.active]);

  const passed = (cue: BootCue) => CUE_ORDER.indexOf(cue) < state.cuesPassed;

  return {
    active: state.active,
    typed: state.typed,
    scale: state.scale,
    passed,
    done: passed("done"),
  };
}
