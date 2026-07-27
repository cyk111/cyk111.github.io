# Warm Magazine Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Astro Sphere from dark-tech aesthetic into a warm, magazine-style site with three auto-switching themes inspired by colly.com.

**Architecture:** CSS custom properties drive three warm-tone themes (Sunrise/Coffee/Amber). A SolidJS ThemeProvider handles auto-switching by time-of-day with localStorage manual override. Pages are rewritten with magazine-style multi-column layouts, serif headings, and minimal decoration.

**Tech Stack:** Astro 4 + SolidJS + Tailwind CSS 3 + MDX + TypeScript

## Global Constraints

- Three light warm themes: Sunrise (#D46A5C coral), Coffee (#C76B3E terracotta), Amber (#B4843E gold)
- Auto-switch: 06:00-12:00 Sunrise, 12:00-18:00 Coffee, 18:00-06:00 Amber
- Manual override persists to localStorage; selecting "Auto" clears override
- Fonts: Playfair Display (headings), Inter (body), JetBrains Mono (code) — all via Google Fonts
- No dark mode, no system theme following, no particle/star animations
- No FOUC: inline script in `<head>` reads theme class before first paint
- Layout: magazine-style, multi-column, text-dense, minimal cards

---

### Task 1: CSS Theme Variables

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: CSS custom properties `--color-bg`, `--color-text`, `--color-accent`, `--color-accent-soft`, `--color-code-bg`, `--color-border`, `--color-muted` set per theme class (`.theme-sunrise`, `.theme-coffee`, `.theme-amber`) on `<html>`

- [ ] **Step 1: Define CSS custom properties for all three themes**

Add to `src/styles/global.css` after `:root` block:

```css
/* --- Warm Theme System --- */

/* Default: Sunrise (日系朝霞) */
:root,
html.theme-sunrise {
  --color-bg: #F9F8F5;
  --color-text: #3B3734;
  --color-accent: #D46A5C;
  --color-accent-soft: #E8D4D1;
  --color-code-bg: #F1EEEA;
  --color-border: #E5E0DB;
  --color-muted: #8A8580;
}

/* Coffee (咖啡暖调) */
html.theme-coffee {
  --color-bg: #FAF7F2;
  --color-text: #3D3830;
  --color-accent: #C76B3E;
  --color-accent-soft: #F0E0D2;
  --color-code-bg: #F3EFE9;
  --color-border: #E8E0D6;
  --color-muted: #8A8278;
}

/* Amber (琥珀墨色) */
html.theme-amber {
  --color-bg: #FCFAF7;
  --color-text: #2C2826;
  --color-accent: #B4843E;
  --color-accent-soft: #EBE0CD;
  --color-code-bg: #F5F1EB;
  --color-border: #E5DED4;
  --color-muted: #8A8278;
}
```

- [ ] **Step 2: Update body/html styles to use CSS vars**

Replace the existing `html`, `html.dark`, `body`, `main`, `header` blocks with:

```css
html {
  overflow-y: scroll;
  background-color: var(--color-bg);
  font-family: "Atkinson", sans-serif;
}

html,
body {
  @apply h-full w-full antialiased;
  background-color: var(--color-bg);
  color: var(--color-text);
}

body {
  @apply relative flex flex-col;
}

main {
  @apply flex flex-col flex-1;
  background-color: var(--color-bg);
}

header {
  @apply border-b transition-all duration-300 ease-in-out;
  border-color: var(--color-border);
}

header:not(.scrolled) {
  @apply bg-transparent border-transparent;
}

header.scrolled {
  background-color: color-mix(in srgb, var(--color-bg) 75%, transparent);
  border-color: var(--color-border);
  @apply backdrop-blur-sm saturate-200;
}
```

- [ ] **Step 3: Replace hardcoded colors in other global styles**

Replace all remaining `dark:` variants and `bg-white`/`dark:bg-black` patterns in global.css with CSS var references. Key changes:

- `.animate` animation stays (scroll reveal), but remove opacity/transform startup styles from particles
- Remove `#twinkle-star`, `#meteors` styles entirely
- `article` prose: remove `dark:prose-invert`
- `.page-heading`: `color: var(--color-text)`
- All `border-black/10 dark:border-white/25` → `border-color: var(--color-border)`

- [ ] **Step 4: Remove unused styles**

Delete these entire blocks from global.css:
- `@keyframes animateParticle` (lines 83-91)
- `#twinkle-star.template` and `#twinkle-star.twinkle` (lines 116-124)
- `#meteors` all blocks (lines 131-159)
- Card transition comments at bottom

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 0 errors, site builds successfully

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add CSS custom properties for three warm themes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: FOUC Prevention + Theme Init Script

**Files:**
- Modify: `src/components/BaseHead.astro`
- Create: `public/js/theme-init.js`

**Interfaces:**
- Consumes: CSS vars defined in Task 1
- Produces: `<html>` has correct theme class before first paint, no flash of wrong theme

- [ ] **Step 1: Create inline theme init script**

Create `public/js/theme-init.js`:

```js
(function() {
  const THEME_KEY = 'warm-theme';
  const saved = localStorage.getItem(THEME_KEY);
  
  if (saved === 'sunrise' || saved === 'coffee' || saved === 'amber') {
    document.documentElement.className = 'theme-' + saved;
    return;
  }
  
  // Auto: time-based
  const hour = new Date().getHours();
  let theme;
  if (hour >= 6 && hour < 12) {
    theme = 'sunrise';
  } else if (hour >= 12 && hour < 18) {
    theme = 'coffee';
  } else {
    theme = 'amber';
  }
  document.documentElement.className = 'theme-' + theme;
})();
```

- [ ] **Step 2: Add to BaseHead.astro**

In `BaseHead.astro`, add before the `<meta charset>` line:

```astro
<script is:inline src="/js/theme-init.js"></script>
```

Remove the old `<script is:inline src="/js/theme.js"></script>` line.

- [ ] **Step 3: Verify no FOUC**

Run: `npm run dev`, open browser, hard refresh multiple times
Expected: No flash of wrong theme color

- [ ] **Step 4: Commit**

```bash
git add public/js/theme-init.js src/components/BaseHead.astro
git commit -m "feat: add FOUC-free theme init script

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: ThemeProvider + ThemeSwitcher (SolidJS)

**Files:**
- Create: `src/components/ThemeSwitcher.tsx`
- Modify: `src/components/Header.astro` (in Task 5)
- Modify: `src/components/Drawer.astro` (in Task 7)

**Interfaces:**
- Produces: `ThemeSwitcher` component with `client:load` directive
- Exposes: `getCurrentTheme(): string`, `setTheme(t: 'auto'|'sunrise'|'coffee'|'amber'): void`
- Persists to localStorage key `warm-theme`; value `null` means auto

- [ ] **Step 1: Write ThemeSwitcher component**

Create `src/components/ThemeSwitcher.tsx`:

```tsx
import { createSignal, onMount, createEffect } from "solid-js";

type Theme = "sunrise" | "coffee" | "amber";
type Mode = "auto" | Theme;

const THEME_KEY = "warm-theme";
const THEMES: { key: Theme; label: string; icon: string }[] = [
  { key: "sunrise", label: "朝霞", icon: "☀️" },
  { key: "coffee", label: "咖啡", icon: "☕" },
  { key: "amber", label: "琥珀", icon: "🌆" },
];

function getAutoTheme(): Theme {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "sunrise";
  if (hour >= 12 && hour < 18) return "coffee";
  return "amber";
}

export default function ThemeSwitcher() {
  const [mode, setMode] = createSignal<Mode>(
    (localStorage.getItem(THEME_KEY) as Mode) || "auto"
  );
  const [open, setOpen] = createSignal(false);

  const applyTheme = (m: Mode) => {
    const theme = m === "auto" ? getAutoTheme() : m;
    document.documentElement.className = `theme-${theme}`;
    if (m === "auto") {
      localStorage.removeItem(THEME_KEY);
    } else {
      localStorage.setItem(THEME_KEY, m);
    }
  };

  onMount(() => {
    applyTheme(mode());
  });

  createEffect(() => {
    const m = mode();
    applyTheme(m);
    setOpen(false);
  });

  const currentLabel = () => {
    if (mode() === "auto") return "自动";
    return THEMES.find((t) => t.key === mode())?.label || "";
  };

  return (
    <div class="relative">
      <button
        onClick={() => setOpen(!open())}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors duration-200 hover:opacity-75"
        style={{
          "border-color": "var(--color-border)",
          color: "var(--color-text)",
        }}
        aria-label="Switch theme"
      >
        <span>{currentLabel()}</span>
        <svg
          class="size-3.5 transition-transform"
          classList={{ "rotate-180": open() }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open() && (
        <div
          class="absolute right-0 top-full mt-2 rounded-lg border p-1.5 min-w-[140px] shadow-lg z-50"
          style={{
            "background-color": "var(--color-bg)",
            "border-color": "var(--color-border)",
          }}
        >
          <button
            onClick={() => setMode("auto")}
            class="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between"
            classList={{
              "font-semibold": mode() === "auto",
            }}
            style={{
              color: mode() === "auto" ? "var(--color-accent)" : "var(--color-text)",
            }}
          >
            自动切换
            {mode() === "auto" && <span>✓</span>}
          </button>
          <div
            class="my-1"
            style={{ "border-top": "1px solid var(--color-border)" }}
          />
          {THEMES.map((t) => (
            <button
              onClick={() => setMode(t.key)}
              class="w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between"
              classList={{
                "font-semibold": mode() === t.key,
              }}
              style={{
                color: mode() === t.key ? "var(--color-accent)" : "var(--color-text)",
              }}
            >
              <span>
                {t.icon} {t.label}
              </span>
              {mode() === t.key && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify component builds**

Run: `npm run build`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ThemeSwitcher.tsx
git commit -m "feat: add ThemeSwitcher component with auto/manual modes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Google Fonts + Typography

**Files:**
- Modify: `src/components/BaseHead.astro`
- Modify: `tailwind.config.mjs`

**Interfaces:**
- Produces: Playfair Display, Inter, JetBrains Mono available via Tailwind font classes
- Consumes: BaseHead.astro (adds font links)

- [ ] **Step 1: Add Google Fonts to BaseHead.astro**

Add before the `</head>` comment in BaseHead.astro:

```astro
<!-- Google Fonts: Playfair Display (headings), Inter (body), JetBrains Mono (code) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
```

Remove the old Atkinson font preload lines (3 lines with `/fonts/atkinson-*`).

- [ ] **Step 2: Update Tailwind font config**

In `tailwind.config.mjs`, replace fontFamily:

```js
fontFamily: {
  "sans": ["Inter", ...defaultTheme.fontFamily.sans],
  "serif": ["Playfair Display", ...defaultTheme.fontFamily.serif],
  "mono": ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
},
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors. Check that font URLs are in output HTML.

- [ ] **Step 4: Commit**

```bash
git add src/components/BaseHead.astro tailwind.config.mjs
git commit -m "feat: add Google Fonts (Playfair Display, Inter, JetBrains Mono)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Simplified Header with Theme Switcher

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: ThemeSwitcher component (Task 3)
- Produces: Cleaner nav bar with warm styling, theme switcher replaces dark mode toggle

- [ ] **Step 1: Rewrite Header.astro**

Replace entire file content:

```astro
---
import { SITE, LINKS } from "@consts";
import { cn } from "@lib/utils";
const { pathname } = Astro.url;
const subpath = pathname.match(/[^/]+/g);
import ThemeSwitcher from "@components/ThemeSwitcher";
---

<header id="header" class="fixed top-0 w-full h-16 z-50">
  <div class="mx-auto max-w-4xl px-5 h-full">
    <div class="relative h-full w-full flex items-center justify-between">

      <!-- Logo -->
      <a
        href="/"
        class="text-lg font-serif font-bold tracking-tight"
        style="color: var(--color-text)"
      >
        {SITE.TITLE}
      </a>

      <!-- Nav -->
      <nav class="hidden md:flex items-center gap-1">
        {LINKS.map((LINK) => {
          const isActive = pathname === LINK.HREF || "/" + subpath?.[0] === LINK.HREF;
          return (
            <a
              href={LINK.HREF}
              class={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors duration-200",
                isActive
                  ? "font-medium"
                  : "hover:opacity-75"
              )}
              style={{
                color: isActive ? "var(--color-accent)" : "var(--color-text)",
                backgroundColor: isActive ? "var(--color-accent-soft)" : "transparent",
              }}
            >
              {LINK.TEXT}
            </a>
          );
        })}
      </nav>

      <!-- Right side: Search + RSS + Theme -->
      <div class="flex items-center gap-1">
        <a
          href="/search"
          aria-label="Search"
          class="hidden md:flex size-8 rounded-full items-center justify-center transition-colors hover:opacity-75"
          style={{ color: "var(--color-text)" }}
        >
          <svg class="size-4">
            <use href="/ui.svg#search" />
          </svg>
        </a>

        <a
          href="/rss.xml"
          target="_blank"
          aria-label="RSS Feed"
          class="hidden md:flex size-8 rounded-full items-center justify-center transition-colors hover:opacity-75"
          style={{ color: "var(--color-text)" }}
        >
          <svg class="size-4">
            <use href="/ui.svg#rss" />
          </svg>
        </a>

        <div class="hidden md:block">
          <ThemeSwitcher client:load />
        </div>

        <!-- Mobile drawer button -->
        <button
          id="header-drawer-button"
          aria-label="Toggle menu"
          class="flex md:hidden size-8 rounded-full items-center justify-center transition-colors"
          style={{ color: "var(--color-text)" }}
        >
          <svg id="drawer-open" class="size-4">
            <use href="/ui.svg#menu" />
          </svg>
          <svg id="drawer-close" class="size-4">
            <use href="/ui.svg#x" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

<style>
  #header-drawer-button > #drawer-open {
    @apply block;
  }
  #header-drawer-button > #drawer-close {
    @apply hidden;
  }
  #header-drawer-button.open > #drawer-open {
    @apply hidden;
  }
  #header-drawer-button.open > #drawer-close {
    @apply block;
  }
</style>

<script is:inline>
  function toggleDrawer() {
    const drawer = document.getElementById("drawer");
    const drawerButton = document.getElementById("header-drawer-button");
    drawer?.classList.toggle("open");
    drawerButton?.classList.toggle("open");
  }
  function initializeDrawerButton() {
    const drawerButton = document.getElementById("header-drawer-button");
    drawerButton?.addEventListener("click", toggleDrawer);
  }
  document.addEventListener("astro:after-swap", initializeDrawerButton);
  initializeDrawerButton();
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors, header renders with theme switcher

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: redesign header with warm theme and ThemeSwitcher

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Simplified Footer

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Consumes: CSS vars from Task 1
- Produces: Clean, minimal footer

- [ ] **Step 1: Rewrite Footer.astro**

Replace entire file:

```astro
---
import { SITE } from "@consts";
---

<footer class="border-t py-8">
  <div class="mx-auto max-w-4xl px-5">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style="color: var(--color-muted)">
      <div>
        &copy; {new Date().getFullYear()} {SITE.TITLE}
      </div>
      <div class="flex gap-4">
        <a href="/legal/terms" class="hover:underline underline-offset-2">Terms</a>
        <a href="/legal/privacy" class="hover:underline underline-offset-2">Privacy</a>
        <a href="/rss.xml" class="hover:underline underline-offset-2">RSS</a>
      </div>
    </div>
  </div>
</footer>

<style>
  footer {
    background-color: var(--color-bg);
    border-color: var(--color-border);
  }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: simplify footer for warm magazine style

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Simplified Drawer with Theme Switcher

**Files:**
- Modify: `src/components/Drawer.astro`

**Interfaces:**
- Consumes: ThemeSwitcher (Task 3)
- Produces: Mobile drawer with theme switcher

- [ ] **Step 1: Rewrite Drawer.astro**

Replace entire file:

```astro
---
import { LINKS } from "@consts";
import { cn } from "@lib/utils";
import ThemeSwitcher from "@components/ThemeSwitcher";
const { pathname } = Astro.url;
const subpath = pathname.match(/[^/]+/g);
---

<div
  id="drawer"
  class="fixed inset-0 h-0 z-40 overflow-hidden flex flex-col items-center justify-center md:hidden transition-[height] duration-300 ease-in-out"
  style="background-color: var(--color-bg)"
>
  <nav class="flex flex-col items-center space-y-2">
    {LINKS.map((LINK) => {
      const isActive =
        pathname === LINK.HREF || "/" + subpath?.[0] === LINK.HREF;
      return (
        <a
          href={LINK.HREF}
          class={cn(
            "flex items-center justify-center px-4 py-2 rounded-full text-lg transition-colors",
            isActive ? "font-medium" : ""
          )}
          style={{
            color: isActive ? "var(--color-accent)" : "var(--color-text)",
            backgroundColor: isActive ? "var(--color-accent-soft)" : "transparent",
          }}
        >
          {LINK.TEXT}
        </a>
      );
    })}
  </nav>

  <div class="flex gap-2 mt-6 items-center">
    <a
      href="/search"
      aria-label="Search"
      class="size-9 rounded-full flex items-center justify-center transition-colors"
      style={{ color: "var(--color-text)" }}
    >
      <svg class="size-5">
        <use href="/ui.svg#search" />
      </svg>
    </a>
    <ThemeSwitcher client:load />
  </div>
</div>

<style>
  #drawer.open {
    @apply h-full;
  }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Drawer.astro
git commit -m "feat: simplify drawer with ThemeSwitcher for mobile

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Magazine Homepage

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: All prior tasks (theme vars, fonts, components)
- Produces: Colly-inspired two-column magazine homepage

- [ ] **Step 1: Rewrite index.astro**

Replace entire file:

```astro
---
import { getCollection } from "astro:content";
import PageLayout from "@layouts/PageLayout.astro";
import { SITE, SOCIALS } from "@consts";
import { formatDate } from "@lib/utils";

const posts = (await getCollection("blog"))
  .filter((post) => !post.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 6);

const projects = (await getCollection("projects"))
  .filter((project) => !project.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 4);
---

<PageLayout title="Home" description={SITE.DESCRIPTION}>
  <div class="mx-auto max-w-4xl px-5">

    <!-- Hero -->
    <section class="pt-36 pb-16 md:pt-44 md:pb-20">
      <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight animate" style="color: var(--color-text)">
        {SITE.TITLE}
      </h1>
      <p class="mt-4 text-lg md:text-xl animate" style="color: var(--color-muted)">
        Full-stack developer & AI builder
      </p>
      <div class="mt-6 h-px w-16" style="background-color: var(--color-accent)"></div>
      <p class="mt-6 max-w-xl leading-relaxed animate" style="color: var(--color-text)">
        {SITE.DESCRIPTION}
      </p>
    </section>

    <!-- Two-column grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 pb-24">

      <!-- Left: Latest Posts -->
      <section class="animate">
        <h2 class="font-serif text-xl font-semibold mb-6" style="color: var(--color-text)">
          Recent writing
        </h2>
        <ul class="space-y-5">
          {posts.map((post) => (
            <li>
              <a
                href={`/blog/${post.slug}`}
                class="group block"
              >
                <time
                  class="text-xs tracking-wide uppercase"
                  style="color: var(--color-muted)"
                >
                  {formatDate(post.data.date)}
                </time>
                <h3
                  class="mt-1 font-serif font-semibold leading-snug transition-colors group-hover:underline underline-offset-2 decoration-1"
                  style={{
                    color: "var(--color-text)",
                    "text-decoration-color": "var(--color-accent)",
                  }}
                >
                  {post.data.title}
                </h3>
                <p class="mt-1 text-sm leading-relaxed" style="color: var(--color-muted)">
                  {post.data.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
        <a
          href="/blog"
          class="inline-block mt-6 text-sm font-medium transition-colors hover:underline underline-offset-2"
          style={{ color: "var(--color-accent)" }}
        >
          All posts &rarr;
        </a>
      </section>

      <!-- Right: Featured Projects -->
      <section class="animate">
        <h2 class="font-serif text-xl font-semibold mb-6" style="color: var(--color-text)">
          Featured projects
        </h2>
        <ul class="space-y-5">
          {projects.map((project) => (
            <li>
              <a
                href={`/projects/${project.slug}`}
                class="group block"
              >
                <h3
                  class="font-serif font-semibold leading-snug transition-colors group-hover:underline underline-offset-2 decoration-1"
                  style={{
                    color: "var(--color-text)",
                    "text-decoration-color": "var(--color-accent)",
                  }}
                >
                  {project.data.title}
                </h3>
                <p class="mt-1 text-sm leading-relaxed" style="color: var(--color-muted)">
                  {project.data.description}
                </p>
                {project.data.tags && (
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    {project.data.tags.map((tag: string) => (
                      <span
                        class="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          "background-color": "var(--color-accent-soft)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="/projects"
          class="inline-block mt-6 text-sm font-medium transition-colors hover:underline underline-offset-2"
          style={{ color: "var(--color-accent)" }}
        >
          All projects &rarr;
        </a>
      </section>

    </div>

    <!-- Connect section -->
    <section class="pb-24 animate">
      <h2 class="font-serif text-xl font-semibold mb-4" style="color: var(--color-text)">
        Connect
      </h2>
      <div class="flex flex-wrap gap-3">
        {SOCIALS.map((social) => (
          <a
            href={social.HREF}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm px-4 py-2 rounded-full border transition-colors hover:opacity-75"
            style={{
              color: "var(--color-accent)",
              "border-color": "var(--color-accent)",
            }}
          >
            {social.NAME}
          </a>
        ))}
      </div>
    </section>
  </div>
</PageLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors, homepage renders magazine layout

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: redesign homepage with Colly-inspired magazine layout

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Clean Blog List Page

**Files:**
- Modify: `src/pages/blog/index.astro`

**Interfaces:**
- Consumes: CSS vars (Task 1), formatDate util
- Produces: Minimal, text-dense blog list

- [ ] **Step 1: Rewrite blog/index.astro**

Replace entire file:

```astro
---
import { getCollection } from "astro:content";
import PageLayout from "@layouts/PageLayout.astro";
import { BLOG } from "@consts";
import { formatDate } from "@lib/utils";

const posts = (await getCollection("blog"))
  .filter((post) => !post.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<PageLayout title={BLOG.TITLE} description={BLOG.DESCRIPTION}>
  <div class="mx-auto max-w-3xl px-5 pt-36 pb-24">
    <h1 class="font-serif text-4xl font-bold mb-2 animate" style="color: var(--color-text)">
      {BLOG.TITLE}
    </h1>
    <p class="mb-12 animate" style="color: var(--color-muted)">
      {BLOG.DESCRIPTION}
    </p>

    <ul class="space-y-10 animate">
      {posts.map((post) => (
        <li>
          <a href={`/blog/${post.slug}`} class="group block">
            <time
              class="text-xs tracking-wide uppercase"
              style="color: var(--color-muted)"
            >
              {formatDate(post.data.date)}
            </time>
            <h2
              class="mt-1 font-serif text-2xl font-semibold leading-snug group-hover:underline underline-offset-2 decoration-1"
              style={{
                color: "var(--color-text)",
                "text-decoration-color": "var(--color-accent)",
              }}
            >
              {post.data.title}
            </h2>
            <p class="mt-2 leading-relaxed" style="color: var(--color-muted)">
              {post.data.description}
            </p>
          </a>
        </li>
      ))}
    </ul>

    {posts.length === 0 && (
      <p class="text-center py-20" style="color: var(--color-muted)">
        No posts yet. Check back soon.
      </p>
    )}
  </div>
</PageLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Blog page renders clean list

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: redesign blog list with clean magazine style

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Clean Projects List Page

**Files:**
- Modify: `src/pages/projects/index.astro`

**Interfaces:**
- Consumes: CSS vars (Task 1)
- Produces: Minimal project list

- [ ] **Step 1: Rewrite projects/index.astro** *(blog list analogue)*

Replace entire file:

```astro
---
import { getCollection } from "astro:content";
import PageLayout from "@layouts/PageLayout.astro";
import { PROJECTS } from "@consts";

const projects = (await getCollection("projects"))
  .filter((project) => !project.data.draft)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
---

<PageLayout title={PROJECTS.TITLE} description={PROJECTS.DESCRIPTION}>
  <div class="mx-auto max-w-3xl px-5 pt-36 pb-24">
    <h1 class="font-serif text-4xl font-bold mb-2 animate" style="color: var(--color-text)">
      {PROJECTS.TITLE}
    </h1>
    <p class="mb-12 animate" style="color: var(--color-muted)">
      {PROJECTS.DESCRIPTION}
    </p>

    <ul class="space-y-10 animate">
      {projects.map((project) => (
        <li>
          <a href={`/projects/${project.slug}`} class="group block">
            <h2
              class="font-serif text-2xl font-semibold leading-snug group-hover:underline underline-offset-2 decoration-1"
              style={{
                color: "var(--color-text)",
                "text-decoration-color": "var(--color-accent)",
              }}
            >
              {project.data.title}
            </h2>
            <p class="mt-2 leading-relaxed" style="color: var(--color-muted)">
              {project.data.description}
            </p>
            {project.data.tags && (
              <div class="flex flex-wrap gap-1.5 mt-3">
                {project.data.tags.map((tag: string) => (
                  <span
                    class="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      "background-color": "var(--color-accent-soft)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </a>
        </li>
      ))}
    </ul>

    {projects.length === 0 && (
      <p class="text-center py-20" style="color: var(--color-muted)">
        No projects yet.
      </p>
    )}
  </div>
</PageLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects/index.astro
git commit -m "feat: redesign projects list with clean magazine style

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: Update Article Typography (Blog & Project Detail)

**Files:**
- Modify: `src/pages/blog/[...slug].astro`
- Modify: `src/pages/projects/[...slug].astro`

**Interfaces:**
- Consumes: CSS vars, serif heading fonts
- Produces: Improved reading experience on detail pages

- [ ] **Step 1: Update blog post detail**

Read the file first, then update the title to use `font-serif`:

In the `<article>` section, change the title heading to:
```astro
<h1 class="font-serif text-3xl md:text-4xl font-bold leading-tight" style="color: var(--color-text)">
  {post.data.title}
</h1>
```

Also add `style="color: var(--color-text)"` to the article wrapper and ensure `prose` class is present for markdown content rendering.

- [ ] **Step 2: Update project detail similarly**

Apply same pattern: serif title, CSS var colors.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Detail pages render with serif titles

- [ ] **Step 4: Commit**

```bash
git add src/pages/blog/[...slug].astro src/pages/projects/[...slug].astro
git commit -m "feat: apply magazine typography to article detail pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: Update consts.ts with Personal Info

**Files:**
- Modify: `src/consts.ts`

**Interfaces:**
- Consumes: None
- Produces: Correct site title, description, social links for cyk

- [ ] **Step 1: Update SITE, BLOG, PROJECTS descriptions**

```ts
export const SITE: Site = {
  TITLE: "cyk",
  DESCRIPTION: "I build things across the stack — from LLM-powered applications to polished frontends. This is where I share what I learn and what I make.",
  AUTHOR: "cyk",
}

export const BLOG: Page = {
  TITLE: "Writing",
  DESCRIPTION: "Notes on full-stack development, AI engineering, and the craft of building software.",
}

export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Things I've built — some shipped, some experiments, all learned from.",
}
```

- [ ] **Step 2: Update SOCIALS (keep placeholder links, user fills later)**

Change github href to `https://github.com/cyk111`, email placeholder, keep others for now.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Site builds with new info

- [ ] **Step 4: Commit**

```bash
git add src/consts.ts
git commit -m "feat: update site info with personal details

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 13: Remove Unused Components & Assets

**Files:**
- Delete: `src/components/MeteorShower.astro`
- Delete: `src/components/TwinklingStars.astro`
- Delete: `src/components/Counter.tsx`
- Delete: `public/js/bg.js`
- Delete: `public/js/theme.js`
- Modify: `src/components/BaseHead.astro` (remove old script refs)

**Interfaces:**
- None — pure cleanup

- [ ] **Step 1: Delete unused files**

```bash
rm src/components/MeteorShower.astro
rm src/components/TwinklingStars.astro
rm src/components/Counter.tsx
rm public/js/bg.js
rm public/js/theme.js
```

- [ ] **Step 2: Clean BaseHead.astro script refs**

Remove these lines:
```astro
<script is:inline src="/js/theme.js"></script>
```

(The old theme toggle script reference; we already replaced with theme-init.js)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: No errors from missing imports

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused dark-theme components and scripts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 14: Final Polish — global.css cleanup, Prose styles, PageLayout

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/PageLayout.astro`
- Modify: `src/layouts/TopLayout.astro`

**Interfaces:**
- Consumes: All prior tasks
- Produces: Coherent visual system across all pages

- [ ] **Step 1: Remove dark mode dependency from PageLayout.astro**

Change `<html lang="en">` to `<html lang="en">` (no dark class logic needed — theme-init.js handles it).

- [ ] **Step 2: Update prose/typography styles**

In global.css, update article prose:

```css
article {
  @apply prose max-w-full pb-12;
  color: var(--color-text);
}

article h1, article h2, article h3, article h4 {
  font-family: "Playfair Display", serif;
  color: var(--color-text);
}

article a {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-color: var(--color-accent-soft);
}

article code {
  font-family: "JetBrains Mono", monospace;
  background-color: var(--color-code-bg);
  border-radius: 4px;
  padding: 0.15em 0.3em;
  font-size: 0.9em;
}

article pre {
  background-color: var(--color-code-bg);
  border: 1px solid var(--color-border);
}

article pre code {
  background-color: transparent;
  padding: 0;
}

article blockquote {
  border-left-color: var(--color-accent);
  color: var(--color-muted);
}
```

- [ ] **Step 3: Update TopLayout.astro**

```astro
---
---

<div class="pt-36 pb-5">
  <div class="mx-auto max-w-4xl px-5">
    <slot />
  </div>
</div>
```

- [ ] **Step 4: Full build verification**

Run: `npm run build`
Expected: All 17+ pages build, warm theme applied everywhere, no visual bugs

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: final polish — prose styles, layout cleanup, warm theme complete

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 15: Deploy & Verify Live

**Files:**
- None (git push)

- [ ] **Step 1: Push all commits**

```bash
git push
```

- [ ] **Step 2: Wait for Actions deploy**

Check: `https://github.com/cyk111/cyk111.github.io/actions`
Expected: Green build on `gh-pages` branch deploy

- [ ] **Step 3: Verify live site**

Visit: `https://cyk111.github.io`
Expected:
- Warm background, no particles
- Serif heading "cyk"
- Two-column layout on desktop
- Theme switcher in nav bar
- Test theme switching (manual + localStorage)
- Test auto-switch (change system time or check logic)
- Mobile responsive
