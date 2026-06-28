/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RoastLab PDF report — uses jsPDF for a real .pdf download (no browser print dialog).
 * Dynamic import keeps jsPDF out of the main bundle.
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
  if (score >= 70) return [48, 209, 88];
  if (score >= 45) return [255, 159, 10];
  return [232, 51, 74];
}

function scoreLabel(score: number): string {
  if (score >= 75) return "GOOD";
  if (score >= 50) return "NEEDS WORK";
  if (score >= 30) return "BAD";
  return "CRITICAL";
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export async function generateRoastPDF(opts: { url: string; score: number; dims: any[] }): Promise<void> {
  if (typeof window === "undefined") return;

  const { jsPDF } = await import("jspdf");

  const { url, score, dims } = opts;
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const scolor = scoreColor(score);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;

  /* ── helpers ─────────────────────────────────────────── */
  function setColor(rgb: [number, number, number]) {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  }
  function setFillColor(rgb: [number, number, number], alpha = 1) {
    if (alpha < 1) {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    } else {
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    }
  }
  function newPageIfNeeded(y: number, needed = 20): number {
    if (y + needed > 275) {
      doc.addPage();
      return 18;
    }
    return y;
  }

  /* ── COVER PAGE ──────────────────────────────────────── */
  // Background
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 297, "F");

  // Red top bar
  doc.setFillColor(232, 51, 74);
  doc.rect(0, 0, W, 1.5, "F");

  // Logo wordmark
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

  // Score ring (simulated with circles)
  const cx = W - MARGIN - 22;
  const cy = 85;

  doc.setDrawColor(scolor[0], scolor[1], scolor[2]);
  doc.setLineWidth(2);
  doc.circle(cx, cy, 18, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(scolor);
  const scoreStr = String(score);
  const scoreW = doc.getTextWidth(scoreStr);
  doc.text(scoreStr, cx - scoreW / 2, cy + 3);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 139, 163);
  doc.text("/100", cx - 4, cy + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setColor(scolor);
  const sl = scoreLabel(score);
  const slW = doc.getTextWidth(sl);
  doc.text(sl, cx - slW / 2, cy + 14);

  // URL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(232, 51, 74);
  doc.text("FULL AUDIT REPORT", MARGIN, 55);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(240, 239, 248);
  const urlLines = doc.splitTextToSize(truncate(url, 80), CONTENT_W - 50);
  doc.text(urlLines, MARGIN, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(139, 139, 163);
  doc.text(`Generated: ${date}`, MARGIN, 78);
  doc.text(`Dimensions: ${dims.length}`, MARGIN, 83);

  // Dimension pills row
  let px = MARGIN;
  const py = 96;
  dims.forEach((d: any) => {
    const dc = scoreColor(d.score);
    const label = (DIM_LABELS[d.dimension] ?? d.dimension).slice(0, 12) + " " + d.score;
    const lw = doc.getTextWidth(label) + 6;
    if (px + lw > W - MARGIN) return;

    doc.setFillColor(dc[0], dc[1], dc[2]);
    doc.setGState({ opacity: 0.08 } as any);
    doc.roundedRect(px, py - 4, lw, 7, 1, 1, "F");
    doc.setGState({ opacity: 1 } as any);

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
  doc.text("Built by Ritesh Bonthalakoti · Confidential", W - MARGIN - doc.getTextWidth("Built by Ritesh Bonthalakoti · Confidential"), 285);
  doc.setDrawColor(30, 30, 40);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 278, W - MARGIN, 278);

  /* ── CONTENT PAGES ───────────────────────────────────── */
  doc.addPage();
  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, W, 297, "F");

  // Page header
  doc.setFillColor(232, 51, 74);
  doc.circle(MARGIN + 2, 16, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(250, 250, 250);
  doc.text("ROASTLAB", MARGIN + 7, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(139, 139, 163);
  doc.text(truncate(url, 55), W - MARGIN - doc.getTextWidth(truncate(url, 55)), 15);
  doc.text(date, W - MARGIN - doc.getTextWidth(date), 20);

  doc.setDrawColor(30, 30, 40);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 23, W - MARGIN, 23);

  let y = 32;

  dims.forEach((d: any, di: number) => {
    const dc = scoreColor(d.score);
    const dimLabel = DIM_LABELS[d.dimension] ?? d.dimension;
    const findings: any[] = d.findings ?? [];

    // Estimate height needed
    const summaryLines = doc.splitTextToSize(d.summary ?? "", CONTENT_W - 55);
    const cardHeight = 12 + summaryLines.length * 4.5 + findings.length * 18 + 8;

    y = newPageIfNeeded(y, cardHeight);

    // Add new page header if we added a page
    if (y === 18 && di > 0) {
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
      doc.text(truncate(url, 55), W - MARGIN - doc.getTextWidth(truncate(url, 55)), 15);
      doc.setDrawColor(30, 30, 40);
      doc.line(MARGIN, 23, W - MARGIN, 23);
      y = 32;
    }

    // Card background
    doc.setFillColor(17, 17, 23);
    doc.roundedRect(MARGIN, y, CONTENT_W, cardHeight, 3, 3, "F");

    // Left colored bar
    doc.setFillColor(dc[0], dc[1], dc[2]);
    doc.roundedRect(MARGIN, y, 2, cardHeight, 1, 1, "F");

    // Dim name + score
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(dc);
    doc.text(dimLabel.toUpperCase(), MARGIN + 6, y + 7);

    // Score badge
    const scoreX = W - MARGIN - 16;
    const scoreY = y + 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    setColor(dc);
    doc.text(String(d.score), scoreX, scoreY);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(74, 74, 98);
    doc.text("/100", scoreX + 6, scoreY);

    // Summary
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(180, 180, 200);
    doc.text(summaryLines, MARGIN + 6, y + 13);

    let fy = y + 13 + summaryLines.length * 4.5 + 3;

    // Findings
    findings.forEach((f: any) => {
      const fc = SEV_COLOR[f.severity] ?? [136, 136, 136];

      // Sev tag
      doc.setFillColor(fc[0], fc[1], fc[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      setColor(fc);
      doc.text(SEV_LABEL[f.severity] ?? f.severity.toUpperCase(), MARGIN + 6, fy + 3.5);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(220, 220, 240);
      const titleLines = doc.splitTextToSize(f.title ?? "", CONTENT_W - 30);
      doc.text(titleLines, MARGIN + 28, fy + 3.5);

      fy += titleLines.length * 4 + 3;

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
