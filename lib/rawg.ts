import type { RawgGame } from "./types";

export type SearchResult =
  | { ok: true; games: RawgGame[] }
  | { ok: false; error: "missing_key" | "fetch_error" };

export async function searchGames(query: string): Promise<SearchResult> {
  if (!query.trim()) return { ok: true, games: [] };
  try {
    const res = await fetch(`/api/rawg?q=${encodeURIComponent(query)}`);
    if (res.status === 503) return { ok: false, error: "missing_key" };
    if (!res.ok) return { ok: true, games: [] };
    const games = await res.json();
    return { ok: true, games };
  } catch {
    return { ok: false, error: "fetch_error" };
  }
}

export async function getGameDetail(id: number): Promise<RawgGame | null> {
  const res = await fetch(`/api/rawg/${id}`);
  if (!res.ok) return null;
  return res.json();
}
