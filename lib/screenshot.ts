/**
 * Screenshot utilities:
 * - captureScreenshot: URL → base64 JPEG via microlink.io (free, 100/day)
 * - uploadScreenshot: base64 → Vercel Blob → public URL
 */

import { put } from '@vercel/blob';

export async function captureScreenshot(url: string): Promise<{
  base64: string;
  mimeType: 'image/jpeg';
}> {
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

  const res = await fetch(apiUrl, {
    headers: process.env.MICROLINK_API_KEY
      ? { 'x-api-key': process.env.MICROLINK_API_KEY }
      : {},
  });

  if (!res.ok) {
    throw new Error(`Screenshot capture failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    status: string;
    data?: { screenshot?: { url?: string } };
  };

  const screenshotUrl = json?.data?.screenshot?.url;
  if (!screenshotUrl) {
    throw new Error('microlink returned no screenshot URL');
  }

  const imgRes = await fetch(screenshotUrl);
  if (!imgRes.ok) throw new Error('Failed to download screenshot image');

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return { base64, mimeType: 'image/jpeg' };
}

export async function uploadScreenshot(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<string> {
  const ext = mimeType.split('/')[1];
  const filename = `screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const buffer = Buffer.from(base64, 'base64');

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: mimeType,
  });

  return blob.url;
}
