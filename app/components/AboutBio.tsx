"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function AboutBio() {
  const t = useTranslations("about");

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-xl border border-light bg-terminal shadow-lg shadow-black/5 dark:shadow-black/20 max-w-2xl"
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 h-10 px-4 border-b border-main">
            <div className="w-3 h-3 rounded-full bg-terminal-red" />
            <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
            <div className="w-3 h-3 rounded-full bg-terminal-green" />
            <span className="flex-1 text-center text-xs font-mono text-dim">~/harold/about</span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 font-mono text-sm space-y-4">
            <div className="text-terminal-green font-bold">{t("greeting")}</div>
            <p className="text-main leading-[1.8]">
              {t.rich("bio", {
                green: (chunks) => (
                  <span className="text-terminal-green font-semibold">{chunks}</span>
                ),
              })}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
