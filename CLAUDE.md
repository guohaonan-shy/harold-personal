# harold-personal — Claude Code Reference

## Project Overview

Harold Guo's personal portfolio site. Modern Next.js static export with animations, i18n (EN/ZH), dark/light themes, and GitHub integration.

**Live site:** https://haroldguo.com

## Tech Stack

- **Framework:** Next.js (static export, `output: "export"`)
- **UI:** React 19 + TypeScript + Tailwind CSS v4
- **Animation:** Framer Motion + custom RAF/IntersectionObserver animations
- **i18n:** next-intl (EN default, ZH), fully client-side locale switching via `LocaleProvider` context
- **Theming:** next-themes with View Transitions API (dark/light)
- **Icons:** Lucide React
- **Fonts:** Inter (sans) + JetBrains Mono (mono) from Google Fonts

## Key Commands

```bash
npm run dev             # Start dev server
npm run generate:ascii  # Regenerate app/generated/ascii-avatar.ts from the source photo (runs automatically as prebuild)
npm run build           # prebuild (generate:ascii) → next build → postbuild (generates sitemap)
npm run lint            # ESLint (flat config, eslint.config.mjs — eslint-config-next 16 / ESLint 9)
npm test                # Unit tests (vitest run) — ASCII avatar generator (image → char matrix)
npm run test:e2e        # next build → E2E/browser tests (Puppeteer, vitest.e2e.config.mts) — Hero boot sequence, section entrance grammar, screenshot baselines
```

## Project Structure

```
app/
  page.tsx              # Home page (server component, composes all sections)
  layout.tsx            # Root layout: metadata, SEO, JSON-LD schema, font loading, Hero boot pre-hydration gate (inline script + watchdog)
  globals.css           # Tailwind v4 theme + custom CSS variables + animations
  lib/github.ts         # GitHub GraphQL API (6hr cache, avatar/commits/PRs)
  generated/
    ascii-avatar.ts     # Build-time generated (npm run generate:ascii) — dark/light ASCII char matrices for the avatar card; excluded from lint
  components/
    Hero.tsx            # Landing: boot-sequence orchestration (badge type-in → H1 → subtitle → description → avatar card), consumes useHeroBoot
    useHeroBoot.ts       # Hero boot cue-table timeline hook (rAF-driven; reduced-motion / mobile-scale aware)
    useSectionEntrance.ts # Shared section prompt-gated entrance hook (ssr/gated/entered phases) used by every non-Hero section
    AsciiAvatarCard.tsx # ASCII avatar card chrome; static (SSR/coarse-pointer/reduced-motion) tap-toggle vs. field (fine-pointer WebGL) hover-decrypt modes
    charfield/
      CharFieldCanvas.tsx # WebGL char-field canvas: dynamically imports engine.ts, falls back to the static ASCII card on import/WebGL failure
      engine.ts            # OGL-based char-field renderer (pointer disturbance, theme variants, settle animation)
    Projects.tsx        # Main projects showcase section
    ProjectCard.tsx     # Project card: video demo, terminal header, hover anim (boot-hide static branch vs. Framer-motion entrance branch)
    Upcoming.tsx        # Upcoming/in-progress projects list
    Social.tsx          # Social links + GitHub activity card (3D hover)
    Footer.tsx          # Copyright footer
    TypewriterTitle.tsx # Terminal prompt typewriter animation; also the section-entrance prompt-line component
    DecryptedText.tsx   # Character decryption reveal animation (animateOnMount for Hero subtitle)
    ThemeToggle.tsx     # Light/dark switcher (View Transitions API)
    LanguageToggle.tsx  # EN/ZH switcher (uses LocaleProvider context)
    LocaleProvider.tsx  # Client-side locale management (React context + cookie)
    Experience.tsx      # Work + education timeline (git graph style)
    OpenSource.tsx      # Open source projects section
i18n/
  config.ts             # Locales: ['en', 'zh'], defaultLocale: 'en'
  request.ts            # Server-side i18n config (not used for locale detection in static export)
messages/
  en.json               # English translations
  zh.json               # Chinese translations
public/
  avatar.png, favicon.svg, og-image.png
scripts/
  generate-sitemap.js   # Post-build sitemap generator (CommonJS; exempted from no-require-imports in eslint.config.mjs)
  ascii-avatar/          # Build-time ASCII generator: decode.mjs (PNG decode) + core.mjs (brightness→char mapping) + generate.mjs (CLI entry, writes app/generated/ascii-avatar.ts)
tests/
  ascii-avatar.test.mjs # Unit tests for scripts/ascii-avatar/core.mjs (npm test)
  fixtures/               # Fixed small test images for the unit tests
  e2e/                    # Puppeteer browser tests against the static export (npm run test:e2e)
    home.e2e.mjs          # Boot completeness, avatar decrypt, reduced-motion, mobile tier, section grammar, light theme, no-JS, chunk-blocked fail-open
    screenshots.e2e.mjs  # Hero screenshot baseline comparison (dark/light × desktop/mobile)
    baselines/             # Committed baseline PNGs (regenerate with E2E_UPDATE_SHOTS=1)
    lib/                    # Shared harness: browser/page setup, static file server, PNG diffing
eslint.config.mjs        # ESLint 9 flat config (eslint-config-next 16); scripts/**/*.js CJS override, warn-tier override scoped to 4 legacy files
vitest.e2e.config.mts    # E2E-only vitest config (separate from the default unit-test config)
```

