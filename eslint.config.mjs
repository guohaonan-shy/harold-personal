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
    // Baseline for pre-existing components (DecryptedText, ProjectCard,
    // ThemeToggle, TypewriterTitle): these rules arrived with the ESLint 9 +
    // eslint-config-next 16 migration and flag long-standing code. Kept
    // visible as warnings; tighten back to errors once those are reworked.
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];

export default eslintConfig;
