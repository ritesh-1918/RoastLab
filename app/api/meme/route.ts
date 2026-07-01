import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/meme?q=<search terms>
 * Fetches a real internet meme GIF from Giphy for the given search terms.
 * Returns { url: string | null } — null means caller should fall back to memegen.link.
 * Server-side only — keeps GIPHY_API_KEY out of the client bundle.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ url: null });

  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) return NextResponse.json({ url: null });

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      q,
      limit: '10',
      rating: 'pg-13',
      lang: 'en',
    });
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return NextResponse.json({ url: null });

    const json = await res.json() as { data?: { images?: { original?: { url?: string } } }[] };
    const results = json.data ?? [];
    if (results.length === 0) return NextResponse.json({ url: null });

    // Pick a pseudo-random result deterministically from the query so it doesn't
    // flicker between re-renders, but still varies across different searches.
    const idx = Math.abs(q.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % results.length;
    const url = results[idx]?.images?.original?.url ?? null;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}
