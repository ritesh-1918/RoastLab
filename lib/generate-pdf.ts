/**
 * Branded RoastLab PDF report.
 * Opens a new window with a fully-styled HTML report and triggers print.
 * CSS @media print ensures it looks like a real branded PDF, not browser-default.
 * Browser-only — call only from client components.
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

const SEV_COLOR: Record<string, string> = {
  critical: '#E8334A',
  high: '#FF9F0A',
  medium: '#FFD60A',
  good: '#30D158',
};

const SEV_LABEL: Record<string, string> = {
  critical: '💀 CRITICAL',
  high: '🔥 HIGH',
  medium: '😬 MEDIUM',
  good: '✅ GOOD',
};

const DIM_LABELS: Record<string, string> = {
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

function scoreColor(score: number) {
  if (score >= 70) return '#30D158';
  if (score >= 45) return '#FF9F0A';
  return '#E8334A';
}

function scoreLabel(score: number) {
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Bad';
  return 'Critical';
}

function buildHtml(url: string, score: number, dims: DimensionResult[]): string {
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const sc = scoreColor(score);

  const dimsHtml = dims.map(d => {
    const label = DIM_LABELS[d.dimension] ?? d.dimension;
    const dc = scoreColor(d.score);
    const findingsHtml = d.findings.map(f => {
      const fc = SEV_COLOR[f.severity] ?? '#888';
      return `
        <div class="finding">
          <div class="finding-header">
            <span class="sev-badge" style="background:${fc}22;color:${fc};border:1px solid ${fc}44">${SEV_LABEL[f.severity] ?? f.severity.toUpperCase()}</span>
            <span class="finding-title">${escapeHtml(f.title)}</span>
          </div>
          ${f.quote ? `<blockquote class="finding-quote">"${escapeHtml(f.quote)}"</blockquote>` : ''}
          <p class="finding-fix"><strong style="color:${fc}">Fix →</strong> ${escapeHtml(f.action)}</p>
        </div>`;
    }).join('');

    return `
      <div class="dim-card" style="border-left:3px solid ${dc}">
        <div class="dim-header">
          <div>
            <div class="dim-name">${label}</div>
            <div class="dim-summary">${escapeHtml(d.summary)}</div>
          </div>
          <div class="dim-score" style="color:${dc};border:2px solid ${dc}44;background:${dc}11">${d.score}<span class="dim-score-denom">/100</span></div>
        </div>
        <div class="findings">${findingsHtml}</div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>RoastLab Audit — ${url}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: #fff;
    color: #111;
    font-size: 12px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── COVER PAGE ── */
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 56px 48px 40px;
    background: #09090B;
    color: #FAFAFA;
    page-break-after: always;
    break-after: page;
    position: relative;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: #E8334A;
  }
  .logo-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 60px;
  }
  .logo-text {
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -0.04em;
    color: #FAFAFA;
  }
  .logo-tag {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #8B8BA3;
    margin-top: 2px;
  }
  .cover-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 48px;
  }
  .cover-text { flex: 1; }
  .cover-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #E8334A;
    margin-bottom: 16px;
  }
  .cover-title {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1.1;
    margin-bottom: 16px;
    word-break: break-all;
  }
  .cover-meta {
    font-size: 12px;
    color: #8B8BA3;
    line-height: 1.8;
  }
  .score-circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 4px solid ${sc};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${sc}0D;
  }
  .score-num {
    font-size: 52px;
    font-weight: 900;
    line-height: 1;
    color: ${sc};
    letter-spacing: -0.04em;
  }
  .score-denom {
    font-size: 11px;
    color: #8B8BA3;
    margin-top: 2px;
  }
  .score-label {
    font-size: 10px;
    font-weight: 700;
    color: ${sc};
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 4px;
  }
  .cover-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 28px;
  }
  .cover-pill {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    border: 1px solid;
  }
  .cover-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #1E1E28;
    font-size: 10px;
    color: #4A4A62;
    display: flex;
    justify-content: space-between;
  }

  /* ── CONTENT PAGES ── */
  .content {
    padding: 48px;
    background: #fff;
  }
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 28px;
    border-bottom: 1px solid #E5E5E5;
  }
  .page-logo {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #09090B;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .page-logo-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #E8334A;
  }
  .page-meta {
    font-size: 10px;
    color: #8B8BA3;
    text-align: right;
    line-height: 1.6;
  }

  .dim-card {
    margin-bottom: 28px;
    padding: 20px 20px 20px 24px;
    border-radius: 10px;
    background: #FAFAFA;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .dim-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
  }
  .dim-header > div:first-child { flex: 1; }
  .dim-name {
    font-size: 14px;
    font-weight: 800;
    color: #09090B;
    letter-spacing: -0.02em;
    margin-bottom: 5px;
  }
  .dim-summary {
    font-size: 11px;
    color: #555;
    line-height: 1.6;
    font-style: italic;
  }
  .dim-score {
    min-width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 900;
    flex-shrink: 0;
    letter-spacing: -0.04em;
  }
  .dim-score-denom {
    font-size: 8px;
    font-weight: 400;
    opacity: 0.6;
  }
  .findings { display: flex; flex-direction: column; gap: 10px; }
  .finding {
    padding: 10px 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #E5E5E5;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .finding-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 5px;
    flex-wrap: wrap;
  }
  .sev-badge {
    font-size: 8px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 99px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .finding-title {
    font-size: 11px;
    font-weight: 700;
    color: #09090B;
    line-height: 1.4;
  }
  .finding-quote {
    font-size: 10px;
    color: #666;
    font-style: italic;
    margin: 5px 0;
    padding: 5px 10px;
    background: #F5F5F5;
    border-radius: 4px;
    border-left: 2px solid #E5E5E5;
  }
  .finding-fix {
    font-size: 10px;
    color: #444;
    line-height: 1.5;
    margin-top: 4px;
  }

  .page-footer {
    margin-top: 32px;
    padding-top: 14px;
    border-top: 1px solid #E5E5E5;
    font-size: 9px;
    color: #AAAAAA;
    display: flex;
    justify-content: space-between;
  }

  @media print {
    @page { margin: 0; size: A4; }
    body { font-size: 11px; }
    .cover { padding: 48px 40px 32px; }
    .content { padding: 36px 40px; }
    .no-print { display: none !important; }
  }
  @media screen {
    body { max-width: 800px; margin: 0 auto; }
    .print-btn {
      position: fixed;
      bottom: 24px; right: 24px;
      padding: 12px 24px;
      background: #E8334A;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(232,51,74,0.4);
      z-index: 999;
    }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="logo-row">
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke="#E8334A" stroke-width="1.5" fill="none"/>
      <circle cx="16" cy="16" r="7" stroke="#E8334A" stroke-width="1.5" fill="none"/>
      <circle cx="16" cy="16" r="2" fill="#E8334A"/>
      <line x1="16" y1="2" x2="16" y2="8" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="24" x2="16" y2="30" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="2" y1="16" x2="8" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="24" y1="16" x2="30" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <div>
      <div class="logo-text">ROASTLAB</div>
      <div class="logo-tag">Website Audit Report</div>
    </div>
  </div>

  <div class="cover-main">
    <div class="cover-text">
      <div class="cover-label">Full Audit Report</div>
      <div class="cover-title">${escapeHtml(url)}</div>
      <div class="cover-meta">
        Generated: ${date}<br/>
        Dimensions audited: ${dims.length}<br/>
        Overall score: ${score}/100 — ${scoreLabel(score)}
      </div>
      <div class="cover-pills">
        ${dims.map(d => {
          const dc = scoreColor(d.score);
          const label = DIM_LABELS[d.dimension] ?? d.dimension;
          return `<span class="cover-pill" style="color:${dc};border-color:${dc}44;background:${dc}11">${label} ${d.score}</span>`;
        }).join('')}
      </div>
    </div>
    <div class="score-circle">
      <div class="score-num">${score}</div>
      <div class="score-denom">/100</div>
      <div class="score-label">${scoreLabel(score)}</div>
    </div>
  </div>

  <div class="cover-footer">
    <span>getroastlab.vercel.app</span>
    <span>Built by Ritesh Pontalakoti · Confidential</span>
  </div>
</div>

<!-- AUDIT CONTENT -->
<div class="content">
  <div class="page-header">
    <div class="page-logo">
      <div class="page-logo-dot"></div>
      ROASTLAB
    </div>
    <div class="page-meta">
      ${escapeHtml(url.length > 50 ? url.slice(0, 50) + '…' : url)}<br/>
      ${date}
    </div>
  </div>

  ${dimsHtml}

  <div class="page-footer">
    <span>RoastLab · getroastlab.vercel.app</span>
    <span>Built by Ritesh Pontalakoti · © 2026 RoastLab</span>
  </div>
</div>

<button class="print-btn no-print" onclick="window.print()">⬇ Save as PDF</button>

<script>
  // Auto-trigger print after fonts load
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 600);
  });
<\/script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateRoastPDF(opts: {
  url: string;
  score: number;
  dims: DimensionResult[];
}): void {
  if (typeof window === 'undefined') return;
  const html = buildHtml(opts.url, opts.score, opts.dims);
  const win = window.open('', '_blank');
  if (!win) { alert('Allow popups to download the PDF report.'); return; }
  win.document.write(html);
  win.document.close();
}
