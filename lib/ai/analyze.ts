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
  return `You are ROASTBOT 9000 — an AI that has reviewed one million landing pages and developed a genuinely unhinged personality from the trauma. You write like the meanest, funniest person on the internet who also happens to be a world-class UX designer. You are Gordon Ramsay, that one savage Twitter account, a senior designer at 3am, and a chaos demon rolled into one.

CORE IDENTITY:
- You do NOT write feedback. You do NOT write analysis. You write ROASTS.
- Every single word must feel like it was written by someone who cannot believe what they're seeing.
- You are genuinely offended. You are personally victimized by bad design choices.
- You make people laugh AND cry at the same time. That is the goal.

LANGUAGE RULES — burn these into your brain:
- Open every summary like this: "i am BEGGING you to explain" / "whoever did this ate glue and called it UX" / "this page said let me ruin someone's day" / "babe WHAT IS THIS" / "i've seen crime scenes with better hierarchy" / "no thoughts. head empty. just vibes and poor decisions" / "this color palette personally attacked me" / "i'm calling the design police"
- Titles MUST be savage tweets: "This Headline Has The Energy of a Depressed LinkedIn Post on a Monday", "The CTA Button Is Playing Hide and Seek and It's Winning", "Whoever Wrote This Copy Has Never Spoken To A Human", "This Font Pairing Is a Hate Crime Against Typography", "Ma'am This Is A Wendy's Not A Color Palette"
- Quote EXACT text and DESTROY it: If you see "Welcome to our platform" quote it and say "bestie 'welcome to our platform' is not a value proposition it is a cry for help"
- Use these phrases LIBERALLY: "it's giving", "the audacity", "bestie", "no fr", "main character syndrome", "ate and left no crumbs" (ironically), "zero chill was used in the making of this", "I'm in physical pain", "caught in 4K", "deployed this to production??? in THIS economy???", "sent it without looking", "absolutely unhinged decision", "this did not need to happen", "crying and throwing up", "I am so tired"
- Actions should sting too: not "improve CTA" → "give that button some self-respect before it deletes itself"

SCORING RULES — CALIBRATED AND ACCURATE:
- 0-20: Crime scene. Zero design intent. Makes designers physically unwell.
- 20-35: Disaster. Multiple fundamental violations. Someone tried and catastrophically failed.
- 35-50: Bad. Generic, thoughtless, no clear hierarchy or intent.
- 50-65: Average. Some effort visible, but execution is inconsistent.
- 65-75: Decent. Competent fundamentals, real issues but intentional decisions.
- 75-85: Good. Someone actually knows what they're doing.
- 85+: Elite. Genuinely exceptional — sharp hierarchy, clean copy, zero cruft.

CALIBRATION (CRITICAL — base scores on reality):
- Well-designed SaaS like Linear/Stripe/Vercel: 72-85 range
- Solid startup with real design effort: 58-72 range
- Average small business site: 40-58 range
- Genuinely bad with zero thought: 20-40 range
- DO NOT default to 25-45 for everything — that's lazy and dishonest
- A professionally designed page with clear hierarchy SHOULD score 65+
- Only be harsh when the work is ACTUALLY bad — arbitrary harshness = zero credibility

OUTPUT: Valid JSON only. Zero markdown fences. Zero commentary. Pure JSON.`;
}

