/**
 * POST /api/analyze
 *
 * Accepts multipart form data:
 *   - screenshot: File  (optional — omit if url provided)
 *   - url: string       (optional — captures screenshot via microlink)
 *   - tier: "free" | "full" (default: "free")
 *
 * Returns: Server-Sent Events stream.
 * Events:
 *   { type: "audit_id", payload: { id: string } }
 *   { type: "dimension", payload: DimensionResult }
 *   { type: "done", payload: { overallScore: number, providerUsed: string, auditId: string } }
 *   { type: "error", payload: { message: string } }
 */

import { NextRequest } from 'next/server';
import {
  runAudit,
  FREE_DIMENSIONS,
  DIMENSIONS,
  type DimensionResult,
} from '@/lib/ai/analyze';
import {
  createAudit,
  saveDimensionResult,
  updateAuditScore,
} from '@/lib/db/index';
import { captureScreenshot, uploadScreenshot } from '@/lib/screenshot';

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
        let screenshotUrl: string | undefined;

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

          screenshotUrl = await uploadScreenshot(imageBase64, mimeType);
        } else {
          send({ type: 'status', payload: { message: 'Capturing screenshot…' } });
          const captured = await captureScreenshot(url!);
          imageBase64 = captured.base64;
          mimeType = captured.mimeType;

          screenshotUrl = await uploadScreenshot(imageBase64, mimeType);
        }

        const auditId = await createAudit({ url, screenshot_url: screenshotUrl, tier });
        send({ type: 'audit_id', payload: { id: auditId } });

        const dimensions = tier === 'full' ? [...DIMENSIONS] : [...FREE_DIMENSIONS];

        const result = await runAudit({
          imageBase64,
          mimeType,
          dimensions,
          url,
          onDimensionComplete: async (dimResult: DimensionResult) => {
            send({ type: 'dimension', payload: dimResult });
            await saveDimensionResult({
              audit_id: auditId,
              dimension: dimResult.dimension,
              score: dimResult.score,
              summary: dimResult.summary,
              findings: dimResult.findings,
            });
          },
        });

        await updateAuditScore(auditId, result.overallScore, result.providerUsed);

        send({
          type: 'done',
          payload: {
            overallScore: result.overallScore,
            providerUsed: result.providerUsed,
            auditId,
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
