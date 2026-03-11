import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.rawg.io/api";
const KEY = process.env.RAWG_KEY ?? process.env.NEXT_PUBLIC_RAWG_KEY ?? "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    search: query,
    page_size: "8",
    ...(KEY && { key: KEY }),
  });

  if (!KEY) {
    return NextResponse.json(
      { error: "missing_key", message: "Clé API RAWG manquante — ajoute NEXT_PUBLIC_RAWG_KEY dans .env.local (gratuit sur rawg.io/apidocs)" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${BASE}/games?${params}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(data.results ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