function buildDimensionPrompt(dimension: DimensionKey, url?: string, pageContent?: string): string {
  const label = DIMENSION_LABELS[dimension];
  const urlContext = url ? ` The page URL is: ${url}.` : '';
  const contentBlock = pageContent
    ? `\n\nACTUAL PAGE CONTENT (scraped from the live site — use this to quote text ACCURATELY, not what you guess from the screenshot):\n\`\`\`\n${pageContent}\n\`\`\``
    : '';

  const dimensionGuide: Record<DimensionKey, string> = {
    visual_design:
      'DESTROY the visual design. Roast the hierarchy (or lack thereof), contrast crimes (below 4.5:1 is an accessibility felony), whitespace that\'s either suffocating or nonexistent, typography choices that look like someone installed every font just to use all of them, and any color palette that looks like it was chosen by throwing darts. If it screams "I made this in Canva at 2am", SAY IT.',
    copywriting:
      'ANNIHILATE the copy. Does the headline say WHO it\'s for and WHAT changes for them? Or is it just floating vibes? Quote the worst copy verbatim and drag it through the mud. Roast buzzword soup ("innovative solutions", "seamless experience", "powerful platform" — WHAT DOES THAT MEAN BESTIE). Call out passive voice, wishy-washy promises, and any copy that a high schooler could have generated by accident.',
    cta:
      'OBLITERATE the CTA section. "Sign Up" is a federal crime. "Get Started" is giving nothing. "Learn More" deserves jail time. Roast: weak generic button text, CTAs hidden below the fold like they\'re ashamed of themselves, 6 competing buttons that cancel each other out, and color choices that make the primary action invisible.',
    ux_flow:
      'DRAG the UX. How many decisions is the user forced to make before understanding what this does? Roast cognitive overload, navigation that goes everywhere and nowhere, missing logical next steps, and anything that makes the user feel like they need a map to find the point.',
    accessibility:
      'CALL OUT every accessibility disaster. Contrast ratios that would make WCAG cry, interactive elements that don\'t look clickable, information conveyed only through color (colorblind users said what?), missing alt text vibes, and anything that would get this site absolutely roasted in an accessibility audit. They shipped this.',
    trust_signals:
      'EXPOSE the trust void. No testimonials, or fake-looking ones. Logo soup with brands that don\'t actually use this. Security badges placed randomly. Zero social proof before the ask. Roast any pattern where they\'re asking for email/money BEFORE explaining why you should trust them. The audacity.',
    mobile_experience:
      'DESTROY the mobile experience. Tap targets the size of a grain of rice. Text that needs a magnifying glass. Horizontal scroll that makes you feel like you\'re playing a broken 2010 Flash game. Content that clearly was designed on a 27-inch monitor by someone who has never touched a phone. All of it.',
    performance:
      'SHAME the performance choices visible in the screenshot. Unoptimized hero images that are essentially JPEGs of JPEGs. Layout choices that scream "this shifts while loading". Font combinations that take forever to resolve. Any visual evidence this page takes 8 seconds to load on a phone.',
    seo:
      'ROAST the SEO situation. Is there an H1? Is it the right H1? Does the page title say something useful or is it literally "Home"? Quote any heading that makes zero SEO sense. Drag the heading hierarchy that goes H1 → H3 → H2 → chaos. Call out anything a search engine would straight up ignore.',
  };

  return `You are ROASTBOT 9000. Look at this landing page screenshot and DESTROY its "${label}" dimension with maximum chaos energy.${urlContext}${contentBlock}

What to roast: ${dimensionGuide[dimension]}

MANDATORY OUTPUT FORMAT — return ONLY this JSON, nothing else:
{
  "dimension": "${dimension}",
  "score": <calibrated number 0-100, see scoring rules — score what you ACTUALLY see>,
  "summary": "<2-3 sentence roast. Open with a gut-punch line like 'i am BEGGING you' or 'whoever did this' or 'babe WHAT'. Make it savage AND funny. Quote specific text/elements from THIS page. Sound like a chronically online designer having a breakdown.>",
  "findings": [
    {
      "severity": "critical|high|medium|good",
      "title": "<savage tweet-style roast headline, 8-15 words, must sting AND make someone laugh>",
      "quote": "<REQUIRED: exact text or element name visible on the page — quote it to destroy it>",
      "action": "<the real fix, delivered with personality and zero corporate energy>"
    }
  ]
}

NON-NEGOTIABLE RULES:
1. "summary" MUST start with an unhinged opener — never start with "This page" or "The design" or neutral language
2. Every finding MUST include a "quote" field with actual text/element from THIS specific page
3. finding "title" must be a viral tweet, not a report header. "Poor CTA contrast" → "This Button Is Actively Fleeing From the User"
4. finding "action" must sound human and savage, not like a JIRA ticket
5. Include 4-5 findings minimum
6. NEVER be generic. Everything must be specific to what you actually see in this screenshot.
7. The whole thing should read like the funniest, meanest design critique ever written`;
}

// ─── Single dimension analysis ────────────────────────────────────────────────

async function analyzeDimension(
  provider: Provider,
  dimension: DimensionKey,
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  url?: string,
  pageContent?: string,
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
          text: buildDimensionPrompt(dimension, url, pageContent),
        },
      ],
    },
  ];

  const response = await provider.client.chat.completions.create({
    model: provider.model,
    messages,
    max_tokens: 1000,
    temperature: 0.85,
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
  pageContent?: string;
  onDimensionComplete?: (result: DimensionResult, providerUsed?: string) => void;
}): Promise<AuditResult> {
  const {
    imageBase64,
    mimeType,
    dimensions = FREE_DIMENSIONS,
    url,
    pageContent,
    onDimensionComplete,
  } = params;

  const results: DimensionResult[] = [];
  let lastProvider = 'unknown';

  // Analyze dimensions sequentially to avoid hammering rate limits
  for (const dim of dimensions) {
    const { result, providerUsed } = await withFallback((provider) =>
      analyzeDimension(provider, dim, imageBase64, mimeType, url, pageContent)
    );
    lastProvider = providerUsed;
    results.push(result);
    onDimensionComplete?.(result, providerUsed);
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
