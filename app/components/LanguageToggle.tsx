"use client";

import { Globe } from "lucide-react";
import { useLocaleToggle } from "./LocaleProvider";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLocaleToggle();

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-card border border-main text-xs font-mono hover:bg-page transition-colors cursor-pointer"
    >
      <Globe className="w-3 h-3 text-dim" />
      <span className="text-dim">{locale.toUpperCase()}</span>
    </button>
  );
}
