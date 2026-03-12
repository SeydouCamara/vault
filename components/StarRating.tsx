"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG star path (viewBox 0 0 24 24)
const STAR_PATH = "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z";

interface StarProps {
  fill: "empty" | "half" | "full";
  size: number;
  color: string;
  emptyColor: string;
}

function Star({ fill, size, color, emptyColor }: StarProps) {
  const id = `clip-${Math.random().toString(36).slice(2)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {fill === "half" && (
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      )}
      {/* Empty base */}
      <path d={STAR_PATH} fill={emptyColor} />
      {/* Filled overlay */}
      {fill === "full" && <path d={STAR_PATH} fill={color} />}
      {fill === "half" && <path d={STAR_PATH} fill={color} clipPath={`url(#${id})`} />}
    </svg>
  );
}

// ─── Display only ───────────────────────────────────────────────────────────

interface DisplayProps {
  rating: number | null;
  size?: number;
}

export function StarDisplay({ rating, size = 12 }: DisplayProps) {
  const isUnrated = rating === null || rating === undefined;
  const isZero = rating === 0;

  if (isUnrated) {
    return (
      <div className="flex items-center gap-0.5" style={{ opacity: 0.18 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} fill="empty" size={size} color="#fbbf24" emptyColor="#fbbf24" />
        ))}
      </div>
    );
  }

  if (isZero) {
    return (
      <div className="flex items-center gap-1">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: "rgba(244,63,94,0.15)", color: "#fb7185", letterSpacing: "0.02em" }}
        >
          0 ★
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = (rating as number) >= i ? "full" : (rating as number) >= i - 0.5 ? "half" : "empty";
        return (
          <Star
            key={i}
            fill={fill as "empty" | "half" | "full"}
            size={size}
            color="#fbbf24"
            emptyColor="rgba(255,255,255,0.12)"
          />
        );
      })}
      <span className="text-[10px] ml-1 tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>
        {(rating as number).toFixed(1).replace(".0", "")}
      </span>
    </div>
  );
}

// ─── Interactive picker ──────────────────────────────────────────────────────

interface PickerProps {
  rating: number | null;
  onChange: (r: number | null) => void;
}

export function StarPicker({ rating, onChange }: PickerProps) {
  const [hover, setHover] = useState<number | null>(null);

  const displayed = hover ?? rating;
  const isUnrated = displayed === null || displayed === undefined;

  const getLabel = (r: number | null) => {
    if (r === null) return "Pas encore noté";
    if (r === 0) return "Nul 💀";
    if (r <= 1) return "Très mauvais";
    if (r <= 2) return "Mauvais";
    if (r <= 2.5) return "Moyen";
    if (r <= 3) return "Correct";
    if (r <= 3.5) return "Bien";
    if (r <= 4) return "Très bien";
    if (r <= 4.5) return "Excellent";
    return "Chef-d'œuvre ✨";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIdx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeft = x < rect.width / 2;
    setHover(isLeft ? starIdx - 0.5 : starIdx);
  };

  const handleClick = (val: number) => {
    // Click same value → reset to null
    if (rating === val) {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Ma note
        </label>
        {rating !== null && (
          <button
            onClick={() => onChange(null)}
            className="text-[10px] transition-opacity hover:opacity-100"
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          >
            Effacer
          </button>
        )}
      </div>

      {/* Stars row */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          {/* "0" button */}
          <button
            className="w-6 h-6 rounded text-[11px] font-bold flex items-center justify-center border transition-all"
            style={
              (hover === 0 || (hover === null && rating === 0))
                ? { background: "rgba(244,63,94,0.25)", borderColor: "#fb7185", color: "#fb7185" }
                : { background: "rgba(255,255,255,0.04)", borderColor: "var(--border)", color: "rgba(255,255,255,0.3)" }
            }
            onMouseEnter={() => setHover(0)}
            onMouseLeave={() => setHover(null)}
            onClick={() => handleClick(0)}
          >
            0
          </button>

          {/* Stars 1–5 */}
          {[1, 2, 3, 4, 5].map((i) => {
            const fill = !isUnrated && (displayed as number) >= i
              ? "full"
              : !isUnrated && (displayed as number) >= i - 0.5
              ? "half"
              : "empty";

            return (
              <motion.div
                key={i}
                className="relative cursor-pointer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.1 }}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  const rect = (document.activeElement as HTMLElement | null)?.getBoundingClientRect?.();
                  void rect; // unused
                  handleClick(hover ?? i);
                }}
              >
                <Star
                  fill={fill as "empty" | "half" | "full"}
                  size={32}
                  color="#fbbf24"
                  emptyColor="rgba(255,255,255,0.1)"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Label animé */}
        <AnimatePresence mode="wait">
          <motion.p
            key={getLabel(displayed ?? null)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs h-4"
            style={{ color: hover !== null ? "var(--accent)" : "var(--text-muted)" }}
          >
            {getLabel(displayed ?? null)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