## Content & Data

**All content is hardcoded — no CMS or separate data files.**

### Main Projects (Projects.tsx)
Each project is a hardcoded object with:
- `title`, `description`, `tags[]`
- `filename` (terminal header display)
- `link` (external URL)
- `videoUrl` (1080p), `videoUrl720p` (mobile)

**Current projects:**
- **TOEFLAIR** — AI TOEFL speaking tutor (https://toeflair.soloworks.io/)
  - Video: https://media.haroldguo.com/showcase_simplified_1080.mp4

### Upcoming Projects (Upcoming.tsx)
Array of `{ nameKey, statusKey, detailKey? }` objects referencing i18n keys.

**Status types:** `"inProgress"` | `"building"` | `"planned"`

**Current upcoming list:**
1. Study-Abroad-Agent — inProgress (researching)
2. Hypertension-Care-AI — building (UI completed)
3. bill-watcher — building (UI completed)
4. More-cool-things — planned

### Experience Timeline (Experience.tsx)
Horizontal git-graph style timeline (desktop) / vertical list (mobile). Includes both education and work history in chronological order. Education entries use Lucide `GraduationCap` icon; work entries use company logo SVGs from `public/logos/`.

**Current timeline:** BUPT (2016) → ByteDance Edu (2020) → ByteDance E-com (2021) → NUS (2023) → TikTok (2024) → Plaud (2025, HEAD)

### Open Source (OpenSource.tsx)
Open source project cards. Currently features Excalidrawer.

### Translations (messages/en.json + zh.json)
Project names, descriptions, status details, and all UI text live here.

## Design System

**Terminal color palette:**
- Green: `#27C93F` (primary accent)
- Cyan: `#48B0BD`
- Red: `#FF5F56`
- Yellow: `#FFBD2E`

**Backgrounds:**
- Light: `#FFFFFF`
- Dark: `#050505` → `#0F0F0F` gradient

**CSS utilities** (globals.css): `.bg-page`, `.text-main`, `.text-dim`, `.border-dim`, `.border-subtle`

**Max width:** `max-w-7xl` with `lg:px-[120px]` padding

## Personal Info (for SEO/schema)

- **Name:** Harold Guo
- **Roles:** AI Agent Engineer, Full-Stack Developer, Indie Hacker, Content Creator
- **Current:** Plaud
- **Education:** BUPT (B.Eng, Communication Engineering, 2016–2020), NUS (M.Comp, Computer Science, 2023–2024)
- **Skills:** AI/LLM, TypeScript, React, Next.js, Python, Golang
- **GitHub username:** guohaonan-shy

## Environment

`.env.local` required:
```
GITHUB_TOKEN=...
GITHUB_USERNAME=guohaonan-shy
```

## Adding a New Project

1. **Add project data** to `Projects.tsx` (new object in projects array)
2. **Add translations** to `messages/en.json` and `messages/zh.json`
3. **Upload video** to https://media.haroldguo.com/ (1080p + 720p variants)
4. **Update Upcoming.tsx** if removing from upcoming list

## Adding an Upcoming Project

1. Add entry to the array in `Upcoming.tsx`
2. Add corresponding `nameKey` and `detailKey` strings to both `messages/en.json` and `messages/zh.json`

## Notes

- Static export: no server-side rendering at runtime; GitHub data cached at build time
- Language switching is fully client-side: both message bundles are loaded, `LocaleProvider` manages locale via React context + cookie. This avoids `headers()` issues with static export.
- View Transitions API used for theme switches — Chrome/Edge only (graceful degradation)
- Video player has CRT scanline overlay effect
- Contribution chart fetched from `ghchart.rshah.org`
