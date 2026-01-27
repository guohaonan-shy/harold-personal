import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        terminal: {
          green: "#27C93F",
          cyan: "#48B0BD",
          red: "#FF5F56",
          yellow: "#FFBD2E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
