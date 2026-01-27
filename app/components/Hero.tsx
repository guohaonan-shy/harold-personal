import { ChevronRight } from "lucide-react";
import Terminal from "./Terminal";

export default function Hero() {
  return (
    <section className="min-h-[700px] bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-[60px]">
        <div className="flex flex-col lg:flex-row items-center gap-[60px]">
          {/* Hero Text */}
          <div className="flex-1 space-y-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-main overflow-hidden bg-terminal">
              <img 
                src="/avatar.png" 
                alt="Harold" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Terminal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-card border border-main font-mono text-xs">
              <ChevronRight className="w-3 h-3 text-terminal-green" />
              <span className="text-terminal-cyan">~</span>
              <span className="text-main font-bold">harold</span>
              <span className="text-main">init --workspace</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-bold text-main leading-[1.1]">
              Hi, I'm Harold.
            </h1>
            
            {/* Description */}
            <p className="text-lg text-dim leading-[1.6] max-w-[500px]">
              I'm an indie hacker and full-stack developer based in the cloud.
              <br /><br />
              I build software that empowers other developers. My philosophy is simple: ship small, iterate fast, and keep it fun. Currently building IndieKit and exploring the future of AI tools.
            </p>
          </div>
          
          {/* Hero Visual - Terminal */}
          <div className="flex-1 flex items-center justify-center py-10">
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  );
}
