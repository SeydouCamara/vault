export type GameStatus = "backlog" | "playing" | "finished" | "100%" | "abandoned";

export type ThemeId = "obsidian" | "ps1" | "nintendo" | "xbox";

export interface UserGame {
  id: string; // RAWG game id (as string)
  rawgId: number;
  name: string;
  coverUrl: string | null;
  developer: string | null;
  releaseYear: number | null;
  genres: string[];
  platforms: string[]; // auto-populated from RAWG
  status: GameStatus;
  completion: number; // 0–100
  addedAt: string; // ISO date
  updatedAt: string;
}

export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  developers?: { name: string }[];
  genres?: { name: string }[];
  platforms?: { platform: { id: number; name: string; slug: string } }[];
  metacritic?: number | null;
}
