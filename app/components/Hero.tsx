import { ChevronRight } from "lucide-react";
import Terminal from "./Terminal";

export default function Hero() {
  return (
    <section className="min-h-[800px] bg-gradient-section border-t border-light flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-[80px] w-full">
        {/* Top Section: Avatar, Badge and Big Title */}
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-main/20 overflow-hidden bg-terminal shadow-xl group">
            <img 
              src="/avatar.png" 
              alt="Harold" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-main/30 font-mono text-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <ChevronRight className="w-3 h-3 text-terminal-green" />
            <span className="text-terminal-cyan">~</span>
            <span className="text-main font-bold">harold</span>
            <span className="text-dim">init --workspace</span>
          </div>
          
          {/* Big Heading - Spans across */}
          <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold text-main leading-[1.05] tracking-tight">
              Couldn't get along with my boss, <br className="hidden lg:block" />
              so I <span className="text-terminal-green italic">hired myself.</span>
            </h1>
            <p className="text-xs font-mono text-dim opacity-40">
              (Inspired by Marc Lou 🫡)
            </p>
          </div>
        </div>

        {/* Bottom Section: Split Bio and Visual */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-[100px]">
          {/* Description - Left column */}
          <div className="flex-1">
            <p className="text-xl text-dim leading-[1.6] max-w-[550px]">
              Hi, I'm <span className="text-main font-semibold">Harold</span>. Full-stack developer by day, creator by night.
              <br /><br />
              Currently obsessed with making <span className="text-terminal-cyan font-medium">TOEFLAIR</span> better and helping people stay healthy with <span className="text-terminal-green font-medium">Mr.Steady</span>. I turn caffeine into AI tools and indie products.
            </p>
          </div>
          
          {/* Hero Visual - Right column */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
              <Terminal />
              {/* Decorative element */}
              <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-terminal-green/5 rounded-xl blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
