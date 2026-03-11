"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES, getSavedTheme, applyTheme } from "@/lib/theme";
import type { ThemeId } from "@/lib/types";

const THEME_ICONS: Record<ThemeId, string> = {
  obsidian: "◆",
  ps1:      "◉",
  nintendo: "▲",
  xbox:     "✕",
};

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>("obsidian");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    setCurrent(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (id: ThemeId) => {
    applyTheme(id);
    setCurrent(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Changer de thème"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/6 transition-all border border-[var(--border)]"
        style={{ fontSize: 13 }}
      >
        {THEME_ICONS[current]}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl overflow-hidden"
          >
            <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Thème
            </p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: t.vars["--accent"] + "22",
                    color: t.vars["--accent"],
                    border: `1px solid ${t.vars["--accent"]}33`,
                  }}
                >
                  {THEME_ICONS[t.id]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)]">{t.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.description}</p>
                </div>
                {current === t.id && (
                  <svg width="14" height="14" className="shrink-0" style={{ color: t.vars["--accent"] }} fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <div className="px-3 py-2 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)]">Plus de thèmes bientôt</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
