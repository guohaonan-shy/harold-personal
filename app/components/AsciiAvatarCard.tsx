"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { asciiAvatar, type AsciiVariant } from "../generated/ascii-avatar";

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

export default function AsciiAvatarCard() {
  const t = useTranslations("hero");
  const [showPhoto, setShowPhoto] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setShowPhoto((v) => !v)}
      aria-pressed={showPhoto}
      aria-label={t("avatarToggle")}
      className="block w-full cursor-pointer text-left"
    >
      <div className="rounded-2xl border border-main bg-terminal shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden transition-colors hover:border-light">
        {/* Terminal chrome header */}
        <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
          <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
          <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
          <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
          <span className="flex-1 text-center text-xs font-mono text-dim">
            {showPhoto ? "~/harold/avatar.jpg" : "~/harold/avatar.ascii"}
          </span>
        </div>

        {/* Body: pre-generated ASCII matrix by default, photo on toggle */}
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
      </div>
    </button>
  );
}
