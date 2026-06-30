import { put } from '@vercel/blob';

export async function captureScreenshot(url: string): Promise<{
  base64: string;
  mimeType: 'image/jpeg';
  screenshotUrl: string;
}> {
  // Primary: thum.io — no API key, free, reliable. 5s wait before capture.
  try {
    const thumUrl = `https://image.thum.io/get/width/1280/crop/900/noanimate/viewportwait/5000/${url}`;
    const res = await fetch(thumUrl, {
      headers: { 'User-Agent': 'RoastLab/1.0 (+https://getroastlab.vercel.app)' },
      signal: AbortSignal.timeout(28_000),
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 8000) {
        const base64 = Buffer.from(buffer).toString('base64');
        return { base64, mimeType: 'image/jpeg', screenshotUrl: thumUrl };
      }
    }
  } catch {
    // fall through to microlink
  }

  // Fallback: microlink
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&screenshot.type=jpeg&screenshot.quality=80&screenshot.waitForTimeout=5000`;
  const res = await fetch(apiUrl, {
    headers: process.env.MICROLINK_API_KEY ? { 'x-api-key': process.env.MICROLINK_API_KEY } : {},
    signal: AbortSignal.timeout(35_000),
  });

  if (!res.ok) throw new Error(`screenshot failed: ${res.status} ${res.statusText}`);

  const json = await res.json() as { status: string; data?: { screenshot?: { url?: string } } };
  if (json.status !== 'success') throw new Error(`microlink: ${json.status}`);

  const screenshotUrl = json?.data?.screenshot?.url;
  if (!screenshotUrl) throw new Error('no screenshot URL returned — site may block headless browsers');

  const imgRes = await fetch(screenshotUrl);
  if (!imgRes.ok) throw new Error(`screenshot download failed: ${imgRes.status}`);

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return { base64, mimeType: 'image/jpeg', screenshotUrl };
}

/**
 * Capture 3 screenshots at different scroll depths (top, mid, bottom).
 * All concurrent. Returns array of public image URLs.
 * Max ~20s total.
 */
export async function captureMultipleScreenshots(url: string): Promise<string[]> {
  const thumBase = 'https://image.thum.io/get/width/1280/noanimate';

  const thumShot = async (params: string): Promise<string | null> => {
    try {
      const u = `${thumBase}/${params}/${url}`;
      const res = await fetch(u, {
        headers: { 'User-Agent': 'RoastLab/1.0 (+https://getroastlab.vercel.app)' },
        signal: AbortSignal.timeout(22_000),
      });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return buf.byteLength > 8000 ? u : null;
    } catch {
      return null;
    }
  };

  // 3 shots: viewport top (5s wait), below-fold tall crop (8s wait), full page (10s wait)
  const [top, tall, full] = await Promise.all([
    thumShot('crop/900/viewportwait/5000'),
    thumShot('crop/1800/viewportwait/8000'),
    thumShot('viewportwait/10000/fullpage'),
  ]);

  return [top, tall, full].filter(Boolean) as string[];
}

/**
 * Crawl a URL with Jina AI Reader — returns clean markdown of the full page.
 * Free, no API key, JS-rendered, strips nav/footer noise, fails gracefully.
 */
export async function crawlPage(url: string): Promise<string> {
  const headers = {
    'Accept': 'text/markdown',
    'X-Return-Format': 'markdown',
    'X-Timeout': '18',
    'X-Remove-Selector': 'header,nav,footer,#cookie-banner,[class*="cookie"],[id*="cookie"],[class*="nav-"],[id*="nav"],[class*="header"],[class*="footer"],[class*="sidebar"],[class*="menu"]',
    'X-With-Generated-Alt': 'true',
    'User-Agent': 'RoastLab/1.0 (+https://getroastlab.vercel.app)',
  };

  const attempt = async (): Promise<string> => {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers,
      signal: AbortSignal.timeout(22_000),
    });
    if (!res.ok) return '';
    const raw = await res.text();
    // Remove Jina metadata header lines before actual content
    const lines = raw.split('\n');
    const contentStart = lines.findIndex(l => l.startsWith('#') || (l.trim().length > 80));
    const content = contentStart > 0 ? lines.slice(contentStart).join('\n') : raw;
    return content.slice(0, 8000);
  };

  try {
    return await attempt();
  } catch {
    // 1 retry after brief delay
    try {
      await new Promise(r => setTimeout(r, 1500));
      return await attempt();
    } catch {
      return '';
    }
  }
}

/**
 * Fetch raw HTML and extract color palette, fonts, meta tags.
 * Free — direct HTTP fetch, no API key needed.
 */
export async function extractSiteData(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(14_000),
    });
    if (!res.ok) return '';
    const html = await res.text();

    // Colors
    const hexColors = [...new Set([...html.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => m[0]))].slice(0, 15);
    const rgbColors = [...new Set([...html.matchAll(/rgba?\(\s*\d+,\s*\d+,\s*\d+[^)]*\)/g)].map(m => m[0]))].slice(0, 8);

    // Fonts
    const fonts = [...new Set([...html.matchAll(/font-family:\s*([^;}"']+)/gi)].map(m => m[1].trim().split(',')[0].replace(/["']/g, '')))].slice(0, 6);
    const googleFonts = [...html.matchAll(/family=([A-Za-z+]+)/g)].map(m => m[1].replace(/\+/g, ' '));

    // Meta / headings
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? '';
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,200})/i)?.[1]?.trim() ?? '';
    const metaOgTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{0,100})/i)?.[1]?.trim() ?? '';
    const h1Tags = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).slice(0, 3);
    const h2Tags = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 6);

    // Images (check for missing alt)
    const imgTags = [...html.matchAll(/<img[^>]+>/gi)].slice(0, 20);
    const imgNoAlt = imgTags.filter(m => !m[0].includes('alt=')).length;
    const imgEmptyAlt = imgTags.filter(m => /alt=["']\s*["']/.test(m[0])).length;

    // Links / nav
    const navLinks = [...html.matchAll(/href=["']([^"'#?][^"']*?)["']/gi)].map(m => m[1]).filter(l => l.startsWith('/') && l.length < 40).slice(0, 10);

    // CSS custom properties (design tokens)
    const cssVars = [...html.matchAll(/--[\w-]+:\s*([^;}"]+)/g)].map(m => `${m[0].split(':')[0]}: ${m[1].trim()}`).slice(0, 12);

    const lines: string[] = ['## Extracted Site Technical Data (use for accurate findings)'];
    if (title) lines.push(`Page Title: "${title}"`);
    if (metaOgTitle && metaOgTitle !== title) lines.push(`OG Title: "${metaOgTitle}"`);
    if (metaDesc) lines.push(`Meta Description: "${metaDesc}"`);
    if (h1Tags.length) lines.push(`H1 tags: ${h1Tags.map(h => `"${h}"`).join(' | ')}`);
    if (h2Tags.length) lines.push(`H2 tags: ${h2Tags.map(h => `"${h}"`).join(' | ')}`);
    if (hexColors.length) lines.push(`Color palette (hex): ${hexColors.join(', ')}`);
    if (rgbColors.length) lines.push(`Colors (rgb): ${rgbColors.join(', ')}`);
    if (fonts.length) lines.push(`CSS font-family: ${fonts.join(', ')}`);
    if (googleFonts.length) lines.push(`Google Fonts loaded: ${[...new Set(googleFonts)].join(', ')}`);
    if (cssVars.length) lines.push(`CSS variables: ${cssVars.join('; ')}`);
    if (imgNoAlt > 0) lines.push(`Images missing alt text: ${imgNoAlt}`);
    if (imgEmptyAlt > 0) lines.push(`Images with empty alt="": ${imgEmptyAlt}`);
    if (navLinks.length) lines.push(`Internal paths found: ${navLinks.join(', ')}`);

    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Try to crawl 2 subpages (about, pricing, etc.) to get broader site context.
 * Only for premium audits.
 */
export async function crawlSubpages(url: string): Promise<string> {
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return '';
  }

  const candidates = ['/about', '/about-us', '/pricing', '/features', '/product', '/services', '/contact'];
  const toTry = candidates.slice(0, 4);

  const results = await Promise.allSettled(
    toTry.map(async (path) => {
      const res = await fetch(`https://r.jina.ai/${origin}${path}`, {
        headers: { 'Accept': 'text/markdown', 'X-Timeout': '10' },
        signal: AbortSignal.timeout(14_000),
      });
      if (!res.ok) return null;
      const text = await res.text();
      if (text.length < 200 || text.includes('404') || text.includes('Page not found')) return null;
      return `### ${path}\n${text.slice(0, 2000)}`;
    })
  );

  const valid = results
    .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled' && !!r.value)
    .map(r => r.value as string);

  return valid.length > 0 ? `## Additional Pages Crawled\n${valid.join('\n\n')}` : '';
}

export async function uploadScreenshot(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<string> {
  // If Blob token not configured, skip upload silently
  if (!process.env.BLOB_READ_WRITE_TOKEN) return '';

  const ext = mimeType.split('/')[1];
  const filename = `screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(base64, 'base64');

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: mimeType,
  });

  return blob.url;
}
