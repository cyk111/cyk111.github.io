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
    (() => {
      try {
        return (localStorage.getItem(THEME_KEY) as Mode) || "auto";
      } catch {
        return "auto";
      }
    })()
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
