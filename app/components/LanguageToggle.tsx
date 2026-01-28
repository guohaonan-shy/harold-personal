"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "zh" : "en";

    // @ts-ignore
    if (!document.startViewTransition) {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
      router.refresh();
      return;
    }

    // @ts-ignore
    document.startViewTransition(async () => {
      document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
      router.refresh();
      // 给浏览器一点时间来响应路由刷新
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  };

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
