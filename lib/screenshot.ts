/**
 * Free screenshot capture via microlink.io
 * Free tier: 100 req/day, no API key needed.
 * Returns base64-encoded JPEG.
 */

export async function captureScreenshot(url: string): Promise<{
  base64: string;
  mimeType: 'image/jpeg';
}> {
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;

  const res = await fetch(apiUrl, {
    headers: { 'x-api-key': process.env.MICROLINK_API_KEY ?? '' }, // optional paid key
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

  // Download and convert to base64
  const imgRes = await fetch(screenshotUrl);
  if (!imgRes.ok) throw new Error('Failed to download screenshot image');

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return { base64, mimeType: 'image/jpeg' };
}
