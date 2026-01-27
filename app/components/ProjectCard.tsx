import { Play, ExternalLink, Sparkles } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  badge: string;
  filename: string;
  link?: string;
}

export default function ProjectCard({ title, description, badge, filename, link }: ProjectCardProps) {
  return (
    <div className="rounded-2xl border border-main bg-card overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-2 h-9 px-4 border-b border-main">
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
        <span className="ml-2 text-xs font-mono text-dim">{filename}</span>
      </div>
      
      {/* Visual Placeholder */}
      <div className="h-[500px] bg-page dark:bg-[#1A1A1A] flex flex-col items-center justify-center gap-3">
        <Play className="w-12 h-12 text-dim" />
        <span className="text-sm text-dim">Video Demo Placeholder</span>
      </div>
      
      {/* Info Section */}
      <div className="p-10 space-y-5 border-t border-main">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-page dark:bg-[#1A1A1A] border border-main font-mono text-xs">
          <Sparkles className="w-3 h-3 text-terminal-cyan" />
          <span className="text-dim">{badge}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-4xl font-mono font-bold text-main">{title}</h3>
        
        {/* Description */}
        <p className="text-base text-dim leading-[1.6]">{description}</p>
        
        {/* Link */}
        {link && (
          <a 
            href={link}
            className="inline-flex items-center gap-2 text-terminal-cyan hover:underline font-mono text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Project</span>
          </a>
        )}
      </div>
    </div>
  );
}
