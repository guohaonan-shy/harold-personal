import { ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-10 font-mono text-[32px]">
          <ChevronRight className="w-8 h-8 text-terminal-green" />
          <span className="text-terminal-cyan">projects</span>
          <span className="text-main font-bold">harold</span>
          <span className="text-main font-bold">--list</span>
        </div>
        
        {/* Project Cards */}
        <div className="space-y-8">
          <ProjectCard
            title="TOEFLAIR"
            description="Your AI-powered TOEFL speaking tutor. Practice anytime, anywhere with real-time feedback and scoring based on official rubrics."
            badge="AI / Education"
            filename="toeflair.exe"
            link="#"
          />
        </div>
      </div>
    </section>
  );
}
