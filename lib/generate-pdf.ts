/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Branded RoastLab PDF report — opens a styled HTML page and triggers print.
 * Browser-only. Inline CSS @media print gives professional output.
 */

const SEV_COLOR: Record<string, string> = { critical:'#E8334A', high:'#FF9F0A', medium:'#FFD60A', good:'#30D158' };
const SEV_LABEL: Record<string, string> = { critical:'💀 CRITICAL', high:'🔥 HIGH', medium:'😬 MEDIUM', good:'✅ GOOD' };
const DIM_LABELS: Record<string, string> = {
  visual_design:'Visual Design', copywriting:'Copywriting', cta:'CTA',
  ux_flow:'UX Flow', accessibility:'Accessibility', trust_signals:'Trust Signals',
  mobile_experience:'Mobile Experience', performance:'Performance', seo:'SEO',
};

const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sc = (n: number) => n >= 70 ? '#30D158' : n >= 45 ? '#FF9F0A' : '#E8334A';
const sl = (n: number) => n >= 75 ? 'Good' : n >= 50 ? 'Needs Work' : n >= 30 ? 'Bad' : 'Critical';

const LOGO_SVG = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#E8334A" stroke-width="1.5"/><circle cx="16" cy="16" r="7" stroke="#E8334A" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#E8334A"/><line x1="16" y1="2" x2="16" y2="8" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="24" x2="16" y2="30" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="16" x2="8" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="24" y1="16" x2="30" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const CSS = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#fff;color:#111;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}.cover{min-height:100vh;display:flex;flex-direction:column;padding:52px 48px 36px;background:#09090B;color:#FAFAFA;page-break-after:always;break-after:page;border-top:3px solid #E8334A}.lr{display:flex;align-items:center;gap:12px;margin-bottom:56px}.lt{font-size:20px;font-weight:900;letter-spacing:-.04em}.ltag{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8B8BA3}.cm{flex:1;display:flex;align-items:center;gap:40px}.ct{flex:1}.clabel{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#E8334A;margin-bottom:14px}.ctitle{font-size:28px;font-weight:900;letter-spacing:-.04em;line-height:1.1;margin-bottom:14px;word-break:break-all}.cmeta{font-size:11px;color:#8B8BA3;line-height:1.8}.pills{display:flex;flex-wrap:wrap;gap:5px;margin-top:20px}.pill{font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid}.sring{width:120px;height:120px;border-radius:50%;border:3px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}.snum{font-size:44px;font-weight:900;line-height:1;letter-spacing:-.04em}.sdenom{font-size:10px;color:#8B8BA3;margin-top:2px}.slabel{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:3px}.cfoot{margin-top:36px;padding-top:16px;border-top:1px solid #1E1E28;font-size:9px;color:#4A4A62;display:flex;justify-content:space-between}.content{padding:44px 48px}.ph{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;margin-bottom:24px;border-bottom:1px solid #E5E5E5}.plogo{font-size:13px;font-weight:900;letter-spacing:-.03em;display:flex;align-items:center;gap:7px}.pdot{width:7px;height:7px;border-radius:50%;background:#E8334A}.pmeta{font-size:9px;color:#8B8BA3;text-align:right;line-height:1.6}.dc{margin-bottom:24px;padding:18px 18px 18px 22px;border-radius:8px;background:#FAFAFA;page-break-inside:avoid;break-inside:avoid}.dh{display:flex;align-items:flex-start;gap:14px;margin-bottom:12px}.dh>div:first-child{flex:1}.dn{font-size:13px;font-weight:800;color:#09090B;letter-spacing:-.02em;margin-bottom:4px}.ds{font-size:10px;color:#555;line-height:1.6;font-style:italic}.dsc{width:48px;height:48px;border-radius:50%;border:2px solid;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:16px;font-weight:900;flex-shrink:0;letter-spacing:-.04em}.dsd{font-size:7px;font-weight:400;opacity:.6}.finds{display:flex;flex-direction:column;gap:8px}.fi{padding:9px 11px;background:#fff;border-radius:5px;border:1px solid #E5E5E5;page-break-inside:avoid;break-inside:avoid}.fih{display:flex;align-items:flex-start;gap:7px;margin-bottom:4px;flex-wrap:wrap}.sb{font-size:7px;font-weight:700;padding:2px 6px;border-radius:99px;white-space:nowrap;flex-shrink:0;margin-top:1px}.ft{font-size:10px;font-weight:700;color:#09090B;line-height:1.4}.fq{font-size:9px;color:#666;font-style:italic;margin:4px 0;padding:4px 8px;background:#F5F5F5;border-radius:3px;border-left:2px solid #E5E5E5}.fx{font-size:9px;color:#444;line-height:1.5;margin-top:3px}.pf{margin-top:28px;padding-top:12px;border-top:1px solid #E5E5E5;font-size:8px;color:#AAAAAA;display:flex;justify-content:space-between}@media print{@page{margin:0;size:A4}body{font-size:10px}.cover{padding:44px 40px 28px}.content{padding:36px 40px}.prbtn{display:none!important}}@media screen{body{max-width:800px;margin:0 auto}.prbtn{position:fixed;bottom:20px;right:20px;padding:11px 22px;background:#E8334A;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 18px rgba(232,51,74,.4);z-index:999}}`;

