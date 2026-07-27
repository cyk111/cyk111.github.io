# Design Spec: Warm Magazine-Style Theme for Astro Sphere

## Date
2026-07-27

## Overview
Transform the Astro Sphere template from its default dark-tech aesthetic into a warm, magazine-style personal website inspired by colly.com. The site serves as both a knowledge blog and a project portfolio for a full-stack + AI developer.

---

## 1. Theme System

### 1.1 Three Themes

| Theme | Key Colors | Vibe |
|---|---|---|
| Sunrise (日系朝霞) | Coral `#D46A5C` + Sage `#C5D1CB` | Morning energy |
| Coffee (咖啡暖调) | Terracotta `#C76B3E` + Apricot `#E8CFB8` | Afternoon warmth |
| Amber (琥珀墨色) | Gold `#B4843E` + Kraft `#D4C5B2` | Evening depth |

All themes share: warm white background, dark brown text, warm gray code blocks.

### 1.2 Switching Logic

- **Auto (default)**: 06:00–12:00 Sunrise, 12:00–18:00 Coffee, 18:00–06:00 Amber
- **Manual**: Three-button selector, choice persisted to `localStorage`
- Manual selection overrides auto until "Auto" is re-selected

### 1.3 Implementation

- CSS custom properties (`--color-*`) on `<html>` element, swapped by theme class
- A SolidJS `ThemeProvider` component handles time check + localStorage + class toggle
- Tailwind config references CSS custom properties for dynamic theming

---

## 2. Typography

| Role | Font | Loading |
|---|---|---|
| Headings | Playfair Display (serif) | Google Fonts, subset Latin |
| Body | Inter (sans-serif) | Google Fonts, subset Latin |
| Code | JetBrains Mono | Google Fonts, subset Latin |

Weight scale: headings 600-700, body 400, code 400.

---

## 3. Layout Changes

### 3.1 Homepage (`src/pages/index.astro`)

Replace full-page stacked sections with:

```
- Top nav (light, inline links)
- Hero: large Playfair heading + one-line subtitle + 2-3 sentence intro
- Divider
- Two-column grid: Latest Posts (left) + Featured Projects (right)
- Footer: social links + theme switcher
```

No particles, no full-bleed images, no large portrait photo.

### 3.2 Blog (`src/pages/blog/`)

- List view: date + title + one-line excerpt, no card shadows
- Post detail: centered max-width ~680px, large Playfair title, comfortable line-height
- Code blocks: JetBrains Mono, warm gray background

### 3.3 Projects (`src/pages/projects/`)

- Clean list with project name + tech stack tags + short description
- Detail page: description + live link + GitHub link

### 3.4 Navigation

- Top bar: Name/Logo left, links (Blog / Projects / About) right
- Theme toggle as a small icon/menu in the nav
- No hamburger on desktop; minimal hamburger on mobile

---

## 4. Components to Modify

| Component | Action |
|---|---|
| `BaseHead.astro` | Add Playfair Display, Inter, JetBrains Mono fonts |
| `Header.astro` | Simplify: inline links, add theme selector |
| `Footer.astro` | Slim down, move theme switcher here too |
| `Container.astro` | Reduce max-width, adjust padding |
| `index.astro` | Complete rewrite: magazine layout |
| `blog/index.astro` | Simplify card → list style |
| `blog/[...slug].astro` | Adjust article typography |
| `projects/index.astro` | Simplify layout |
| `global.css` | Replace all color tokens with theme CSS vars |

### New Components

| Component | Purpose |
|---|---|
| `ThemeProvider.tsx` | SolidJS context for theme state |
| `ThemeSwitcher.tsx` | UI for theme selection (Auto / Sunrise / Coffee / Amber) |
| `Divider.astro` | Styled horizontal rule |

---

## 5. Components to Remove / Deprecate

| Component | Reason |
|---|---|
| `MeteorShower.astro` | Dark-tech aesthetic, not magazine style |
| `TwinklingStars.astro` | Same reason |
| `Search.tsx` / `SearchBar.tsx` / `SearchCollection.tsx` | Keep but restyle lighter |
| `Counter.tsx` | Not needed for personal site |
| `ArrowCard.tsx` | Replace with simpler list items |

---

## 6. Content Changes

- `src/consts.ts`: Update SITE (name, description), SOCIALS (personal links)
- `src/content/blog/`: Replace 6 demo posts with user's content
- `src/content/projects/`: Replace 4 demo projects with user's projects
- `src/content/work/`: Remove or repurpose demo work entries

---

## 7. Technical Notes

- **No design system rebuild**: Work within Astro Sphere's existing structure (SolidJS + Tailwind + MDX)
- **Theme performance**: CSS custom properties swap is instant, no FOUC. Inline script in `<head>` reads localStorage before paint
- **Search**: Retain fuse.js-based search but restyle to match warm theme
- **Accessibility**: Keep Atkinson Hyperlegible as fallback; ensure color contrast ratios ≥ 4.5:1

---

## 8. Out of Scope

- Dark mode (all three themes are light/warm)
- System theme following (per user decision)
- User accounts or dynamic content
- CMS integration
