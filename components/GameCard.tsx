"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { UserGame, GameStatus } from "@/lib/types";

const STATUS_LABEL: Record<GameStatus, string> = {
  backlog: "Backlog",
  playing: "En cours",
  finished: "Terminé",
  "100%": "100%",
  abandoned: "Abandonné",
};

const STATUS_BG: Record<GameStatus, string> = {
  backlog:   "rgba(255,255,255,0.08)",
  playing:   "rgba(245,158,11,0.18)",
  finished:  "rgba(52,211,153,0.18)",
  "100%":    "rgba(245,158,11,0.28)",
  abandoned: "rgba(244,63,94,0.18)",
};

const STATUS_TEXT: Record<GameStatus, string> = {
  backlog:   "rgba(255,255,255,0.4)",
  playing:   "#fbbf24",
  finished:  "#34d399",
  "100%":    "#fcd34d",
  abandoned: "#fb7185",
};

const STATUS_BAR: Record<GameStatus, string> = {
  backlog:   "rgba(255,255,255,0.2)",
  playing:   "var(--accent)",
  finished:  "#34d399",
  "100%":    "var(--accent)",
  abandoned: "#fb7185",
};

interface Props {
  game: UserGame;
  onClick?: () => void;
}

export default function GameCard({ game, onClick }: Props) {
  const completion = game.completion ?? 0;
  // Show first platform only in the badge (most relevant)
  const mainPlatform = game.platforms?.[0] ?? null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg" style={{ background: "var(--bg-card)" }}>
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ color: "rgba(255,255,255,0.08)" }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke="currentColor" strokeWidth="1.5" d="M9 10h.01M15 10h.01M9.5 14.5s.5 1.5 2.5 1.5 2.5-1.5 2.5-1.5" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm"
            style={{ background: STATUS_BG[game.status], color: STATUS_TEXT[game.status] }}
          >
            {STATUS_LABEL[game.status]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-medium leading-tight line-clamp-2" style={{ color: "var(--text-primary)", opacity: 0.9 }}>
            {game.name}
          </p>
          {mainPlatform && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/8 leading-tight" style={{ color: "var(--text-muted)" }}>
              {abbreviatePlatform(mainPlatform)}
            </span>
          )}
        </div>

        {/* Completion bar */}
        {game.status !== "backlog" && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="h-full rounded-full"
                style={{ background: STATUS_BAR[game.status] }}
              />
            </div>
            <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
              {completion}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function abbreviatePlatform(name: string): string {
  const map: Record<string, string> = {
    "PlayStation 5": "PS5",
    "PlayStation 4": "PS4",
    "PlayStation 3": "PS3",
    "PlayStation 2": "PS2",
    "PlayStation": "PS1",
    "Nintendo Switch": "Switch",
    "PC": "PC",
    "Xbox Series S/X": "XSX",
    "Xbox One": "XOne",
    "Xbox 360": "X360",
    "Nintendo 3DS": "3DS",
    "Nintendo DS": "DS",
    "Game Boy Advance": "GBA",
    "Wii U": "Wii U",
    "Wii": "Wii",
    "macOS": "Mac",
    "iOS": "iOS",
    "Android": "And",
  };
  return map[name] ?? name.slice(0, 4);
}
