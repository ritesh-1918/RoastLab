/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RoastLab PDF report — uses jsPDF for a real .pdf download (no browser print dialog).
 * Dynamic import keeps jsPDF out of the main bundle.
 * Mirrors the site's roast tone: verdict headline, quotes, emphasis markup rendered
 * as actual bold/strike text instead of raw markdown-style markers.
 */

const SEV_COLOR: Record<string, [number, number, number]> = {
  critical: [232, 51, 74],
  high:     [255, 159, 10],
  medium:   [255, 214, 10],
  good:     [48,  209, 88],
};
const SEV_LABEL: Record<string, string> = {
  critical: "CRITICAL",
  high:     "HIGH",
  medium:   "MEDIUM",
  good:     "GOOD",
};
const DIM_LABELS: Record<string, string> = {
  visual_design:     "Visual Design",
  copywriting:       "Copywriting",
  cta:               "CTA",
  ux_flow:           "UX Flow",
  accessibility:     "Accessibility",
  trust_signals:     "Trust Signals",
  mobile_experience: "Mobile Experience",
  performance:       "Performance",
  seo:               "SEO",
};

function scoreColor(score: number): [number, number, number] {
  if (score >= 75) return [50, 215, 75];
  if (score >= 60) return [255, 214, 10];
  if (score >= 40) return [255, 159, 10];
  if (score >= 20) return [255, 107, 0];
  return [255, 45, 85];
}

// Mirrors app/analyze/page.tsx scoreMeta() so the PDF verdict matches the site
function scoreVerdict(s: number): { grade: string; verdict: string; vibe: string } {
  if (s >= 75) return { grade: "A", verdict: "actually fire", vibe: "understood the assignment" };
  if (s >= 60) return { grade: "B", verdict: "mid but has potential", vibe: "participation trophy behavior" };
  if (s >= 40) return { grade: "C", verdict: "bestie what is this", vibe: "deployed and prayed" };
  if (s >= 20) return { grade: "D", verdict: "it's giving disaster", vibe: "I am in physical pain" };
  return { grade: "F", verdict: "call 911 immediately", vibe: "sent it without looking" };
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// Splits "plain **bold** more ~~struck~~ text" into typed segments so the PDF
// can render real bold/strikethrough instead of printing literal asterisks.
type Segment = { text: string; bold: boolean; strike: boolean };
function parseEmphasis(raw: string): Segment[] {
  const parts = (raw ?? "").split(/(\*\*[^*]+\*\*|~~[^~]+~~)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) return { text: part.slice(2, -2), bold: true, strike: false };
    if (part.startsWith("~~") && part.endsWith("~~")) return { text: part.slice(2, -2), bold: false, strike: true };
    return { text: part, bold: false, strike: false };
  });
}

