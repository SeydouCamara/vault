"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { searchGames } from "@/lib/rawg";
import { addGame } from "@/lib/storage";
import type { RawgGame, UserGame, GameStatus } from "@/lib/types";
import { StarPicker } from "@/components/StarRating";

const STATUSES: { value: GameStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "playing", label: "En cours / Débuté" },
  { value: "finished", label: "Terminé" },
  { value: "100%", label: "Platiné" },
  { value: "abandoned", label: "Abandonné" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddGameModal({ open, onClose, onAdded }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RawgGame[]>([]);
  const [searchError, setSearchError] = useState<"missing_key" | "fetch_error" | null>(null);
  const [selected, setSelected] = useState<RawgGame | null>(null);
  const [status, setStatus] = useState<GameStatus>("backlog");
  const [completion] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSearchError(null);
      setSelected(null);
      setStatus("backlog");
      setRating(null);
      setComment("");
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearchError(null); return; }
    setLoading(true);
    const res = await searchGames(q);
    if (res.ok) {
      setResults(res.games);
      setSearchError(null);
    } else {
      setResults([]);
      setSearchError(res.error);
    }
    setLoading(false);
  }, []);

  const handleQuery = (v: string) => {
    setQuery(v);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 320);
  };

  const handleSelect = (game: RawgGame) => {
    setSelected(game);
    setResults([]);
    setQuery(game.name);
  };

  const handleAdd = () => {
    if (!selected) return;
    const now = new Date().toISOString();
    const platforms = selected.platforms?.map((p) => p.platform.name) ?? [];
    const userGame: UserGame = {
      id: String(selected.id),
      rawgId: selected.id,
      name: selected.name,
      coverUrl: selected.background_image,
      developer: selected.developers?.[0]?.name ?? null,
      releaseYear: selected.released ? new Date(selected.released).getFullYear() : null,
      genres: selected.genres?.map((g) => g.name) ?? [],
      platforms,
      status,
      completion: status === "100%" || status === "finished" ? 100 : completion,
      rating,
      comment: comment.trim() || null,
      addedAt: now,
      updatedAt: now,
    };
    addGame(userGame);
    onAdded();
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const platforms = selected?.platforms?.map((p) => p.platform.name) ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h2 className="text-sm font-semibold text-[var(--text-muted)] tracking-wide uppercase">
                  Ajouter un jeu
                </h2>
                <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQuery(e.target.value)}
                    placeholder="Rechercher un jeu…"
                    className="w-full bg-white/5 border border-[var(--border)] rounded-xl pl-9 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
                    style={{ "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-white/20 rounded-full animate-spin" style={{ borderTopColor: "var(--accent)" }} />
                    </div>
                  )}
                </div>

                {/* Missing key error */}
                {searchError === "missing_key" && (
                  <div className="flex flex-col gap-1.5 px-3 py-3 rounded-xl -mt-2" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)" }}>
                    <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Clé API manquante</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Ajoute <code className="bg-white/5 px-1 rounded" style={{ color: "var(--accent)" }}>NEXT_PUBLIC_RAWG_KEY</code> dans <code className="bg-white/5 px-1 rounded" style={{ color: "var(--accent)" }}>.env.local</code> puis relance le serveur.{" "}
                      <a href="https://rawg.io/apidocs" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: "var(--accent)" }}>
                        Clé gratuite sur rawg.io
                      </a>
                    </p>
                  </div>
                )}

                {/* Autocomplete */}
                <AnimatePresence>
                  {results.length > 0 && !selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col gap-1 -mt-2"
                    >
                      {results.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handleSelect(game)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-transparent hover:border-[var(--border)] transition-all text-left group"
                        >
                          <div className="relative w-9 h-12 rounded-md overflow-hidden bg-white/8 shrink-0">
                            {game.background_image && (
                              <Image src={game.background_image} alt={game.name} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                              {game.name}
                            </p>
                            {game.released && (
                              <p className="text-xs text-[var(--text-muted)] opacity-60 mt-0.5">
                                {new Date(game.released).getFullYear()}
                              </p>
                            )}
                          </div>
                          <svg width="14" height="14" className="shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected + config */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Game preview */}
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}>
                        <div className="relative w-9 h-12 rounded-md overflow-hidden bg-white/8 shrink-0">
                          {selected.background_image && (
                            <Image src={selected.background_image} alt={selected.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{selected.name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {selected.developers?.[0]?.name}{selected.released ? ` · ${new Date(selected.released).getFullYear()}` : ""}
                          </p>
                          {/* Platforms from RAWG */}
                          {platforms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {platforms.slice(0, 5).map((p) => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-[var(--text-muted)]">
                                  {p}
                                </span>
                              ))}
                              {platforms.length > 5 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-[var(--text-muted)]">
                                  +{platforms.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { setSelected(null); setQuery(""); }}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
                          Statut
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {STATUSES.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => {
                                setStatus(s.value);
                              }}
                              className="text-xs px-2.5 py-1 rounded-lg border transition-all"
                              style={status === s.value ? {
                                background: "var(--accent)",
                                borderColor: "var(--accent)",
                                color: "var(--accent-text)",
                                fontWeight: 600,
                              } : {
                                background: "rgba(255,255,255,0.04)",
                                borderColor: "var(--border)",
                                color: "var(--text-muted)",
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Note */}
                      <div className="py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                        <StarPicker rating={rating} onChange={setRating} />
                      </div>

                      {/* Commentaire */}
                      <div>
                        <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          Critique
                          <span style={{ color: "var(--text-muted)", opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>— optionnel</span>
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Ton avis sur ce jeu…"
                          rows={3}
                          className="w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none transition-all"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                        />
                      </div>

                      {/* CTA */}
                      <button
                        onClick={handleAdd}
                        className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-colors"
                        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                      >
                        Ajouter à la bibliothèque
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!query && !selected && (
                  <p className="text-center text-xs text-[var(--text-muted)] py-4">
                    Tape le nom d&apos;un jeu pour commencer
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
