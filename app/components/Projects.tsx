"use client";

import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import TypewriterTitle from "./TypewriterTitle";

export default function Projects() {
  const t = useTranslations("projects");
  
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
            description={t("toeflair.description")}
            tags={["AI", "Education", "Web"]}
            filename="toeflair.exe"
            videoUrl="https://media.haroldguo.com/showcase_simplified_1080.mp4"
            videoUrl720p="https://media.haroldguo.com/showcase_simplified_720.mp4"
            link="https://toeflair.soloworks.io/"
          />
        </div>
      </div>
    </section>
  );
}
