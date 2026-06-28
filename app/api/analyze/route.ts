/**
 * POST /api/analyze
 * Multipart: screenshot (File) OR url (string) + tier ("free"|"full")
 * Returns SSE stream — no DB required.
 */

import { NextRequest } from 'next/server';
import { runAudit, FREE_DIMENSIONS, DIMENSIONS, type DimensionResult } from '@/lib/ai/analyze';
import { captureScreenshot, crawlPage } from '@/lib/screenshot';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const formData = await req.formData();
        const file = formData.get('screenshot') as File | null;
        const url = (formData.get('url') as string | null) ?? undefined;
        const tier = ((formData.get('tier') as string | null) ?? 'free') as 'free' | 'full';
        const paid = formData.get('paid') === '1';
        const rawBase64 = formData.get('imageBase64') as string | null;
        const rawMime = (formData.get('imageMimeType') as string | null) ?? 'image/png';

        // Rate limit only for free (unpaid) requests
        if (!paid) {
          const ip = getClientIp(req);
          const limit = checkRateLimit(ip);
          if (!limit.allowed) {
            const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000 / 60 / 60);
            send({
              type: 'error',
              payload: {
                message: `You've used your 5 free roasts for today 😤 Come back in ~${resetIn}h, or unlock unlimited with the full plan.`,
                rateLimited: true,
              },
            });
            controller.close();
            return;
          }
        }

        if (!file && !url && !rawBase64) {
          send({ type: 'error', payload: { message: 'Provide a screenshot or URL.' } });
          controller.close();
          return;
        }

        let imageBase64: string;
        let mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
        let pageContent: string | undefined;

        if (rawBase64) {
          imageBase64 = rawBase64;
          mimeType = (['image/jpeg', 'image/png', 'image/webp'].includes(rawMime)
            ? rawMime : 'image/png') as 'image/jpeg' | 'image/png' | 'image/webp';
          send({ type: 'status', payload: { message: 'Got your screenshot, loading roast cannon…' } });
        } else if (file) {
          const allowed = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowed.includes(file.type)) {
            send({ type: 'error', payload: { message: 'Use JPEG, PNG, or WebP.' } });
            controller.close();
            return;
          }
          if (file.size > 10 * 1024 * 1024) {
            send({ type: 'error', payload: { message: 'Screenshot too large (max 10 MB).' } });
            controller.close();
            return;
          }
          const bytes = await file.arrayBuffer();
          imageBase64 = Buffer.from(bytes).toString('base64');
          mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
          send({ type: 'status', payload: { message: 'Got your screenshot, loading roast cannon…' } });
        } else {
          send({ type: 'status', payload: { message: 'Crawling your crime scene…' } });
          // Screenshot + full page crawl in parallel — zero extra time added
          const [captured, crawled] = await Promise.all([
            captureScreenshot(url!),
            crawlPage(url!),
          ]);
          imageBase64 = captured.base64;
          mimeType = captured.mimeType;
          pageContent = crawled || undefined;
          send({ type: 'screenshot', payload: { url: captured.screenshotUrl } });
          const contentMsg = pageContent
            ? `Crawled ${pageContent.length} chars of content — loading roast cannon…`
            : 'Screenshot captured — loading roast cannon…';
          send({ type: 'status', payload: { message: contentMsg } });
        }

        const dimensions = tier === 'full' ? [...DIMENSIONS] : [...FREE_DIMENSIONS];

        let dimCount = 0;
        const result = await runAudit({
          imageBase64,
          mimeType,
          dimensions,
          url,
          pageContent,
          onDimensionComplete: async (dimResult: DimensionResult, providerUsed?: string) => {
            dimCount++;
            send({
              type: 'dimension',
              payload: { ...dimResult, _provider: providerUsed, _seq: dimCount },
            });
          },
        });

        send({
          type: 'done',
          payload: {
            overallScore: result.overallScore,
            providerUsed: result.providerUsed,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed. Try again.';
        send({ type: 'error', payload: { message } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
