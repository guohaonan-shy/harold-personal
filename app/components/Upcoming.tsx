import { ChevronRight } from "lucide-react";

interface UpcomingProject {
  name: string;
  status: string;
}

const upcomingProjects: UpcomingProject[] = [
  { name: "AI-Video-Editor", status: "in-progress" },
  { name: "Dev-Workflow-Automator", status: "planned" },
  { name: "More-cool-things", status: "building" },
];

export default function Upcoming() {
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-10 font-mono text-[32px]">
          <ChevronRight className="w-8 h-8 text-terminal-green" />
          <span className="text-terminal-cyan">~/upcoming</span>
          <span className="text-main font-bold">harold</span>
          <span className="text-main font-bold">--upcoming</span>
        </div>
        
        {/* Upcoming List */}
        <div className="font-mono text-base space-y-3">
          <p className="text-dim text-sm">total 42</p>
          {upcomingProjects.map((project, index) => (
            <p key={index} className="text-main">
              drwxr-xr-x  harold  {project.name.padEnd(24)} [{project.status}]
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
