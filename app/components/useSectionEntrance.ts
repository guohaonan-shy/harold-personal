"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/** SSR 时 useLayoutEffect 会告警,服务端降级为 useEffect(服务端本来就不执行) */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Section 内容入场门控:prompt 打完(onPromptDone)之前隐藏内容,打完后入场。
 *
 * 三态交接的原因:html[data-boot] 在 Hero boot 接管时就被移除(useHeroBoot),
 * 之后 boot-hide 失效,所以水合起必须由本 hook 用自身状态接管隐藏。
 * - "ssr":标记用 boot-hide —— 无 JS / reduced-motion 下 data-boot 不在,内容直接可见
 * - "gated":水合后、prompt 未打完 —— 无条件隐藏(绘制前接管,不闪现)
 * - "entered":prompt 完成 —— 播放入场动画(reduced-motion 由 CSS 中和,直接就位)
 */
export function useSectionEntrance() {
  const [phase, setPhase] = useState<"ssr" | "gated" | "entered">("ssr");

  useIsoLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase((p) => (p === "ssr" ? "gated" : p));
    }
  }, []);

  const onPromptDone = useCallback(() => setPhase("entered"), []);

  const entered = phase === "entered";
  /** 只隐藏不入场:prompt 完成后直接就位(给不该新增动画的既有静态元素用) */
  const pendingClass =
    phase === "gated" ? "opacity-0" : phase === "ssr" ? "boot-hide" : "";
  const entranceClass = entered ? "animate-fadeIn" : pendingClass;

  return { entered, entranceClass, pendingClass, onPromptDone };
}
