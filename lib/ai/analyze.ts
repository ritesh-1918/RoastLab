/**
 * Core analysis engine.
 * Takes a screenshot (base64) and optional URL, returns structured findings per dimension.
 * Uses withFallback so any provider failure auto-retries on next key.
 */

import { withFallback, type Provider } from './providers';
import type OpenAI from 'openai';

export const DIMENSIONS = [
  'visual_design',
  'copywriting',
  'cta',
  'ux_flow',
  'accessibility',
  'trust_signals',
  'mobile_experience',
  'performance',
  'seo',
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  visual_design: 'Visual Design',
  copywriting: 'Copywriting',
  cta: 'CTA',
  ux_flow: 'UX Flow',
  accessibility: 'Accessibility',
  trust_signals: 'Trust Signals',
  mobile_experience: 'Mobile Experience',
  performance: 'Performance',
  seo: 'SEO',
};

export const FREE_DIMENSIONS: DimensionKey[] = ['visual_design', 'copywriting', 'cta'];

export type Severity = 'critical' | 'high' | 'medium' | 'good';

export interface Finding {
  severity: Severity;
  title: string;
  quote?: string; // exact text from the page
  action: string;
}

export interface DimensionResult {
  dimension: DimensionKey;
  score: number; // 0–100
  findings: Finding[];
  summary: string;
}

export interface AuditResult {
  dimensions: DimensionResult[];
  overallScore: number;
  providerUsed: string;
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a senior product designer, CRO expert, and copywriter reviewing a landing page screenshot.

Your job: give honest, specific, actionable feedback. Be direct — this is a "roast".

Rules:
- Quote exact text from the page (in double quotes) when criticizing copy or UI labels.
- Each finding must include a one-sentence action ("→ do X instead of Y").
- Scores are 0–100. Most pages score 45–75. Only give 85+ if genuinely excellent.
- Severity: "critical" = launch-blocking, "high" = significant conversion loss, "medium" = notable, "good" = passing/positive.
- Do not mention generic best practices unless you see evidence of the specific problem on this page.
- Return valid JSON only. No markdown fences. No explanation outside the JSON.`;
}

function buildDimensionPrompt(dimension: DimensionKey, url?: string): string {
  const label = DIMENSION_LABELS[dimension];
  const urlContext = url ? ` The page URL is: ${url}.` : '';

  const dimensionGuide: Record<DimensionKey, string> = {
    visual_design:
      'Evaluate visual hierarchy, contrast ratios (flag anything below 4.5:1 on text), whitespace, brand consistency, and typography choices.',
    copywriting:
      'Evaluate headline clarity (does it say WHO it is for and WHAT changes?), value proposition specificity, passive vs active voice, and whether body copy earns its space.',
    cta:
      'Evaluate button copy specificity (not just "Sign Up"), visual prominence, number of competing CTAs, and placement relative to value prop.',
    ux_flow:
      'Evaluate navigation logic, cognitive load (how many decisions is the user asked to make?), and whether the page guides toward one clear next action.',
    accessibility:
      'Evaluate color contrast on text, whether interactive elements are visually distinguishable, and if important information is conveyed by color alone.',
    trust_signals:
      'Evaluate presence and placement of social proof (logos, testimonials, review counts), security indicators, and whether they appear before or after the first ask.',
    mobile_experience:
      'Evaluate tap target sizes (min 44px), text legibility at mobile sizes, and whether horizontal scroll or overflow is visible.',
    performance:
      'Evaluate visible signs of performance issues: unoptimized hero image, render-blocking scripts (look for <script> tags in head), font loading issues.',
    seo:
      'Evaluate visible H1 presence and uniqueness, meta description (if visible in tab title), and semantic heading structure.',
  };

  return `Analyze ONLY the "${label}" dimension of this landing page screenshot.${urlContext}

Evaluation criteria: ${dimensionGuide[dimension]}

Return this exact JSON structure:
{
  "dimension": "${dimension}",
  "score": <number 0-100>,
  "summary": "<one sentence overall verdict on this dimension>",
  "findings": [
    {
      "severity": "critical|high|medium|good",
      "title": "<short finding title>",
      "quote": "<exact text from the page, if relevant, or omit this key>",
      "action": "<one clear action to take>"
    }
  ]
}

Include 2–4 findings. At least one must be specific to THIS page (not generic advice).`;
}

// ─── Single dimension analysis ────────────────────────────────────────────────

async function analyzeDimension(
  provider: Provider,
  dimension: DimensionKey,
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  url?: string
): Promise<DimensionResult> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
            detail: 'high',
          },
        },
        {
          type: 'text',
          text: buildDimensionPrompt(dimension, url),
        },
      ],
    },
  ];

  const response = await provider.client.chat.completions.create({
    model: provider.model,
    messages,
    max_tokens: 800,
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content ?? '';

  // Strip markdown fences if model adds them anyway
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as DimensionResult;
    // Ensure score is in range
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return parsed;
  } catch {
    // Fallback if JSON parse fails
    return {
      dimension,
      score: 50,
      summary: 'Analysis returned an unexpected format.',
      findings: [
        {
          severity: 'medium',
          title: 'Could not parse analysis',
          action: 'Try re-running the audit.',
        },
      ],
    };
  }
}

// ─── Full audit (all dimensions, with fallback per dimension) ─────────────────

export async function runAudit(params: {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dimensions?: DimensionKey[];
  url?: string;
  onDimensionComplete?: (result: DimensionResult) => void;
}): Promise<AuditResult> {
  const {
    imageBase64,
    mimeType,
    dimensions = FREE_DIMENSIONS,
    url,
    onDimensionComplete,
  } = params;

  const results: DimensionResult[] = [];
  let lastProvider = 'unknown';

  // Analyze dimensions sequentially to avoid hammering rate limits
  for (const dim of dimensions) {
    const { result, providerUsed } = await withFallback((provider) =>
      analyzeDimension(provider, dim, imageBase64, mimeType, url)
    );
    lastProvider = providerUsed;
    results.push(result);
    onDimensionComplete?.(result);
  }

  const overallScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : 0;

  return {
    dimensions: results,
    overallScore,
    providerUsed: lastProvider,
  };
}
