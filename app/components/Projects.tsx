"use client";

import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import TypewriterTitle from "./TypewriterTitle";
import { useSectionEntrance } from "./useSectionEntrance";

export default function Projects() {
  const t = useTranslations("projects");
  const { entered, onPromptDone } = useSectionEntrance();

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="mx-auto px-8 lg:px-16 py-16" style={{ maxWidth: "1440px" }}>
        {/* Section Title */}
        <TypewriterTitle
          path="~/projects"
          user="harold"
          command="--list"
          onComplete={onPromptDone}
        />

        {/* Project Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
          <ProjectCard
            revealed={entered}
            title="TOEFLAIR"
            description={t("toeflair.description")}
            tags={["AI", "Education", "Web"]}
            filename="toeflair.exe"
            videoUrl="https://media.haroldguo.com/showcase_simplified_1080.mp4"
            videoUrl720p="https://media.haroldguo.com/showcase_simplified_720.mp4"
            link="https://toeflair.soloworks.io/"
          />
          <ProjectCard
            revealed={entered}
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
