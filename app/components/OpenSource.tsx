"use client";

import { useTranslations } from "next-intl";
import { Github, Star, ExternalLink } from "lucide-react";
import TypewriterTitle from "./TypewriterTitle";

interface OpenSourceProject {
  name: string;
  descKey: string;
  repo: string;
  link: string;
  language: string;
  languageColor: string;
  stars: number;
  tags: string[];
}

const projects: OpenSourceProject[] = [
  {
    name: "excalidrawer",
    descKey: "excalidrawer",
    repo: "guohaonan-shy/excalidrawer",
    link: "https://github.com/guohaonan-shy/excalidrawer",
    language: "JavaScript",
    languageColor: "#f1e05a",
    stars: 3,
    tags: ["CLI", "Diagrams", "AI Agents"],
  },
];

export default function OpenSource() {
  const t = useTranslations("openSource");

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        <TypewriterTitle
          path="~/repos"
          user="harold"
          command="ls --starred"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 rounded-xl border border-main bg-card hover:border-terminal-green/40 transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <Github className="w-5 h-5 text-dim group-hover:text-terminal-green transition-colors" />
                <span className="font-mono text-main font-bold group-hover:text-terminal-green transition-colors">
                  {project.name}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-dim/40 group-hover:text-terminal-green/60 transition-colors ml-auto" />
              </div>

              {/* Description */}
              <p className="text-dim text-sm leading-relaxed mb-4">
                {t(`${project.descKey}.description`)}
              </p>

              {/* Footer: Language + Stars + Tags */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.languageColor }}
                  />
                  <span className="text-dim text-xs font-mono">
                    {project.language}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-dim/60" />
                  <span className="text-dim text-xs font-mono">
                    {project.stars}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded border border-main/30 bg-terminal/50 text-[9px] font-mono text-dim/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