export async function generateRoastPDF(opts: { url: string; score: number; dims: any[] }): Promise<void> {
  if (typeof window === "undefined") return;

  const { jsPDF } = await import("jspdf");

  const { url, score, dims } = opts;
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const scolor = scoreColor(score);
  const verdict = scoreVerdict(score);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;

  /* ── helpers ─────────────────────────────────────────── */
  function setColor(rgb: [number, number, number]) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  function newPageIfNeeded(y: number, needed = 20): number {
    if (y + needed > 275) {
      doc.addPage();
      return 18;
    }
    return y;
  }

  // Renders segments (bold/strike aware) wrapped to maxWidth, returns final y.
  function drawRichText(
    segments: Segment[], x: number, y: number, maxWidth: number,
    opts2: { size: number; color: [number, number, number]; lineHeight?: number; italic?: boolean }
  ): number {
    const { size, color, lineHeight = size * 0.42, italic = false } = opts2;
    doc.setFontSize(size);
    let cx = x;
    let cy = y;
    for (const seg of segments) {
      const words = seg.text.split(/(\s+)/);
      for (const word of words) {
        if (!word) continue;
        doc.setFont("helvetica", seg.bold ? "bold" : italic ? "italic" : "normal");
        const w = doc.getTextWidth(word);
        if (cx + w > x + maxWidth && word.trim() !== "") {
          cx = x;
          cy += lineHeight;
        }
        setColor(seg.strike ? [color[0] * 0.6, color[1] * 0.6, color[2] * 0.6] : color);
        doc.text(word, cx, cy);
        if (seg.strike && word.trim()) {
          doc.setDrawColor(color[0], color[1], color[2]);
          doc.setLineWidth(0.25);
          doc.line(cx, cy - size * 0.12, cx + w, cy - size * 0.12);
        }
        cx += w;
      }
    }
    return cy;
  }

  function estimateRichLines(segments: Segment[], maxWidth: number, size: number): number {
    doc.setFontSize(size);
    let cx = 0;
    let lines = 1;
    for (const seg of segments) {
      const words = seg.text.split(/(\s+)/);
      for (const word of words) {
        if (!word) continue;
        doc.setFont("helvetica", seg.bold ? "bold" : "normal");
        const w = doc.getTextWidth(word);
        if (cx + w > maxWidth && word.trim() !== "") { cx = 0; lines++; }
        cx += w;
      }
    }
    return lines;
  }

  /* ── COVER PAGE ──────────────────────────────────────── */
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 297, "F");
  doc.setFillColor(232, 51, 74);
  doc.rect(0, 0, W, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(250, 250, 250);
  doc.text("ROAST", MARGIN, 24);
  doc.setTextColor(232, 51, 74);
  doc.text("LAB", MARGIN + 28, 24);

  doc.setFontSize(8);
  doc.setTextColor(139, 139, 163);
  doc.setFont("helvetica", "normal");
  doc.text("Website Audit Report", MARGIN, 30);

  // Score ring
  const cx0 = W - MARGIN - 22;
  const cy0 = 85;
  doc.setDrawColor(scolor[0], scolor[1], scolor[2]);
  doc.setLineWidth(2);
  doc.circle(cx0, cy0, 18, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(scolor);
  const scoreStr = String(score);
  doc.text(scoreStr, cx0 - doc.getTextWidth(scoreStr) / 2, cy0 + 3);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 139, 163);
  doc.text("/100", cx0 - 4, cy0 + 8);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setColor(scolor);
  const gradeW = doc.getTextWidth(verdict.grade);
  doc.text(verdict.grade, cx0 - gradeW / 2, cy0 + 15);

  // URL + verdict headline (mirrors site's DAMAGE REPORT tone)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(232, 51, 74);
  doc.text("FULL AUDIT REPORT", MARGIN, 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(240, 239, 248);
  const urlLines = doc.splitTextToSize(truncate(url, 80), CONTENT_W - 50);
  doc.text(urlLines, MARGIN, 62);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  setColor(scolor);
  doc.text(`"${verdict.verdict}"`, MARGIN, 62 + urlLines.length * 6 + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 130);
  doc.text(verdict.vibe, MARGIN, 62 + urlLines.length * 6 + 9);

  doc.setFontSize(9);
  doc.setTextColor(139, 139, 163);
  doc.text(`Generated: ${date}`, MARGIN, 78 + urlLines.length * 6);
  doc.text(`Dimensions analyzed: ${dims.length}`, MARGIN, 83 + urlLines.length * 6);

  // Dimension pills row
  let px = MARGIN;
  const py = 98 + urlLines.length * 6;
  dims.forEach((d: any) => {
    const dc = scoreColor(d.score);
    const label = (DIM_LABELS[d.dimension] ?? d.dimension).slice(0, 12) + " " + d.score;
    const lw = doc.getTextWidth(label) + 6;
    if (px + lw > W - MARGIN) return;

    doc.setDrawColor(dc[0], dc[1], dc[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(px, py - 4, lw, 7, 1, 1, "S");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setColor(dc);
    doc.text(label, px + 3, py + 1.2);
    px += lw + 4;
  });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(74, 74, 98);
  doc.text("getroastlab.vercel.app", MARGIN, 285);
  doc.text("Confidential — for internal use", W - MARGIN - doc.getTextWidth("Confidential — for internal use"), 285);
  doc.setDrawColor(30, 30, 40);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 278, W - MARGIN, 278);

  /* ── CONTENT PAGES ───────────────────────────────────── */
  function drawPageHeader() {
    doc.setFillColor(9, 9, 11);
    doc.rect(0, 0, W, 297, "F");
    doc.setFillColor(232, 51, 74);
    doc.circle(MARGIN + 2, 16, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(250, 250, 250);
    doc.text("ROASTLAB", MARGIN + 7, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(139, 139, 163);
    const truncUrl = truncate(url, 55);
    doc.text(truncUrl, W - MARGIN - doc.getTextWidth(truncUrl), 15);
    doc.text(date, W - MARGIN - doc.getTextWidth(date), 20);
    doc.setDrawColor(30, 30, 40);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 23, W - MARGIN, 23);
  }

  doc.addPage();
  drawPageHeader();
  let y = 32;

  dims.forEach((d: any, di: number) => {
    const dc = scoreColor(d.score);
    const dimLabel = DIM_LABELS[d.dimension] ?? d.dimension;
    const findings: any[] = d.findings ?? [];

    const summarySegs = parseEmphasis(d.summary ?? "");
    const summaryLineCount = estimateRichLines(summarySegs, CONTENT_W - 12, 8.5);

    // Estimate card height including quotes now rendered
    const findingsHeight = findings.reduce((acc: number, f: any) => {
      const titleSegs = parseEmphasis(f.title ?? "");
      const titleLines = estimateRichLines(titleSegs, CONTENT_W - 30, 8);
      const quoteLines = f.quote ? doc.splitTextToSize(`"${f.quote}"`, CONTENT_W - 14).length : 0;
      const actionLines = doc.splitTextToSize("→ " + (f.action ?? ""), CONTENT_W - 12).length;
      return acc + titleLines * 4 + quoteLines * 3.6 + actionLines * 3.8 + 6;
    }, 0);
    const cardHeight = 12 + summaryLineCount * 4.5 + findingsHeight + 8;

    y = newPageIfNeeded(y, cardHeight);
    if (y === 18 && di > 0) {
      doc.addPage();
      drawPageHeader();
      y = 32;
    }

    // Card background
    doc.setFillColor(17, 17, 23);
    doc.roundedRect(MARGIN, y, CONTENT_W, cardHeight, 3, 3, "F");
    doc.setFillColor(dc[0], dc[1], dc[2]);
    doc.roundedRect(MARGIN, y, 2, cardHeight, 1, 1, "F");

    // Dim name + score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(dc);
    doc.text(dimLabel.toUpperCase(), MARGIN + 6, y + 7);

    const scoreX = W - MARGIN - 16;
    doc.setFontSize(12);
    setColor(dc);
    doc.text(String(d.score), scoreX, y + 7);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(74, 74, 98);
    doc.text("/100", scoreX + 6, y + 7);

    // Summary — with real bold/strike rendering
    let ty = drawRichText(summarySegs, MARGIN + 6, y + 13, CONTENT_W - 12, {
      size: 8.5, color: [180, 180, 200], lineHeight: 4.5, italic: true,
    });
    let fy = ty + 6;

    // Findings — title (rich), quote block, action
    findings.forEach((f: any) => {
      const fc = SEV_COLOR[f.severity] ?? [136, 136, 136];

      doc.setFillColor(fc[0], fc[1], fc[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      setColor(fc);
      doc.text(SEV_LABEL[f.severity] ?? String(f.severity).toUpperCase(), MARGIN + 6, fy + 3.5);

      const titleSegs = parseEmphasis(f.title ?? "");
      const titleEndY = drawRichText(titleSegs, MARGIN + 28, fy + 3.5, CONTENT_W - 30, {
        size: 8, color: [220, 220, 240], lineHeight: 4,
      });
      fy = titleEndY + 4;

      // Quote block
      if (f.quote) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 150);
        const quoteLines = doc.splitTextToSize(`"${f.quote}"`, CONTENT_W - 14);
        doc.text(quoteLines, MARGIN + 8, fy);
        fy += quoteLines.length * 3.6 + 2;
      }

      // Action
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 130);
      const actionLines = doc.splitTextToSize("→ " + (f.action ?? ""), CONTENT_W - 12);
      doc.text(actionLines, MARGIN + 6, fy);
      fy += actionLines.length * 3.8 + 4;
    });

    y += cardHeight + 6;
  });

  // Last page footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(74, 74, 98);
  doc.text("RoastLab · getroastlab.vercel.app", MARGIN, 285);
  doc.text("© 2026 RoastLab", W - MARGIN - doc.getTextWidth("© 2026 RoastLab"), 285);
  doc.setDrawColor(30, 30, 40);
  doc.line(MARGIN, 278, W - MARGIN, 278);

  /* ── SAVE ────────────────────────────────────────────── */
  const filename = `roastlab-${url.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").slice(0, 40)}-${score}.pdf`;
  doc.save(filename);
}
