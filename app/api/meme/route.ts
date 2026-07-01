import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/meme?q=<search terms>&source=giphy|tenor|reddit&mood=hype|roast
 * Fetches a real internet meme from one specific source — no cross-source
 * fallback here. Each dimension card picks its own source (see MEME_SOURCES
 * rotation in app/analyze/page.tsx) so different cards render different
 * providers. memegen.link is the client-side last resort if this returns null.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  const source = req.nextUrl.searchParams.get('source') ?? 'giphy';
  const mood = req.nextUrl.searchParams.get('mood') === 'hype' ? 'hype' : 'roast';
  if (!q) return NextResponse.json({ url: null });

  try {
    if (source === 'giphy') return await fromGiphy(q);
    if (source === 'tenor') return await fromTenor(q);
    if (source === 'reddit') return await fromReddit(mood);
  } catch {
    return NextResponse.json({ url: null });
  }
  return NextResponse.json({ url: null });
}

async function fromGiphy(q: string) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) return NextResponse.json({ url: null });

  const params = new URLSearchParams({ api_key: apiKey, q, limit: '10', rating: 'pg-13', lang: 'en' });
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?${params.toString()}`, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return NextResponse.json({ url: null });

  const json = await res.json() as { data?: { images?: { original?: { url?: string } } }[] };
  const results = json.data ?? [];
  if (results.length === 0) return NextResponse.json({ url: null });

  const idx = Math.abs(q.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % results.length;
  return NextResponse.json({ url: results[idx]?.images?.original?.url ?? null });
}

async function fromTenor(q: string) {
  const apiKey = process.env.TENOR_API_KEY;
  if (!apiKey) return NextResponse.json({ url: null });

  const params = new URLSearchParams({ key: apiKey, q, limit: '10', media_filter: 'gif', contentfilter: 'medium' });
  const res = await fetch(`https://tenor.googleapis.com/v2/search?${params.toString()}`, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return NextResponse.json({ url: null });

  const json = await res.json() as { results?: { media_formats?: { gif?: { url?: string } } }[] };
  const results = json.results ?? [];
  if (results.length === 0) return NextResponse.json({ url: null });

  const idx = Math.abs(q.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % results.length;
  return NextResponse.json({ url: results[idx]?.media_formats?.gif?.url ?? null });
}

// meme-api.com — free, no API key, pulls real captioned memes straight from Reddit.
async function fromReddit(mood: 'hype' | 'roast') {
  const subreddits = mood === 'hype'
    ? ['wholesomememes', 'MadeMeSmile']
    : ['ProgrammerHumor', 'CrappyDesign', 'dankmemes'];
  const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

  const res = await fetch(`https://meme-api.com/gimme/${sub}`, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) return NextResponse.json({ url: null });

  const json = await res.json() as { url?: string; nsfw?: boolean };
  if (json.nsfw) return NextResponse.json({ url: null });
  return NextResponse.json({ url: json.url ?? null });
}
