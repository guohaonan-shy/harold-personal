"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-main text-xs font-mono">
        <Sun className="w-3 h-3" />
        <span className="text-dim">light</span>
      </button>
    );
  }

  const toggleTheme = (event: React.MouseEvent) => {
    const isDark = theme === "dark";
    
    // @ts-ignore - View Transitions API is still new
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-main text-xs font-mono hover:bg-terminal transition-colors cursor-pointer"
    >
      {theme === "dark" ? (
        <>
          <Moon className="w-3 h-3 text-dim" />
          <span className="text-dim">dark</span>
        </>
      ) : (
        <>
          <Sun className="w-3 h-3 text-dim" />
          <span className="text-dim">light</span>
        </>
      )}
    </button>
  );
}
