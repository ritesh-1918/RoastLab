/**
 * POST /api/analyze
 * Multipart: screenshot (File) OR url (string) + tier ("free"|"full")
 * Returns SSE stream — no DB required.
 */

import { NextRequest } from 'next/server';
import { runAudit, FREE_DIMENSIONS, DIMENSIONS, type DimensionResult } from '@/lib/ai/analyze';
import { captureScreenshot } from '@/lib/screenshot';

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

        if (!file && !url) {
          send({ type: 'error', payload: { message: 'Provide a screenshot or URL.' } });
          controller.close();
          return;
        }

        let imageBase64: string;
        let mimeType: 'image/jpeg' | 'image/png' | 'image/webp';

        if (file) {
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
        } else {
          send({ type: 'status', payload: { message: 'Capturing screenshot…' } });
          const captured = await captureScreenshot(url!);
          imageBase64 = captured.base64;
          mimeType = captured.mimeType;
        }

        send({ type: 'status', payload: { message: 'Firing up the roast machine…' } });

        const dimensions = tier === 'full' ? [...DIMENSIONS] : [...FREE_DIMENSIONS];

        const result = await runAudit({
          imageBase64,
          mimeType,
          dimensions,
          url,
          onDimensionComplete: async (dimResult: DimensionResult) => {
            send({ type: 'dimension', payload: dimResult });
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