export function generateRoastPDF(opts: { url: string; score: number; dims: any[] }): void {
  if (typeof window === 'undefined') return;

  const { url, score, dims } = opts;
  const date = new Date().toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
  const scolor = sc(score);

  const dimsHtml = dims.map((d: any) => {
    const label = DIM_LABELS[d.dimension] ?? d.dimension;
    const dc = sc(d.score);
    const findings = (d.findings ?? []).map((f: any) => {
      const fc = SEV_COLOR[f.severity] ?? '#888';
      return `<div class="fi"><div class="fih"><span class="sb" style="background:${fc}22;color:${fc};border:1px solid ${fc}44">${SEV_LABEL[f.severity]??f.severity.toUpperCase()}</span><span class="ft">${esc(f.title??'')}</span></div>${f.quote?`<div class="fq">"${esc(f.quote)}"</div>`:''}<div class="fx"><strong style="color:${fc}">Fix →</strong> ${esc(f.action??'')}</div></div>`;
    }).join('');
    return `<div class="dc" style="border-left:3px solid ${dc}"><div class="dh"><div><div class="dn">${label}</div><div class="ds">${esc(d.summary??'')}</div></div><div class="dsc" style="color:${dc};border-color:${dc};background:${dc}1A">${d.score}<span class="dsd">/100</span></div></div><div class="finds">${findings}</div></div>`;
  }).join('');

  const pillsHtml = dims.map((d: any) => {
    const dc = sc(d.score); const label = DIM_LABELS[d.dimension]??d.dimension;
    return `<span class="pill" style="color:${dc};border-color:${dc}44;background:${dc}11">${label} ${d.score}</span>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>RoastLab Audit — ${esc(url)}</title><style>${CSS}</style></head><body>
<div class="cover">
  <div class="lr">${LOGO_SVG}<div><div class="lt">ROASTLAB</div><div class="ltag">Website Audit Report</div></div></div>
  <div class="cm">
    <div class="ct">
      <div class="clabel">Full Audit Report</div>
      <div class="ctitle">${esc(url)}</div>
      <div class="cmeta">Generated: ${date}<br/>Dimensions: ${dims.length}<br/>Score: ${score}/100 — ${sl(score)}</div>
      <div class="pills">${pillsHtml}</div>
    </div>
    <div class="sring" style="border-color:${scolor};background:${scolor}11">
      <div class="snum" style="color:${scolor}">${score}</div>
      <div class="sdenom">/100</div>
      <div class="slabel" style="color:${scolor}">${sl(score)}</div>
    </div>
  </div>
  <div class="cfoot"><span>getroastlab.vercel.app</span><span>Built by Ritesh Bonthalakoti · Confidential</span></div>
</div>
<div class="content">
  <div class="ph">
    <div class="plogo"><div class="pdot"></div>ROASTLAB</div>
    <div class="pmeta">${esc(url.length>50?url.slice(0,50)+'…':url)}<br/>${date}</div>
  </div>
  ${dimsHtml}
  <div class="pf"><span>RoastLab · getroastlab.vercel.app</span><span>Built by Ritesh Bonthalakoti · © 2026 RoastLab</span></div>
</div>
<button class="prbtn" onclick="window.print()">⬇ Save as PDF</button>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},500)});<\/script>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) { alert('Allow popups to download the PDF report.'); return; }
  win.document.write(html);
  win.document.close();
}
