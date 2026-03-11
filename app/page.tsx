"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameCard from "@/components/GameCard";
import AddGameModal from "@/components/AddGameModal";
import ThemePicker from "@/components/ThemePicker";
import { getLibrary } from "@/lib/storage";
import type { UserGame, GameStatus } from "@/lib/types";

const STATUS_FILTERS: { value: GameStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "playing", label: "En cours" },
  { value: "finished", label: "Terminés" },
  { value: "100%", label: "100%" },
  { value: "backlog", label: "Backlog" },
  { value: "abandoned", label: "Abandonnés" },
];

export default function Home() {
  const [library, setLibrary] = useState<UserGame[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<GameStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLibrary(getLibrary());
  }, []);

  const reload = () => setLibrary(getLibrary());

  const filtered = useMemo(() => {
    return library.filter((g) => {
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [library, statusFilter, search]);

  const stats = useMemo(() => ({
    total: library.length,
    playing: library.filter((g) => g.status === "playing").length,
    finished: library.filter((g) => g.status === "finished" || g.status === "100%").length,
    backlog: library.filter((g) => g.status === "backlog").length,
  }), [library]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent-text)" }}>
                <path fill="currentColor" fillRule="evenodd" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0v14h14V5H5zm3 3h8v2H8V8zm0 4h5v2H8v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-widest" style={{ fontFamily: "var(--font-space)", color: "var(--text-primary)" }}>
              VAULT
            </span>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
            <span><strong className="tabular-nums" style={{ color: "var(--text-primary)" }}>{stats.total}</strong> jeux</span>
            <span className="w-px h-3 bg-white/10" />
            <span><strong className="tabular-nums" style={{ color: "var(--accent)" }}>{stats.playing}</strong> en cours</span>
            <span className="w-px h-3 bg-white/10" />
            <span><strong className="tabular-nums text-emerald-400">{stats.finished}</strong> terminés</span>
            <span className="w-px h-3 bg-white/10" />
            <span><strong className="tabular-nums" style={{ color: "var(--text-muted)" }}>{stats.backlog}</strong> backlog</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemePicker />
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M12 5v14M5 12h14" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-[61px] z-20 backdrop-blur-md border-b" style={{ background: "var(--bg-header)", borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4 overflow-x-auto">
          {/* Search */}
          <div className="relative shrink-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer…"
              className="rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none w-36 transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* Status filters */}
          <div className="flex items-center gap-1.5 shrink-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                style={statusFilter === f.value ? {
                  background: "var(--accent)",
                  color: "var(--accent-text)",
                  fontWeight: 600,
                } : {
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) => { if (statusFilter !== f.value) e.currentTarget.style.color = "var(--text-primary)"; }}
                onMouseLeave={(e) => { if (statusFilter !== f.value) e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Library */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {library.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3" style={{ color: "var(--text-muted)" }}>
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-sm">Aucun jeu trouvé</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            <AnimatePresence>
              {filtered.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <AddGameModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={reload} />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)", opacity: 0.4 }}>
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8L6 7h12l-2-4z" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" style={{ color: "var(--accent-text)" }}>
            <path stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-space)", color: "var(--text-primary)" }}>
          Vault est vide
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Ajoute ton premier jeu pour commencer</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Ajouter un jeu
      </button>
    </div>
  );
}
