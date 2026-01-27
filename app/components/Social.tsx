"use client";

import { ChevronRight, Twitter, Github, ExternalLink, Mail } from "lucide-react";
import TypewriterTitle from "./TypewriterTitle";

import { motion } from "framer-motion";

interface SocialLink {
  icon: React.ReactNode;
  name: string;
  handle: string;
  href: string;
}

const socialLinks: SocialLink[] = [
  {
    icon: <Twitter className="w-[18px] h-[18px] text-dim" />,
    name: "Twitter / X",
    handle: "@harold_dev",
    href: "https://twitter.com/harold_dev",
  },
  {
    icon: <Github className="w-[18px] h-[18px] text-dim" />,
    name: "GitHub",
    handle: "/harold-personal",
    href: "https://github.com/harold-personal",
  },
  {
    icon: <ExternalLink className="w-[18px] h-[18px] text-dim" />,
    name: "Product Hunt",
    handle: "@harold",
    href: "https://producthunt.com/@harold",
  },
  {
    icon: <Mail className="w-[18px] h-[18px] text-dim" />,
    name: "Email",
    handle: "hello@harold.dev",
    href: "mailto:hello@harold.dev",
  },
];

export default function Social() {
  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Section Title */}
        <TypewriterTitle 
          path="~/social"
          user="harold"
          command="show --all"
        />
        
        {/* Social Links */}
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 font-mono text-base hover:opacity-80 transition-opacity"
            >
              {link.icon}
              <span className="text-main">{link.name}</span>
              <span className="text-dim">{link.handle}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
