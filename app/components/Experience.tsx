"use client";

import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import TypewriterTitle from "./TypewriterTitle";

interface ExperienceItem {
  hash: string;
  company: string;
  logo?: string;
  icon?: "graduation";
  titleKey: string;
  periodStart: string;
  location: string;
  current?: boolean;
}

const experiences: ExperienceItem[] = [
  {
    hash: "1a2b3c4",
    company: "BUPT",
    icon: "graduation",
    titleKey: "bupt",
    periodStart: "2016.09",
    location: "Beijing",
  },
  {
    hash: "b9d0f34",
    company: "ByteDance",
    logo: "/logos/bytedance.svg",
    titleKey: "bytedance_edu",
    periodStart: "2020.10",
    location: "Beijing",
  },
  {
    hash: "e5c2a81",
    company: "ByteDance",
    logo: "/logos/bytedance.svg",
    titleKey: "bytedance_ecom",
    periodStart: "2021.10",
    location: "Shanghai",
  },
  {
    hash: "5d6e7f8",
    company: "NUS",
    icon: "graduation",
    titleKey: "nus",
    periodStart: "2023.09",
    location: "Singapore",
  },
  {
    hash: "7d1e4f9",
    company: "TikTok",
    logo: "/logos/tiktok.svg",
    titleKey: "tiktok",
    periodStart: "2024.05",
    location: "Singapore",
  },
  {
    hash: "a3f8b2c",
    company: "Plaud",
    logo: "/logos/plaud.svg",
    titleKey: "plaud",
    periodStart: "2025.07",
    location: "Beijing",
    current: true,
  },
];

export default function Experience() {
  const t = useTranslations("experience");

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        <TypewriterTitle
          path="~/career"
          user="harold"
          command="ls --graph"
        />

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block font-mono">
          {/* Row 1: Company + Role (above the line) */}
          <div className="grid grid-cols-6 mb-6">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center px-2 group animate-fadeIn"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {exp.icon ? (
                    <GraduationCap className="h-5 w-5 text-dim/70" />
                  ) : (
                    <img src={exp.logo} alt={exp.company} className="h-5 w-auto opacity-70 dark:invert" />
                  )}
                  <span className="text-main font-bold text-sm group-hover:text-terminal-green transition-colors">
                    {exp.company}
                  </span>
                </div>
                <span className="text-dim/70 text-xs mt-1">
                  {t(`${exp.titleKey}.role`)}
                </span>
              </div>
            ))}
          </div>

          {/* Row 2: Timeline with dashed lines between nodes */}
          <div className="relative h-10">
            <div className="grid grid-cols-6 w-full h-full relative">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center animate-fadeIn"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {/* Dashed line to next node */}
                  {index < experiences.length - 1 && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] border-t-2 border-dashed border-dim/30 z-0"
                      style={{ left: "50%", width: "100%" }}
                    />
                  )}

                  {/* Node */}
                  <div
                    className={`relative w-4 h-4 rounded-full z-10 ${
                      exp.current
                        ? "bg-terminal-green shadow-[0_0_12px_rgba(39,201,63,0.5)]"
                        : "border-2 border-black dark:border-white bg-page"
                    }`}
                  />

                  {/* HEAD tag */}
                  {exp.current && (
                    <div className="absolute -top-5 whitespace-nowrap">
                      <span className="text-terminal-green text-[10px] font-mono">
                        (HEAD → main)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Hash + Date + Location (below the line) */}
          <div className="grid grid-cols-6 mt-4">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center px-2 animate-fadeIn"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="text-terminal-yellow/70 text-[10px]">
                  {exp.hash}
                </span>
                <span className="text-dim/50 text-[11px] mt-1">
                  {exp.periodStart}
                </span>
                <span className="text-dim/40 text-[10px]">
                  {exp.location}
                </span>
              </div>
            ))}
          </div>

          {/* Row 4: Summary (below metadata) */}
          <div className="grid grid-cols-6 mt-4">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center px-3 animate-fadeIn"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <span className="text-dim/60 text-xs leading-relaxed">
                  {t(`${exp.titleKey}.summary`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden font-mono text-sm space-y-0">
          {[...experiences].reverse().map((exp, index) => (
            <div
              key={index}
              className="flex gap-4 group animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Vertical line + node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                    exp.current
                      ? "bg-terminal-green shadow-[0_0_8px_rgba(39,201,63,0.4)]"
                      : "bg-dim/30"
                  }`}
                />
                {index < experiences.length - 1 && (
                  <div className="w-px flex-1 min-h-[40px] bg-dim/15 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="pb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-terminal-yellow/70 text-[10px]">
                    {exp.hash}
                  </span>
                  {exp.current && (
                    <span className="text-terminal-green text-[10px]">
                      (HEAD → main)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {exp.icon ? (
                    <GraduationCap className="h-4 w-4 text-dim/70" />
                  ) : (
                    <img src={exp.logo} alt={exp.company} className="h-4 w-auto opacity-70 dark:invert" />
                  )}
                  <span className="text-main font-bold group-hover:text-terminal-green transition-colors">
                    {exp.company} · {t(`${exp.titleKey}.role`)}
                  </span>
                </div>
                <p className="text-dim/50 text-xs mt-0.5">
                  {exp.periodStart} · {exp.location}
                </p>
                <p className="text-dim/60 text-xs mt-1">
                  {t(`${exp.titleKey}.summary`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
