"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  filename: string;
  link?: string;
}

export default function ProjectCard({ title, description, tags, filename, link }: ProjectCardProps) {
  const t = useTranslations("projects");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl border border-main bg-card overflow-hidden transition-all duration-300 hover:border-main/60"
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 h-9 px-4 border-b border-main">
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
        <span className="ml-2 text-xs font-mono text-dim">~/projects/{filename}</span>
      </div>
      
      {/* Visual Placeholder */}
      <div className="h-[500px] bg-page dark:bg-[#1A1A1A] flex flex-col items-center justify-center gap-3">
        <Play className="w-12 h-12 text-dim" />
        <span className="text-sm text-dim">{t("videoPlaceholder")}</span>
      </div>
      
      {/* Info Section */}
      <div className="p-10 border-t border-main relative">
        <AnimatePresence>
          {link && isHovered && (
            <motion.a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-10 right-10 flex items-center gap-2 text-main font-mono text-xs font-bold bg-main/5 hover:bg-main/10 border border-main/20 hover:border-main/40 px-4 py-2 rounded-full transition-colors duration-200"
            >
              <span>{t("visitProject")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.a>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          {/* Header Row: Title + Tags */}
          <div className="flex items-center gap-4 pr-40">
            {/* Title */}
            <h3 className="text-4xl font-mono font-bold text-main leading-none tracking-tight">{title}</h3>
            
            {/* Tags */}
            <div className="flex items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-md bg-main/5 border border-main/20 text-xs font-bold text-main/80 uppercase tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-base text-dim leading-[1.6] w-full">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
