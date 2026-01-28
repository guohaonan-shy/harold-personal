"use client";

import { Twitter, Github, ExternalLink, Mail, Linkedin, Youtube, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import TypewriterTitle from "./TypewriterTitle";

interface SocialLink {
  icon: React.ReactNode;
  name: string;
  handle: string;
  href: string;
}

interface SocialProps {
  username: string;
  avatarUrl: string;
  profileUrl: string;
  totalCommits: number;
  totalPRs: number;
  contributionChartUrl: string;
}

const socialLinks: SocialLink[] = [
  {
    icon: <Twitter className="w-[18px] h-[18px] text-dim" />,
    name: "Twitter / X",
    handle: "@HaonanGuo330592",
    href: "https://twitter.com/HaonanGuo330592",
  },
  {
    icon: <Github className="w-[18px] h-[18px] text-dim" />,
    name: "GitHub",
    handle: "/guohaonan-shy",
    href: "https://github.com/guohaonan-shy",
  },
  {
    icon: <Linkedin className="w-[18px] h-[18px] text-dim" />,
    name: "LinkedIn",
    handle: "/harold-guo",
    href: "https://www.linkedin.com/in/harold-guo",
  },
  {
    icon: <Youtube className="w-[18px] h-[18px] text-dim" />,
    name: "YouTube",
    handle: "@HaroldGuo",
    href: "https://www.youtube.com/@HaroldGuo",
  },
  {
    icon: <ExternalLink className="w-[18px] h-[18px] text-dim" />,
    name: "Product Hunt",
    handle: "@haroldguo",
    href: "https://www.producthunt.com/@haroldguo",
  },
  {
    icon: <Mail className="w-[18px] h-[18px] text-dim" />,
    name: "Email",
    handle: "guohaonan980421@gmail.com",
    href: "mailto:guohaonan980421@gmail.com",
  },
];

export default function Social({ 
  username, 
  avatarUrl, 
  profileUrl, 
  totalCommits, 
  totalPRs, 
  contributionChartUrl 
}: SocialProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <TypewriterTitle 
          path="~/social"
          user="harold"
          command="show --all"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left: Social Links - Occupies 5 columns */}
          <div className="lg:col-span-5 space-y-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-mono text-base hover:opacity-80 transition-opacity animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {link.icon}
                <span className="text-main">{link.name}</span>
                <span className="text-dim">{link.handle}</span>
              </a>
            ))}
          </div>

          {/* Right: GitHub Activity Card - Occupies 7 columns and extends right */}
          <div 
            className="lg:col-span-7 lg:-mr-[60px] relative group animate-fadeIn" 
            style={{ 
              animationDelay: '400ms',
              perspective: '1000px'
            }}
          >
            <div className="absolute -inset-2 bg-terminal-green/5 rounded-xl blur-xl group-hover:bg-terminal-green/10 transition-colors" />
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transition: rotate.x === 0 ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
              }}
              className="relative p-6 rounded-xl border border-main bg-card shadow-sm h-full flex flex-col min-h-[200px] overflow-hidden will-change-transform"
            >
              <div className="flex items-center gap-4 mb-6">
                <a 
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-main/30 overflow-hidden bg-terminal shrink-0 hover:border-terminal-green/50 transition-colors"
                >
                  <Image 
                    src={avatarUrl} 
                    alt="GitHub Avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </a>
                <div className="flex flex-col">
                  <a 
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-main font-mono hover:text-terminal-green transition-colors"
                  >
                    {username}
                  </a>
                </div>
                <div className="flex items-start gap-8 ml-auto">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-dim/60 font-mono uppercase tracking-wider">Total Commits</span>
                    <span className="text-sm font-bold text-terminal-green font-mono">{totalCommits.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-dim/60 font-mono uppercase tracking-wider">PRs</span>
                    <span className="text-sm font-bold text-terminal-green font-mono">{totalPRs}</span>
                  </div>
                </div>
              </div>
              
              {/* GitHub Contributions Map - Cropped to show recent months */}
              <div className="w-full bg-transparent flex justify-end items-center flex-1 overflow-hidden border-t border-main/5 pt-4">
                <div className="w-[160%] flex-shrink-0 flex justify-end">
                  <img 
                    src={contributionChartUrl} 
                    alt="GitHub Contributions Chart"
                    className="h-[120px] w-auto dark:opacity-90 dark:hover:opacity-100 transition-opacity object-right object-cover dark:brightness-125 dark:contrast-125 brightness-95 contrast-110"
                  />
                </div>
              </div>

              {/* Tech Stack Tags - Now at the bottom */}
              <div className="mt-4 pt-4 border-t border-main/5 flex flex-wrap gap-2">
                {["TypeScript", "React", "Next.js", "Tailwind", "Python", "Golang", "Vibe Coding"].map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 py-0.5 rounded border border-main/30 bg-terminal/50 text-[9px] font-mono text-dim/80 hover:text-terminal-green hover:border-terminal-green/50 transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
