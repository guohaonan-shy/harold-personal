"use client";

import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import TypewriterTitle from "./TypewriterTitle";
import { useSectionEntrance } from "./useSectionEntrance";

export default function Projects() {
  const t = useTranslations("projects");
  const { entered, onPromptDone, motionReady } = useSectionEntrance();

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="mx-auto px-8 lg:px-16 py-16" style={{ maxWidth: "1600px" }}>
        {/* Section Title */}
        <TypewriterTitle
          path="~/projects"
          user="harold"
          command="--list"
          onComplete={onPromptDone}
        />

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          <ProjectCard
            revealed={entered}
            motionReady={motionReady}
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
            motionReady={motionReady}
            title="RedActFlow"
            description={t("redactflow.description")}
            tags={["AI", "PDF", "Productivity"]}
            filename="redactflow.exe"
            imageUrl="https://media.haroldguo.com/redactflow.png"
            link="https://redactflow-preview.up.railway.app/"
          />
          <ProjectCard
            revealed={entered}
            motionReady={motionReady}
            title="Excalidrawer"
            description={t("excalidrawer.description")}
            tags={["CLI", "MCP", "Dev Tool"]}
            filename="excalidrawer.exe"
            videoUrl="https://media.haroldguo.com/excalidrawer_1080.mp4"
            videoUrl720p="https://media.haroldguo.com/excalidrawer_720.mp4"
            link="https://github.com/guohaonan-shy/excalidrawer"
          />
        </div>
      </div>
    </section>
  );
}
