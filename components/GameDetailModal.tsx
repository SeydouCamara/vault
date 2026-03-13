"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { updateGame, removeGame } from "@/lib/storage";
import type { UserGame, GameStatus } from "@/lib/types";
import { StarPicker } from "@/components/StarRating";

const STATUSES: { value: GameStatus; label: string }[] = [
  { value: "backlog",    label: "Backlog" },
  { value: "playing",   label: "En cours / Débuté" },
  { value: "finished",  label: "Terminé" },
  { value: "100%",      label: "Platiné" },
  { value: "abandoned", label: "Abandonné" },
];

interface Props {
  game: UserGame | null;
  onClose: () => void;
  onUpdated: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Unsaved-changes overlay ──────────────────────────────────────────────────
function UnsavedWarning({
  onSave,
  onDiscard,
  onCancel,
}: {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute inset-x-0 bottom-0 z-10 rounded-b-2xl overflow-hidden"
      style={{ background: "var(--bg-card)" }}
    >
      {/* Frosted separator */}
      <div className="h-px w-full" style={{ background: "var(--border)" }} />

      <div className="px-5 pt-4 pb-5" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Modifications non sauvegardées
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          Veux-tu enregistrer les modifications avant de quitter ?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
            className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >
            Enregistrer
          </button>
          <button
            onClick={onDiscard}
            className="w-full py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ background: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Quitter sans enregistrer
          </button>
          <button
            onClick={onCancel}
            className="text-xs py-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Annuler
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Delete confirm overlay ───────────────────────────────────────────────────
function DeleteConfirm({
  gameName,
  onConfirm,
  onCancel,
}: {
  gameName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute inset-x-0 bottom-0 z-10 rounded-b-2xl overflow-hidden"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="h-px w-full" style={{ background: "var(--border)" }} />
      <div className="px-5 pt-4 pb-5" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Supprimer ce jeu ?
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-primary)" }}>{gameName}</strong> sera retiré de ta bibliothèque.
          Cette action est irréversible.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ background: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "#fb7185", color: "#fff" }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function GameDetailModal({ game, onClose, onUpdated }: Props) {
  const [status,  setStatus]  = useState<GameStatus>(game?.status   ?? "backlog");
  const [rating,  setRating]  = useState<number | null>(game?.rating ?? null);
  const [comment, setComment] = useState<string>(game?.comment ?? "");

  // overlay states
  const [showUnsaved, setShowUnsaved]   = useState(false);
  const [showDelete,  setShowDelete]    = useState(false);

  // ── Sync when game changes (new card selected) ──
  const gameId = game?.id;
  const [lastGameId, setLastGameId] = useState<string | undefined>(gameId);
  if (gameId !== lastGameId) {
    setLastGameId(gameId);
    setStatus(game?.status ?? "backlog");
    setRating(game?.rating ?? null);
    setComment(game?.comment ?? "");
    setShowUnsaved(false);
    setShowDelete(false);
  }

  // ── isDirty ──
  const isDirty =
    status  !== (game?.status ?? "backlog") ||
    rating  !== (game?.rating ?? null)      ||
    comment !== (game?.comment ?? "");

  // ── Body scroll lock ──
  useEffect(() => {
    if (game) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [game]);

  // ── Actions ──
  const handleSave = () => {
    if (!game) return;
    updateGame(game.id, {
      status,
      rating,
      comment: comment.trim() || null,
    });
    onUpdated();
    onClose();
  };

  // "Fermer" btn or backdrop click
  const handleCloseAttempt = () => {
    if (showDelete) { setShowDelete(false); return; }
    if (isDirty)    { setShowUnsaved(true); return; }
    onClose();
  };

  const handleBackdropClick = () => {
    if (showDelete) { setShowDelete(false); return; }
    if (isDirty)    { setShowUnsaved(true); return; }
    onClose();
  };

  const handleDelete = () => {
    if (!game) return;
    removeGame(game.id);
    onUpdated();
    onClose();
  };

  return (
    <AnimatePresence>
      {game && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* ── Mobile: bottom sheet │ Desktop: centered modal ── */}
          <motion.div
            initial={{ y: "100%", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={[
              "fixed z-50 w-full",
              "bottom-0 left-0 right-0 max-h-[92dvh]",
              "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:max-h-[90dvh]",
              "flex flex-col",
            ].join(" ")}
            style={{ willChange: "transform" }}
          >
            {/* Card shell */}
            <div
              className="relative flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
              </div>

              {/* Cover banner */}
              <div className="relative h-32 w-full shrink-0" style={{ background: "var(--bg-base)" }}>
                {game.coverUrl && (
                  <Image src={game.coverUrl} alt={game.name} fill className="object-cover opacity-35" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />

                {/* ✕ button — desktop only */}
                <button
                  onClick={handleCloseAttempt}
                  className="hidden sm:flex absolute top-3 right-3 w-7 h-7 items-center justify-center rounded-full transition-colors"
                  style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.7)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                {/* Game info */}
                <div className="absolute bottom-3 left-4 flex items-end gap-3">
                  <div
                    className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-lg"
                    style={{ background: "var(--bg-base)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {game.coverUrl && (
                      <Image src={game.coverUrl} alt={game.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="pb-0.5">
                    <p className="text-sm font-bold text-white leading-tight line-clamp-2">{game.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {[game.developer, game.releaseYear].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-5 py-4 flex flex-col gap-4">

                  {/* Date d'ajout */}
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <span>Ajouté le <strong style={{ color: "var(--text-primary)" }}>{formatDate(game.addedAt)}</strong></span>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: "var(--text-muted)" }}>
                      Statut
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setStatus(s.value)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border transition-all"
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

                  {/* Critique */}
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      Critique
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
                </div>
              </div>

              {/* ── Footer sticky ── */}
              <div
                className="shrink-0 px-5 pt-3 pb-4 border-t flex flex-col gap-2"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-card)",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {/* 1. Enregistrer — primary */}
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-colors"
                  style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                >
                  Enregistrer
                </button>

                {/* 2. Fermer — secondary */}
                <button
                  onClick={handleCloseAttempt}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
                  style={{ background: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Fermer
                </button>

                {/* 3. Supprimer — discreet */}
                <button
                  onClick={() => { setShowDelete(true); setShowUnsaved(false); }}
                  className="text-xs py-1 transition-colors"
                  style={{ color: "rgba(251,113,133,0.5)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fb7185")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(251,113,133,0.5)")}
                >
                  Supprimer de la bibliothèque
                </button>
              </div>

              {/* ── Unsaved changes overlay ── */}
              <AnimatePresence>
                {showUnsaved && (
                  <UnsavedWarning
                    onSave={handleSave}
                    onDiscard={() => { setShowUnsaved(false); onClose(); }}
                    onCancel={() => setShowUnsaved(false)}
                  />
                )}
              </AnimatePresence>

              {/* ── Delete confirm overlay ── */}
              <AnimatePresence>
                {showDelete && (
                  <DeleteConfirm
                    gameName={game.name}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDelete(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
