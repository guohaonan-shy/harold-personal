"use client";

import { ChevronRight } from "lucide-react";
import TypewriterTitle from "./TypewriterTitle";

import { motion } from "framer-motion";

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
        <TypewriterTitle 
          path="~/upcoming"
          user="harold"
          command="--upcoming"
        />
        
        {/* Upcoming List */}
        <div className="font-mono text-base space-y-3">
          <p className="text-dim text-sm">total 42</p>
          {upcomingProjects.map((project, index) => (
            <motion.p 
              key={index} 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-main"
            >
              drwxr-xr-x  harold  {project.name.padEnd(24)} [{project.status}]
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
