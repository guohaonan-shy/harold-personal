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
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-main leading-[1.1]">
                Couldn't get along with my boss, so I <span className="text-terminal-green italic">hired myself.</span>
              </h1>
              <p className="text-[10px] font-mono text-dim opacity-50">
                (Inspired by Marc Lou 🫡)
              </p>
            </div>
            
            {/* Description */}
            <p className="text-lg text-dim leading-[1.6] max-w-[500px]">
              Hi, I'm <span className="text-main font-semibold">Harold</span>. Full-stack developer by day, creator by night.
              <br /><br />
              Currently obsessed with making <span className="text-terminal-cyan font-medium">TOEFLAIR</span> better and helping people stay healthy with <span className="text-terminal-green font-medium">Mr.Steady</span>. I turn caffeine into AI tools and indie products.
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
