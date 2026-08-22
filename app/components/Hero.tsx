"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import AsciiAvatarCard from "./AsciiAvatarCard";
import DecryptedText from "./DecryptedText";

export default function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="min-h-[800px] bg-gradient-section border-t border-light flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-[80px] w-full">
        {/* Top Section: Badge and Big Title */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-main/30 font-mono text-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <ChevronRight className="w-3 h-3 text-terminal-green" />
            <span className="text-terminal-cyan">~</span>
            <span className="text-main font-bold">harold</span>
            <span className="text-dim">init --workspace</span>
          </div>
          
          {/* Big Heading - Spans across */}
          <div className="max-w-5xl mx-auto space-y-4 min-h-[120px] lg:min-h-[160px] flex flex-col justify-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-main leading-[1.1] tracking-tight">
              {t.rich("title", {
                green: (chunks) => <span className="text-terminal-green italic">{chunks}</span>,
                br: () => <br className="hidden lg:block" />
              })}
            </h1>
            <div className="text-xs font-mono text-dim opacity-40">
              <DecryptedText text={t("subtitle")} speed={40} maxIterations={15} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Split Bio and Visual */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-[100px]">
          {/* Description - Left column */}
          <div className="flex-1">
            <p className="text-xl text-dim leading-[1.6] max-w-[550px]">
              {t.rich("description", {
                name: (chunks) => <span className="text-main font-semibold">{chunks}</span>,
                green: (chunks) => <span className="text-terminal-green italic">{chunks}</span>
              })}
              <br /><br />
              {t.rich("description2", {
                green: (chunks) => <span className="text-terminal-green italic">{chunks}</span>,
                br: () => <br className="hidden lg:block" />
              })}
            </p>
          </div>
          
          {/* Hero Visual - Right column */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
              <AsciiAvatarCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
