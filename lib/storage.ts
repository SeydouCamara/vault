import type { UserGame } from "./types";

const KEY = "vault_library";

export function getLibrary(): UserGame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(games: UserGame[]): void {
  localStorage.setItem(KEY, JSON.stringify(games));
}

export function addGame(game: UserGame): UserGame[] {
  const lib = getLibrary();
  const updated = [game, ...lib.filter((g) => g.id !== game.id)];
  saveLibrary(updated);
  return updated;
}

export function updateGame(id: string, patch: Partial<UserGame>): UserGame[] {
  const lib = getLibrary().map((g) =>
    g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
  );
  saveLibrary(lib);
  return lib;
}

export function removeGame(id: string): UserGame[] {
  const lib = getLibrary().filter((g) => g.id !== id);
  saveLibrary(lib);
  return lib;
}
