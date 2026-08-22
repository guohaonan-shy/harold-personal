"use client";

import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, type Transition } from "framer-motion";
import AsciiAvatarCard, { type AvatarBootStage } from "./AsciiAvatarCard";
import DecryptedText from "./DecryptedText";
import { BOOT_COMMAND, useHeroBoot } from "./useHeroBoot";

export default function Hero() {
  const t = useTranslations("hero");
  const boot = useHeroBoot();
  const { active, passed, scale } = boot;

  const green = (chunks: ReactNode) => (
    <span className="text-terminal-green italic">{chunks}</span>
  );

  const lineTransition: Transition = {
    duration: 0.35 * scale,
    ease: "easeOut",
  };
  const hiddenLine = { opacity: 0, y: 14 };
  const shownLine = { opacity: 1, y: 0 };

  const cardStage: AvatarBootStage | undefined = active
    ? passed("cardBody")
      ? "content"
      : passed("cardChrome")
        ? "chrome"
        : "pending"
    : undefined;

  const descriptionBody = (
    <p className="text-xl text-dim leading-[1.6] max-w-[550px]">
      {t.rich("description", {
        name: (chunks) => <span className="text-main font-semibold">{chunks}</span>,
        green,
      })}
      <br />
      <br />
      {t.rich("description2", {
        green,
        br: () => <br className="hidden lg:block" />,
      })}
    </p>
  );

  return (
    <section className="min-h-[800px] bg-gradient-section border-t border-light flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-[80px] w-full">
        {/* Top Section: Badge and Big Title */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          {/* Terminal Badge:prompt 从 0ms 在场,命令逐字打出(全场唯一逐字打字) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-main/30 font-mono text-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <ChevronRight className="w-3 h-3 text-terminal-green" />
            <span className="text-terminal-cyan">~</span>
            <span className="text-main font-bold">harold</span>
            {active ? (
              <span className="relative text-dim whitespace-pre">
                {/* 全宽 ghost 预占位,徽章胶囊从 0ms 起不变宽 */}
                <span className="invisible">{BOOT_COMMAND}</span>
                <span className="absolute inset-0 text-left">
                  {BOOT_COMMAND.slice(0, boot.typed)}
                  {boot.typed < BOOT_COMMAND.length && (
                    <span
                      aria-hidden
                      className="inline-block w-[0.55em] h-[1.05em] align-text-bottom bg-terminal-green"
                    />
                  )}
                </span>
              </span>
            ) : (
              <span className="boot-cmd text-dim">{BOOT_COMMAND}</span>
            )}
          </div>

          {/* Big Heading - Spans across */}
          <div className="max-w-5xl mx-auto space-y-4 min-h-[120px] lg:min-h-[160px] flex flex-col justify-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-main leading-[1.1] tracking-tight">
              {active ? (
                <>
                  <span className="block">
                    <motion.span
                      className="inline-block"
                      initial={hiddenLine}
                      animate={passed("h1Line1") ? shownLine : hiddenLine}
                      transition={lineTransition}
                    >
                      {t.rich("titleLine1", { green })}
                    </motion.span>
                  </span>
                  <span className="block">
                    <span className="relative inline-block">
                      <motion.span
                        className="inline-block"
                        initial={hiddenLine}
                        animate={passed("h1Line2") ? shownLine : hiddenLine}
                        transition={lineTransition}
                      >
                        {t.rich("titleLine2", { green })}
                      </motion.span>
                      {/* 光标从徽章行交接过来,闪两次后交给副标题(在文字淡入层之外,不随行透明度变化) */}
                      {passed("h1Cursor") && !boot.done && (
                        <span
                          aria-hidden
                          className="boot-cursor-h1 absolute left-full ml-3 top-[0.12em] h-[0.8em] w-[0.5em] bg-terminal-green"
                          style={{ animationDuration: `${Math.round(210 * scale)}ms` }}
                        />
                      )}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block boot-hide">
                    {t.rich("titleLine1", { green })}
                  </span>
                  <span className="block boot-hide">
                    {t.rich("titleLine2", { green })}
                  </span>
                </>
              )}
            </h1>
            <div
              className={`text-xs font-mono text-dim opacity-40${active ? "" : " boot-hide"}`}
            >
              {active ? (
                <span className="relative inline-block">
                  {passed("subtitle") ? (
                    <DecryptedText
                      text={t("subtitle")}
                      speed={Math.max(16, Math.round(40 * scale))}
                      maxIterations={15}
                      animateOnMount
                    />
                  ) : (
                    <span className="opacity-0">{t("subtitle")}</span>
                  )}
                  {passed("subtitleCursor") && !boot.done && (
                    <span
                      aria-hidden
                      className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 h-[1.1em] w-[0.55em] bg-terminal-green animate-blink"
                    />
                  )}
                </span>
              ) : (
                <DecryptedText text={t("subtitle")} speed={40} maxIterations={15} />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Split Bio and Visual */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-[100px]">
          {/* Description - Left column */}
          {active ? (
            <motion.div
              className="flex-1"
              initial={{ opacity: 0 }}
              animate={passed("description") ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 * scale, ease: "easeOut" }}
            >
              {descriptionBody}
            </motion.div>
          ) : (
            <div className="flex-1 boot-hide">{descriptionBody}</div>
          )}

          {/* Hero Visual - Right column */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div
              className={`relative w-full max-w-[500px] transform lg:rotate-2 hover:rotate-0 transition-transform duration-700${active ? "" : " boot-hide"}`}
            >
              <AsciiAvatarCard bootStage={cardStage} bootScale={scale} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
