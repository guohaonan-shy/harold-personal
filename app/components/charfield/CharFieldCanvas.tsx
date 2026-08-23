"use client";

import { memo, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { asciiAvatar } from "../../generated/ascii-avatar";
import type { CharFieldEngine, CharFieldColors } from "./engine";

/** 配色对齐 globals.css 的 token:background=--bg-terminal,墨色阶围绕 --text-dim 展开 */
const THEME_COLORS: Record<"dark" | "light", CharFieldColors> = {
  dark: { background: "#121212", inkLow: "#5A5A5A", inkHigh: "#C2C2C2", green: "#27C93F" },
  light: { background: "#F9F9F9", inkLow: "#9A9A9A", inkHigh: "#2E2E2E", green: "#27C93F" },
};

interface CharFieldCanvasProps {
  /**
   * settle 状态:undefined = 等待槽位(全场噪声);null = 无编排,直达稳态;
   * number = settle 起算时刻(performance.now() 基准,引擎晚就绪时掐头不顺延)
   */
  settleAt: number | null | undefined;
  /** WebGL 上下文创建失败 → 父层回退 01 的静态形态 */
  onUnavailable: () => void;
}

interface Controller {
  applySettle(): void;
  applyTheme(): void;
  wake(): void;
}

function CharFieldCanvas({ settleAt, onUnavailable }: CharFieldCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CharFieldEngine | null>(null);
  const ctrlRef = useRef<Controller | null>(null);
  const settleRef = useRef(settleAt);

  const { resolvedTheme } = useTheme();
  const theme: "dark" | "light" = resolvedTheme === "light" ? "light" : "dark";
  const themeRef = useRef(theme);

  const unavailableRef = useRef(onUnavailable);

  // 渲染后同步最新值,供 mount 闭包内的异步回调(import().then / observer)读取。
  // 必须声明在下方消费这些 ref 的 effect 之前,保证同轮渲染先同步后消费。
  useEffect(() => {
    settleRef.current = settleAt;
    themeRef.current = theme;
    unavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let disposed = false;
    let raf: number | null = null;
    let visible = true;

    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };
    const wake = () => {
      if (raf !== null || !visible || !engineRef.current) return;
      const loop = () => {
        const engine = engineRef.current;
        if (!engine || !visible) {
          raf = null;
          return;
        }
        // frame() 返回 false = 稳态且指针离场,停帧等事件唤醒
        raf = engine.frame() ? requestAnimationFrame(loop) : null;
      };
      raf = requestAnimationFrame(loop);
    };
    const applySettle = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const s = settleRef.current;
      if (s === null) engine.setStable();
      else if (typeof s === "number") engine.startSettle(s);
      wake();
    };
    const applyTheme = () => {
      const engine = engineRef.current;
      if (!engine) return;
      const t = themeRef.current;
      engine.setVariant(asciiAvatar[t], THEME_COLORS[t]);
      wake();
    };
    ctrlRef.current = { applySettle, applyTheme, wake };

    // chunk 加载被拒(离线/部署错位/脚本拦截器)与构造后续步骤抛错都必须走 onUnavailable
    // 静态回退,而不是让引擎半初始化、canvas 停留成一块无特征方块。
    import("./engine")
      .then(({ CharFieldEngine: Engine }) => {
        if (disposed) return;
        try {
          const engine = new Engine(canvas, asciiAvatar.cols, asciiAvatar.rows);
          engineRef.current = engine;
          applyTheme();
          engine.setSize(wrap.clientWidth, wrap.clientHeight);
          applySettle();
        } catch {
          unavailableRef.current();
        }
      })
      .catch(() => {
        if (!disposed) unavailableRef.current();
      });

    const ro = new ResizeObserver(() => {
      const engine = engineRef.current;
      if (engine && wrap.clientWidth > 0) {
        engine.setSize(wrap.clientWidth, wrap.clientHeight);
        wake();
      }
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else stop();
    });
    io.observe(wrap);

    return () => {
      disposed = true;
      ro.disconnect();
      io.disconnect();
      stop();
      ctrlRef.current = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    ctrlRef.current?.applySettle();
  }, [settleAt]);

  useEffect(() => {
    ctrlRef.current?.applyTheme();
  }, [theme]);

  return (
    <div ref={wrapRef} className="absolute inset-[3.2%]">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="block h-full w-full"
        onPointerMove={(ev) => {
          const rect = ev.currentTarget.getBoundingClientRect();
          engineRef.current?.setPointer({
            x: ((ev.clientX - rect.left) / rect.width) * asciiAvatar.cols,
            y: ((ev.clientY - rect.top) / rect.height) * asciiAvatar.rows,
          });
          ctrlRef.current?.wake();
        }}
        onPointerLeave={() => {
          engineRef.current?.setPointer(null);
          ctrlRef.current?.wake();
        }}
      />
    </div>
  );
}

export default memo(CharFieldCanvas);
