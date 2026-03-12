# harold-personal — Claude Code Reference

## Project Overview

Harold Guo's personal portfolio site. Modern Next.js static export with animations, i18n (EN/ZH), dark/light themes, and GitHub integration.

**Live site:** https://haroldguo.com

## Tech Stack

- **Framework:** Next.js (static export, `output: "export"`)
- **UI:** React 19 + TypeScript + Tailwind CSS v4
- **Animation:** Framer Motion + custom RAF/IntersectionObserver animations
- **i18n:** next-intl (EN default, ZH), cookie-based locale persistence
- **Theming:** next-themes with View Transitions API (dark/light)
- **Icons:** Lucide React
- **Fonts:** Inter (sans) + JetBrains Mono (mono) from Google Fonts

## Key Commands

```bash
npm run dev        # Start dev server
npm run build      # Build + postbuild (generates sitemap)
npm run lint       # ESLint
```

## Project Structure

```
app/
  page.tsx              # Home page (server component, composes all sections)
  layout.tsx            # Root layout: metadata, SEO, JSON-LD schema, font loading
  globals.css           # Tailwind v4 theme + custom CSS variables + animations
  lib/github.ts         # GitHub GraphQL API (6hr cache, avatar/commits/PRs)
  components/
    Hero.tsx            # Landing: avatar, terminal badge, bio, DecryptedText
    Projects.tsx        # Main projects showcase section
    ProjectCard.tsx     # Project card: video demo, terminal header, hover anim
    Upcoming.tsx        # Upcoming/in-progress projects list
    Social.tsx          # Social links + GitHub activity card (3D hover)
    Footer.tsx          # Copyright footer
    Terminal.tsx        # Decorative terminal widget (active projects status)
    TypewriterTitle.tsx # Terminal prompt typewriter animation
    DecryptedText.tsx   # Character decryption reveal animation
    ThemeToggle.tsx     # Light/dark switcher (View Transitions API)
    LanguageToggle.tsx  # EN/ZH switcher (View Transitions API + cookie)
i18n/
  config.ts             # Locales: ['en', 'zh'], defaultLocale: 'en'
  request.ts            # Server-side i18n, cookie detection
messages/
  en.json               # English translations
  zh.json               # Chinese translations
public/
  avatar.png, favicon.svg, og-image.png
scripts/
  generate-sitemap.js   # Post-build sitemap generator
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
- **Education:** National University of Singapore
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
- View Transitions API used for theme/language switches — Chrome/Edge only (graceful degradation)
- Video player has CRT scanline overlay effect
- Contribution chart fetched from `ghchart.rshah.org`
