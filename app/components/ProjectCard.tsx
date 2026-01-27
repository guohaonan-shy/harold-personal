"use client";

import { Play, ExternalLink, Sparkles } from "lucide-react";

import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  filename: string;
  link?: string;
}

export default function ProjectCard({ title, description, tags, filename, link }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-2xl border border-main bg-card overflow-hidden"
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
        <span className="text-sm text-dim">Video Demo Placeholder</span>
      </div>
      
      {/* Info Section */}
      <div className="p-10 space-y-5 border-t border-main">
        {/* Tags */}
        <div className="flex items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded bg-page dark:bg-[#1A1A1A] border border-main text-xs font-bold text-dim"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Title */}
        <h3 className="text-4xl font-mono font-bold text-main">{title}</h3>
        
        {/* Description */}
        <p className="text-base text-dim leading-[1.6]">{description}</p>
        
      {/* Link */}
      {link && (
        <motion.a 
          href={link}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 text-main hover:underline font-bold text-sm"
        >
          <span>Visit Project</span>
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      )}
      </div>
    </motion.div>
  );
}
