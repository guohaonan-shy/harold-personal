"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

const tabs = [
  { label: "~/work", href: "/" },
  { label: "~/about", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-page/80 backdrop-blur-md border-b border-dim">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] h-14 flex items-center justify-between">
        <div className="flex items-center gap-6 font-mono text-sm">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`transition-colors duration-200 ${
                  isActive
                    ? "text-terminal-green font-bold"
                    : "text-dim hover:text-main"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
