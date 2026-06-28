/**
 * POST /api/analyze
 *
 * Accepts multipart form data:
 *   - screenshot: File (required)
 *   - url: string (optional)
 *   - tier: "free" | "full" (default: "free")
 *
 * Returns: Server-Sent Events stream.
 * Each SSE event is a JSON-encoded DimensionResult or a "done" / "error" event.
 *
 * Event types:
 *   data: { type: "dimension", payload: DimensionResult }
 *   data: { type: "done", payload: { overallScore: number, providerUsed: string } }
 *   data: { type: "error", payload: { message: string } }
 */

import { NextRequest } from 'next/server';
import {
  runAudit,
  FREE_DIMENSIONS,
  DIMENSIONS,
  type DimensionResult,
} from '@/lib/ai/analyze';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 min

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
        const tier = (formData.get('tier') as string | null) ?? 'free';

        if (!file) {
          send({ type: 'error', payload: { message: 'No screenshot provided.' } });
          controller.close();
          return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          send({
            type: 'error',
            payload: { message: 'Unsupported file type. Use JPEG, PNG, or WebP.' },
          });
          controller.close();
          return;
        }

        // Validate file size (max 10 MB)
        if (file.size > 10 * 1024 * 1024) {
          send({ type: 'error', payload: { message: 'Screenshot too large (max 10 MB).' } });
          controller.close();
          return;
        }

        const bytes = await file.arrayBuffer();
        const imageBase64 = Buffer.from(bytes).toString('base64');
        const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';

        const dimensions =
          tier === 'full' ? [...DIMENSIONS] : [...FREE_DIMENSIONS];

        const result = await runAudit({
          imageBase64,
          mimeType,
          dimensions,
          url,
          onDimensionComplete: (dimResult: DimensionResult) => {
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
        const message =
          err instanceof Error ? err.message : 'Analysis failed. Try again.';
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
