import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "app/generated/**",
      "next-env.d.ts",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // scripts/** predates the ESLint 9 flat-config migration and is plain
    // Node CommonJS (postbuild sitemap generator) — not part of the
    // TypeScript/ESM app code the no-require-imports rule targets.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Baseline for pre-existing components (DecryptedText, ProjectCard,
    // ThemeToggle, TypewriterTitle): these rules arrived with the ESLint 9 +
    // eslint-config-next 16 migration and flag long-standing code. Scoped to
    // just these four files (not a repo-wide default) so new code is held to
    // "error"; tighten back to errors here too once those are reworked.
    files: [
      "app/components/DecryptedText.tsx",
      "app/components/ProjectCard.tsx",
      "app/components/ThemeToggle.tsx",
      "app/components/TypewriterTitle.tsx",
    ],
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];

export default eslintConfig;
