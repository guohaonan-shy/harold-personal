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

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-main text-xs font-mono hover:bg-terminal transition-colors"
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
