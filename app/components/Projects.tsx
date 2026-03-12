"use client";

import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import TypewriterTitle from "./TypewriterTitle";

export default function Projects() {
  const t = useTranslations("projects");
  
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="mx-auto px-8 lg:px-16 py-16" style={{ maxWidth: "1440px" }}>
        {/* Section Title */}
        <TypewriterTitle 
          path="~/projects"
          user="harold"
          command="--list"
        />
        
        {/* Project Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
          <ProjectCard
            title="TOEFLAIR"
            description={t("toeflair.description")}
            tags={["AI", "Education", "Web"]}
            filename="toeflair.exe"
            videoUrl="https://media.haroldguo.com/showcase_simplified_1080.mp4"
            videoUrl720p="https://media.haroldguo.com/showcase_simplified_720.mp4"
            link="https://toeflair.soloworks.io/"
          />
          <ProjectCard
            title="RedActFlow"
            description={t("redactflow.description")}
            tags={["AI", "PDF", "Productivity", "Open Beta"]}
            filename="redactflow.exe"
            imageUrl="https://media.haroldguo.com/redactflow.png"
            link="https://redactflow-preview.up.railway.app/"
          />
        </div>
      </div>
    </section>
  );
}
