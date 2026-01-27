import { ChevronRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import TypewriterTitle from "./TypewriterTitle";

export default function Projects() {
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <TypewriterTitle 
          path="~/projects"
          user="harold"
          command="--list"
        />
        
        {/* Project Cards */}
        <div className="space-y-8">
          <ProjectCard
            title="TOEFLAIR"
            description="Your AI-powered TOEFL speaking tutor. Practice anytime, anywhere with real-time feedback and scoring based on official rubrics."
            tags={["AI", "Education", "Web"]}
            filename="toeflair.exe"
            link="#"
          />
        </div>
      </div>
    </section>
  );
}
