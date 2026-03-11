import type { ThemeId } from "./types";

export const THEMES: {
  id: ThemeId;
  label: string;
  description: string;
  vars: Record<string, string>;
}[] = [
  {
    id: "obsidian",
    label: "Obsidian",
    description: "Sombre · Ambre",
    vars: {
      "--bg-base": "#0f1117",
      "--bg-card": "#1a1d25",
      "--bg-header": "rgba(15,17,23,0.92)",
      "--accent": "#f59e0b",
      "--accent-hover": "#fbbf24",
      "--accent-text": "#000",
      "--text-primary": "#f8fafc",
      "--text-muted": "#64748b",
      "--border": "rgba(255,255,255,0.08)",
    },
  },
  {
    id: "ps1",
    label: "PS1",
    description: "Rétro · CRT",
    vars: {
      "--bg-base": "#050507",
      "--bg-card": "#0d0d14",
      "--bg-header": "rgba(5,5,7,0.95)",
      "--accent": "#00e5ff",
      "--accent-hover": "#4df0ff",
      "--accent-text": "#000",
      "--text-primary": "#e0f7fa",
      "--text-muted": "#546e7a",
      "--border": "rgba(0,229,255,0.12)",
    },
  },
  {
    id: "nintendo",
    label: "Nintendo",
    description: "Coloré · Fun",
    vars: {
      "--bg-base": "#0e0e10",
      "--bg-card": "#18181b",
      "--bg-header": "rgba(14,14,16,0.92)",
      "--accent": "#e4000f",
      "--accent-hover": "#ff1a27",
      "--accent-text": "#fff",
      "--text-primary": "#fafafa",
      "--text-muted": "#71717a",
      "--border": "rgba(255,255,255,0.09)",
    },
  },
  {
    id: "xbox",
    label: "Xbox",
    description: "Vert · Dark",
    vars: {
      "--bg-base": "#0a0d0a",
      "--bg-card": "#111811",
      "--bg-header": "rgba(10,13,10,0.93)",
      "--accent": "#52b043",
      "--accent-hover": "#6dc75d",
      "--accent-text": "#000",
      "--text-primary": "#f0faf0",
      "--text-muted": "#4a6349",
      "--border": "rgba(82,176,67,0.12)",
    },
  },
];

const STORAGE_KEY = "vault_theme";

export function getSavedTheme(): ThemeId {
  if (typeof window === "undefined") return "obsidian";
  return (localStorage.getItem(STORAGE_KEY) as ThemeId) ?? "obsidian";
}

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(theme.vars)) {
    root.style.setProperty(key, val);
  }
  localStorage.setItem(STORAGE_KEY, id);
}
