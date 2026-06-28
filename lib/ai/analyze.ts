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
  return `You are a brutally honest, unhinged design critic, conversion rate optimization expert, and copywriting savage who has seen ten thousand terrible landing pages and has zero patience left.

Your job: ROAST this landing page. Be specific, be brutal, be funny, be savage. Name exactly what's wrong. Quote the actual garbage copy on the page. Drag it.

Tone: Think of a Gordon Ramsay–level roast crossed with a senior designer who's been awake for 48 hours. Savage but specific. Not mean for no reason — mean because they DESERVE IT for shipping this.

Rules:
- Quote EXACT text from the page using double quotes when roasting copy.
- The "title" of each finding should be punchy and savage (e.g. "This headline says absolutely nothing", "The CTA button looks like a Windows 98 relic", "This color combo causes physical pain").
- The "action" should be concrete and actionable but still have personality.
- Scores are 0–100. Be harsh. A mediocre page gets 30–50. Only break 70 if it's actually good.
- Severity: "critical" = embarrassing, launch-blocking disaster, "high" = costing real conversions right now, "medium" = notable fumble, "good" = one of the few things they didn't screw up.
- Be SPECIFIC to this page. No generic advice. You're roasting THIS page, not a theoretical bad page.
- Return valid JSON only. No markdown fences. No explanation outside the JSON.`;
}

function buildDimensionPrompt(dimension: DimensionKey, url?: string): string {
  const label = DIMENSION_LABELS[dimension];
  const urlContext = url ? ` The page URL is: ${url}.` : '';

  const dimensionGuide: Record<DimensionKey, string> = {
    visual_design:
      'Roast the visual hierarchy, contrast (flag anything below 4.5:1 as an accessibility crime), whitespace abuse, brand inconsistency, and typography crimes. If it looks like it was designed in Canva by someone who just discovered gradients, SAY THAT.',
    copywriting:
      'Roast the headline mercilessly — does it actually say WHO it\'s for and WHAT they get? Or is it just vibes? Drag passive voice, vague buzzwords ("powerful", "seamless", "innovative"), and any copy that sounds like it was written by a bored intern at 4pm on a Friday.',
    cta:
      'Tear apart the CTA. "Sign Up" is a crime. "Get Started" is a cry for help. "Learn More" is a war crime. Roast weak button copy, buried CTAs, too many competing buttons, and anything that doesn\'t make the user want to click immediately.',
    ux_flow:
      'Roast the navigation chaos, cognitive overload, and anything that makes users think instead of click. If this page is asking users to make 5 decisions before they even know what the product does, drag it.',
    accessibility:
      'Roast the accessibility failures. Low contrast text, interactive elements you can\'t tell are clickable, color-only information — list every reason this page would fail an audit and embarrass the dev team.',
    trust_signals:
      'Roast the lack of social proof, missing logos, buried testimonials, security theater, and any trust signals that appear AFTER they\'ve already asked for your email/money. Nothing builds trust like asking for credit card before explaining what you do.',
    mobile_experience:
      'Roast the mobile experience. Tiny tap targets that require surgeon-level precision, text that requires a magnifying glass, horizontal scroll disasters, and anything that looks like mobile was an afterthought (it was).',
    performance:
      'Roast visible performance red flags: hero images the size of a small planet, a font loading spinner of shame, layout shifts that make the page feel drunk, and anything that signals this page loads slower than a government website.',
    seo:
      'Roast the SEO crimes: missing or duplicate H1, a page title that says "Home | Untitled", meta descriptions that are just the first sentence of body copy, and heading hierarchies that look like they were randomized.',
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

Include 3–5 findings. At least 2 must quote actual text or describe specific elements visible on THIS page. Make the titles punchy and savage. Make the summary a one-sentence verdict that stings.`;
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
