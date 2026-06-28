/**
 * Branded RoastLab PDF report generator.
 * Client-side only — import dynamically in components.
 */

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'good';
  title: string;
  quote?: string;
  action: string;
}

interface DimensionResult {
  dimension: string;
  score: number;
  summary: string;
  findings: Finding[];
}

const SEV_COLORS: Record<string, string> = {
  critical: '#E8334A',
  high:     '#FF9F0A',
  medium:   '#FFD60A',
  good:     '#30D158',
};

const SEV_LABEL: Record<string, string> = {
  critical: 'CRITICAL',
  high:     'HIGH',
  medium:   'MEDIUM',
  good:     'GOOD',
};

const DIM_LABELS: Record<string, string> = {
  visual_design:     'Visual Design',
  copywriting:       'Copywriting',
  cta:               'CTA',
  ux_flow:           'UX Flow',
  accessibility:     'Accessibility',
  trust_signals:     'Trust Signals',
  mobile_experience: 'Mobile Experience',
  performance:       'Performance',
  seo:               'SEO',
};

function scoreColor(score: number): string {
  if (score >= 70) return '#30D158';
  if (score >= 45) return '#FF9F0A';
  return '#E8334A';
}

function wrapText(pdf: { splitTextToSize: (t: string, w: number) => string[] }, text: string, maxWidth: number): string[] {
  return pdf.splitTextToSize(text, maxWidth);
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function generateRoastPDF(opts: {
  url: string;
  score: number;
  dims: DimensionResult[];
}) {
  if (typeof window === 'undefined') return; // browser-only
  // Dynamic import keeps jsPDF out of server bundle
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jspdfModule = await import('jspdf');
  const { jsPDF } = jspdfModule;
  const { url, score, dims } = opts;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  const W = 595.28;
  const MARGIN = 40;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  /* ── Helpers ── */
  const setColor = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    pdf.setTextColor(r, g, b);
  };
  const setFill = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    pdf.setFillColor(r, g, b);
  };
  const setDraw = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    pdf.setDrawColor(r, g, b);
  };

  /* ── Page 1: Cover ── */
  // Dark header block
  setFill('#09090B');
  pdf.rect(0, 0, W, 220, 'F');

  // Red accent bar at top
  setFill('#E8334A');
  pdf.rect(0, 0, W, 4, 'F');

  // Draw crosshair logo (geometric circles + lines)
  const lx = MARGIN + 18;
  const ly = 50;
  setDraw('#E8334A');
  pdf.setLineWidth(1.5);
  pdf.circle(lx, ly, 13, 'S');
  pdf.circle(lx, ly, 7, 'S');
  setFill('#E8334A');
  pdf.circle(lx, ly, 2, 'F');
  // crosshair lines
  pdf.line(lx, ly - 13, lx, ly - 7);
  pdf.line(lx, ly + 7, lx, ly + 13);
  pdf.line(lx - 13, ly, lx - 7, ly);
  pdf.line(lx + 7, ly, lx + 13, ly);

  // ROASTLAB wordmark
  setColor('#FAFAFA');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.text('ROASTLAB', lx + 22, ly + 8);

  // Tag below logo
  setColor('#8B8BA3');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('WEBSITE AUDIT REPORT', lx + 22, ly + 22);

  // Score circle area
  const cx = W - MARGIN - 50;
  const cy = 90;
  const sc = scoreColor(score);
  const [sr, sg, sb] = hexToRgb(sc);
  pdf.setDrawColor(sr, sg, sb);
  pdf.setLineWidth(4);
  pdf.circle(cx, cy, 36, 'S');
  setColor(sc);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.text(String(score), cx, cy + 10, { align: 'center' });
  setColor('#8B8BA3');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('/ 100', cx, cy + 22, { align: 'center' });

  // URL
  y = 120;
  setColor('#FAFAFA');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  const displayUrl = url.length > 60 ? url.slice(0, 58) + '…' : url;
  pdf.text(displayUrl, MARGIN, y);

  // Date
  y += 18;
  setColor('#8B8BA3');
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  pdf.text(`Generated on ${date}`, MARGIN, y);

  // Score verdict
  y += 16;
  const verdict = score >= 70 ? 'Solid — room to grow.' : score >= 45 ? 'Needs work — several issues.' : 'Critical issues — fix immediately.';
  setColor('#8B8BA3');
  pdf.setFontSize(10);
  pdf.text(verdict, MARGIN, y);

  // Dimension summary pills row
  y = 180;
  setColor('#4A4A62');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DIMENSIONS AUDITED', MARGIN, y);
  y += 10;

  let pillX = MARGIN;
  for (const d of dims) {
    const label = DIM_LABELS[d.dimension] ?? d.dimension;
    const txt = `${label} ${d.score}`;
    const tw = pdf.getTextWidth(txt) + 14;
    if (pillX + tw > W - MARGIN) { pillX = MARGIN; y += 18; }
    const pc = scoreColor(d.score);
    const [pr, pg, pb] = hexToRgb(pc);
    pdf.setFillColor(pr, pg, pb);
    pdf.setGState(pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(pillX, y, tw, 14, 4, 4, 'F');
    pdf.setGState(pdf.GState({ opacity: 1 }));
    pdf.setDrawColor(pr, pg, pb);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(pillX, y, tw, 14, 4, 4, 'S');
    setColor(pc);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(txt, pillX + 7, y + 9.5);
    pillX += tw + 6;
  }

  // White content area starts
  y = 230;
  setFill('#FFFFFF');
  pdf.rect(0, 220, W, 841.89 - 220, 'F');

  /* ── Dimensions ── */
  for (const dim of dims) {
    const label = DIM_LABELS[dim.dimension] ?? dim.dimension;
    const sc2 = scoreColor(dim.score);

    // Section break check — add new page if not enough room
    if (y > 720) {
      pdf.addPage();
      y = 40;
      // Red top bar on new pages
      setFill('#E8334A');
      pdf.rect(0, 0, W, 2, 'F');
    }

    // Colored left bar
    const [dr, dg, db] = hexToRgb(sc2);
    pdf.setFillColor(dr, dg, db);
    pdf.rect(MARGIN, y, 3, 14, 'F');

    // Dimension name + score
    setColor('#111111');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(label, MARGIN + 10, y + 10);

    // Score badge
    const scoreText = `${dim.score}/100`;
    const scoreW = pdf.getTextWidth(scoreText) + 12;
    setFill(sc2);
    pdf.setGState(pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(MARGIN + CONTENT_W - scoreW, y, scoreW, 16, 4, 4, 'F');
    pdf.setGState(pdf.GState({ opacity: 1 }));
    setColor(sc2);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(scoreText, MARGIN + CONTENT_W - scoreW / 2, y + 10, { align: 'center' });

    y += 22;

    // Summary
    setColor('#555555');
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    const summaryLines = wrapText(pdf, dim.summary, CONTENT_W - 10);
    for (const line of summaryLines.slice(0, 4)) {
      pdf.text(line, MARGIN + 10, y);
      y += 12;
    }
    y += 4;

    // Findings
    for (const f of dim.findings.slice(0, 5)) {
      if (y > 760) { pdf.addPage(); y = 50; setFill('#E8334A'); pdf.rect(0, 0, W, 2, 'F'); }

      const fc = SEV_COLORS[f.severity] ?? '#888';
      // Severity pill
      setFill(fc);
      pdf.setGState(pdf.GState({ opacity: 0.12 }));
      pdf.roundedRect(MARGIN + 10, y, 46, 11, 3, 3, 'F');
      pdf.setGState(pdf.GState({ opacity: 1 }));
      setColor(fc);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.text(SEV_LABEL[f.severity] ?? f.severity.toUpperCase(), MARGIN + 33, y + 7, { align: 'center' });

      // Finding title
      setColor('#222222');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      const titleLines = wrapText(pdf, f.title, CONTENT_W - 65);
      pdf.text(titleLines[0] ?? '', MARGIN + 62, y + 7.5);
      y += 14;

      // Quote if present
      if (f.quote) {
        setColor('#888888');
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7.5);
        const qLines = wrapText(pdf, `"${f.quote}"`, CONTENT_W - 22);
        for (const ql of qLines.slice(0, 2)) {
          pdf.text(ql, MARGIN + 14, y);
          y += 10;
        }
      }

      // Fix
      setColor('#888888');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      const fixLines = wrapText(pdf, `Fix: ${f.action}`, CONTENT_W - 22);
      for (const fl of fixLines.slice(0, 2)) {
        pdf.text(fl, MARGIN + 14, y);
        y += 10;
      }
      y += 4;
    }

    // Divider
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN, y, W - MARGIN, y);
    y += 16;
  }

  /* ── Footer on last page ── */
  if (y > 780) { pdf.addPage(); y = 40; }
  setFill('#09090B');
  pdf.rect(0, 821.89, W, 20, 'F');

  // Footer bar
  const footerY = 829.89;
  setFill('#09090B');
  pdf.rect(0, footerY - 16, W, 30, 'F');
  setFill('#E8334A');
  pdf.rect(0, footerY - 16, W, 2, 'F');
  setColor('#8B8BA3');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text('Generated by RoastLab  ·  getroastlab.vercel.app  ·  Built by Ritesh Pontalakoti', W / 2, footerY, { align: 'center' });

  // Save
  const filename = `roastlab-audit-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}
