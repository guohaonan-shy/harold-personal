"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import TypewriterTitle from "./TypewriterTitle";

interface UpcomingProject {
  name: string;
  statusKey: "inProgress" | "planned" | "building";
}

const upcomingProjects: UpcomingProject[] = [
  { name: "Study-Abroad-Agent", statusKey: "inProgress" },
  { name: "Hypertension-Care-AI", statusKey: "building" },
  { name: "More-cool-things", statusKey: "planned" },
];

function StatusIcon({ status }: { status: string }) {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    if (status === 'planned') return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, [status]);

  if (status === 'planned') {
    return <span className="text-dim/30 mr-2">○</span>;
  }
  
  return (
    <span className="font-mono inline-block w-5 text-terminal-green mr-2">
      {frames[frame]}
    </span>
  );
}

const statusStyles = {
  inProgress: "text-terminal-green",
  building: "text-amber-500/80",
  planned: "text-dim/40",
};

export default function Upcoming() {
  const t = useTranslations("upcoming");
  
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <TypewriterTitle 
          path="~/crafts"
          user="harold"
          command="ls --future"
        />
        
        {/* Upcoming List */}
        <div className="font-mono text-base space-y-4">
          <p className="text-dim text-sm mb-6">{t("total")}</p>
          {upcomingProjects.map((project, index) => (
            <div 
              key={index}
              className="flex items-center group animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center flex-1">
                <span className="text-dim/30 mr-4 hidden sm:inline">drwxr-xr-x</span>
                <span className="text-dim/40 mr-4 hidden sm:inline">harold</span>
                
                {/* Project Name */}
                <span className="text-main font-bold group-hover:text-terminal-green transition-colors">
                  {project.name}
                </span>
              </div>

              {/* Status with Spinner */}
              <div className={`flex items-center min-w-[140px] justify-end ${statusStyles[project.statusKey]}`}>
                <StatusIcon status={project.statusKey} />
                <span className="text-xs uppercase tracking-widest font-bold">
                  {t(project.statusKey).replace('[', '').replace(']', '')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
