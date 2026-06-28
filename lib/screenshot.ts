import { put } from '@vercel/blob';

export async function captureScreenshot(url: string): Promise<{
  base64: string;
  mimeType: 'image/jpeg';
  screenshotUrl: string;
}> {
  // microlink without embed= returns JSON; with embed= returns raw image (breaks res.json())
  // fullPage=true captures the entire page height, not just the viewport
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&screenshot.fullPage=true&screenshot.type=jpeg&screenshot.quality=80`;

  const res = await fetch(apiUrl, {
    headers: process.env.MICROLINK_API_KEY
      ? { 'x-api-key': process.env.MICROLINK_API_KEY }
      : {},
  });

  if (!res.ok) {
    throw new Error(`microlink failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json() as {
    status: string;
    data?: { screenshot?: { url?: string } };
  };

  if (json.status !== 'success') {
    throw new Error(`microlink status: ${json.status}`);
  }

  const screenshotUrl = json?.data?.screenshot?.url;
  if (!screenshotUrl) {
    throw new Error('microlink returned no screenshot URL — site may block headless browsers');
  }

  const imgRes = await fetch(screenshotUrl);
  if (!imgRes.ok) throw new Error(`Failed to download screenshot: ${imgRes.status}`);

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return { base64, mimeType: 'image/jpeg', screenshotUrl };
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
