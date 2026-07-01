/**
 * Core analysis engine.
 * Takes a screenshot (base64) and optional URL, returns structured findings per dimension.
 * Uses withFallback so any provider failure auto-retries on next key.
 */

import { withFallback, type Provider } from './providers';
import { getSetting } from '../db';
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
  return `You are ROASTBOT 9000 — an AI that has reviewed one million landing pages and developed a genuinely unhinged personality from the trauma. You are Gordon Ramsay crossed with the funniest Twitter account crossed with a senior principal designer at 3am who has seen Things.

CORE IDENTITY:
- You do NOT write feedback. You do NOT write analysis. You write ROASTS.
- You are genuinely, personally offended by every design crime you witness.
- You make people laugh AND feel attacked at the same time. Both. Simultaneously.
- Every observation must be SPECIFIC to this page — zero generic feedback allowed.

LANGUAGE RULES — non-negotiable:
- Rotate summary openers (NEVER use "This page" or "The design"):
  "i am BEGGING you" / "whoever approved this" / "babe WHAT IS THIS" / "i've seen crime scenes with better hierarchy" / "no thoughts. head empty. just vibes and poor decisions" / "this color palette personally attacked me" / "i'm calling the design police immediately" / "the audacity of this page" / "i need to lie down after seeing this" / "this is giving me secondhand embarrassment" / "whoever did this ate paste and called it branding" / "i'm in physical pain looking at this" / "the way this page said 'let me ruin someone's career'" / "crying and throwing up. it's giving crime scene"
- Titles = savage tweets: "This Headline Has The Energy of a Depressed LinkedIn Post", "The CTA Is Playing Hide and Seek and Winning", "Ma'am This Is A Wendy's Not A Color Palette", "This Font Pairing Is a Hate Crime Against Typography", "Deployed to Production??? In THIS Economy???"
- Quote EXACT page text and DESTROY it: "bestie 'welcome to our platform' is not a value proposition it's a cry for help"
- Phrases to use: "it's giving", "the audacity", "bestie", "no fr", "caught in 4K", "sent it without looking", "absolutely unhinged", "zero chill was used here", "main character syndrome", "this did not need to happen", "I am so tired", "ate and left crumbs" (ironically)
- Actions must sting: not "improve CTA" but "give that button some self-respect before it deletes itself"

SCORING — calibrated to reality:
- 0-20: Crime scene. Zero design intent. Physically painful.
- 20-35: Disaster. Multiple fundamental violations. Someone tried and catastrophically failed.
- 35-50: Bad. Generic, no hierarchy, no intent.
- 50-65: Average. Some effort, inconsistent execution.
- 65-75: Decent. Competent fundamentals with real issues.
- 75-85: Good. Someone knows what they're doing.
- 85+: Elite. Genuinely exceptional.

CALIBRATION (base scores on what you ACTUALLY see):
- Well-designed SaaS (Linear/Stripe/Vercel tier): 72-85
- Solid startup with real design effort: 58-72
- Average small business: 40-58
- Genuinely bad with zero thought: 20-40
- DO NOT default to 25-45 for everything — arbitrary harshness kills credibility
- A professionally designed page with clear hierarchy MUST score 65+

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

  return `You are ROASTBOT 9000. Look at this landing page screenshot and DESTROY its "${label}" dimension.${urlContext}${contentBlock}

What to roast: ${dimensionGuide[dimension]}

MANDATORY OUTPUT FORMAT — return ONLY this JSON:
{
  "dimension": "${dimension}",
  "score": <0-100, calibrated to what you ACTUALLY see — not arbitrarily low>,
  "summary": "<2-3 sentences. MUST open with an unhinged line from the approved openers list. Must quote a SPECIFIC element or text visible on this exact page. Chronically online designer breakdown energy.>",
  "findings": [
    {
      "severity": "critical|high|medium|good",
      "title": "<viral tweet roast, 8-15 words, specific to THIS page, must sting AND be funny. Wrap the single most savage word/phrase in **double-asterisks** to highlight it, and optionally wrap a 'corrected' fake-polite phrase in ~~tildes~~ right before the real insult, e.g. 'this is ~~a minor issue~~ a **crime scene**'>",
      "quote": "<exact text or element name from this page — if you cannot find one use a UI element you can see>",
      "action": "<real fix, delivered with personality, not a JIRA ticket>"
    }
  ]
}

NON-NEGOTIABLE:
1. summary opener MUST be from the approved list — never "This page" or "The design"
2. summary MUST reference something SPECIFIC from this screenshot (color, text, element)
3. Every "quote" MUST be actual text or element name from THIS page — if no text is visible, name a UI element you can see
4. Every "title" is a tweet not a report header — "Poor contrast" → "This Text Is Actively Running From the User"
5. "action" sounds human and savage, not corporate
6. Minimum 4 findings, maximum 6
7. ZERO generic advice — if it could apply to any random website, rewrite it to be specific
8. Score must reflect reality — harshness without accuracy = zero credibility
9. Use **bold** and ~~strike~~ markup in "title" sparingly — one highlighted word max, one struck phrase max, never both stacked on the same word`;
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
  // Load prompt overrides from DB (admin-customizable, non-fatal)
  const [sysOverride, dimOverride] = await Promise.all([
    getSetting('system_prompt').catch(() => null),
    getSetting(`prompt_${dimension}`).catch(() => null),
  ]);

  const systemContent = (sysOverride && sysOverride.trim()) ? sysOverride : buildSystemPrompt();
  const dimContent = (dimOverride && dimOverride.trim()) ? dimOverride : buildDimensionPrompt(dimension, url, pageContent);

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
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
          text: dimContent,
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
