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
