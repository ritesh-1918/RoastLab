"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Flame, Lock, ExternalLink, CreditCard, Loader2 } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Severity = "critical" | "high" | "medium" | "good";
interface Finding { severity: Severity; title: string; quote?: string; action: string; }
interface DimensionResult { dimension: string; score: number; summary: string; findings: Finding[]; }

/* ─── Severity config ────────────────────────────────────────────────────── */
const SEV: Record<Severity, { color: string; glow: string; bg: string; pill: string; emoji: string }> = {
  critical: { color: "#FF3B30", glow: "rgba(255,59,48,0.25)",  bg: "rgba(255,59,48,0.07)",  pill: "💀 DISASTER", emoji: "💀" },
  high:     { color: "#FF9F0A", glow: "rgba(255,159,10,0.25)", bg: "rgba(255,159,10,0.07)", pill: "🔥 CAUGHT", emoji: "🔥" },
  medium:   { color: "#FFD60A", glow: "rgba(255,214,10,0.2)",  bg: "rgba(255,214,10,0.06)", pill: "😬 FUMBLE", emoji: "😬" },
  good:     { color: "#30D158", glow: "rgba(48,209,88,0.2)",   bg: "rgba(48,209,88,0.06)",  pill: "✅ BASED", emoji: "✅" },
};

const DIM_META: Record<string, { label: string; emoji: string; taunt: string }> = {
  visual_design:    { label: "Visual Design",  emoji: "👁️",  taunt: "looking at the crime scene…" },
  copywriting:      { label: "Copywriting",    emoji: "✍️",  taunt: "reading every word painfully…" },
  cta:              { label: "CTA",            emoji: "🎯",  taunt: "finding where the button hid…" },
  ux_flow:          { label: "UX Flow",        emoji: "🌀",  taunt: "getting lost on purpose…" },
  accessibility:    { label: "Accessibility",  emoji: "♿",  taunt: "checking for war crimes…" },
  trust_signals:    { label: "Trust Signals",  emoji: "🔒",  taunt: "questioning everything…" },
  mobile_experience:{ label: "Mobile",         emoji: "📱",  taunt: "using a tiny screen…" },
  performance:      { label: "Performance",    emoji: "⚡",  taunt: "watching the paint dry…" },
  seo:              { label: "SEO",            emoji: "🔍",  taunt: "asking Google for therapy…" },
};

const FREE_DIMS = ["visual_design", "copywriting", "cta"];
const LOCKED_DIMS = [
  { key: "ux_flow", label: "UX Flow", emoji: "🌀" },
  { key: "accessibility", label: "Accessibility", emoji: "♿" },
  { key: "trust_signals", label: "Trust Signals", emoji: "🔒" },
  { key: "mobile_experience", label: "Mobile", emoji: "📱" },
  { key: "performance", label: "Performance", emoji: "⚡" },
  { key: "seo", label: "SEO", emoji: "🔍" },
];

const SCORE_TIER = (s: number) => s >= 75
  ? { label: "ok fine this actually slaps", emoji: "🔥", color: "#30D158", sub: "understood the assignment ngl" }
  : s >= 60
  ? { label: "mid. potential, fumbling it.", emoji: "😐", color: "#FFD60A", sub: "participation trophy behavior" }
  : s >= 40
  ? { label: "bestie what is this 💀", emoji: "💀", color: "#FF9F0A", sub: "deployed and prayed" }
  : { label: "call 911. i'm not joking.", emoji: "☠️", color: "#FF3B30", sub: "I'm in physical pain" };

const LIVE_TAUNTS = [
  "🧠 AI reading every pixel judgementally…",
  "😤 compiling the receipts…",
  "☕ brewing maximum shade…",
  "🎯 identifying all the fumbles…",
  "💅 this is going to sting…",
  "🔬 evidence is overwhelming…",
  "⚠️ preparing the verdict…",
];

/* ─── Score Arc ──────────────────────────────────────────────────────────── */
function ScoreArc({ score, size = 72 }: { score: number; size?: number }) {
  const sw = size > 80 ? 7 : 5.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const t = SCORE_TIER(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`a${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={t.color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={t.color}/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#a${size})`} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, ease: [0.16,1,0.3,1], delay: 0.2 }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 8px ${t.color}99)` }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={Math.round(size * 0.26)} fontWeight="800" fill="#F0EFF8"
        fontFamily="system-ui,-apple-system,sans-serif">
        {score}
      </text>
    </svg>
  );
}

/* ─── Browser Chrome Screenshot ─────────────────────────────────────────── */
function SitePreview({ imgUrl, siteUrl }: { imgUrl: string; siteUrl: string }) {
  const [ready, setReady] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
      style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, background: "#0A0A14" }}
    >
      {/* Chrome bar */}
      <div style={{ padding: "9px 14px", background: "#13131E", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }}/>)}
        <div style={{ flex: 1, marginLeft: 6, background: "#0B0B16", borderRadius: 5, padding: "3px 9px", fontSize: 10.5, color: "#3E3D5E", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {siteUrl}
        </div>
      </div>
      {/* Screenshot */}
      <div style={{ position: "relative", maxHeight: 260, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 2, background: ready ? "transparent" : "#0A0A14", transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100, pointerEvents: "none" }}>
          {!ready && <motion.div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.06)", borderTopColor: "#FF3B30", borderRadius: "50%" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl} alt="site" onLoad={() => setReady(true)} style={{ width: "100%", display: "block", filter: "brightness(0.85) saturate(0.8)", opacity: ready ? 1 : 0, transition: "opacity 0.35s" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, #0A0A14)", pointerEvents: "none" }}/>
        {ready && (
          <motion.div initial={{ opacity: 0, rotate: -22, scale: 1.8 }} animate={{ opacity: 1, rotate: -9, scale: 1 }} transition={{ duration: 0.35, delay: 0.15 }}
            style={{ position: "absolute", top: 12, right: 12, padding: "4px 11px", border: "2.5px solid rgba(255,59,48,0.75)", color: "rgba(255,59,48,0.9)", fontSize: 12, fontWeight: 900, fontFamily: "serif", textTransform: "uppercase", letterSpacing: "0.07em", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", borderRadius: 4, pointerEvents: "none" }}>
            🔥 ROASTING
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Roast Finding ──────────────────────────────────────────────────────── */
function RoastFinding({ f, i }: { f: Finding; i: number }) {
  const s = SEV[f.severity];
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.07 }}
      style={{ marginBottom: 10, position: "relative" }}
    >
      {/* Left severity stripe */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: 3, background: s.color, boxShadow: `0 0 8px ${s.color}88` }}/>
      <div style={{ marginLeft: 14, padding: "10px 12px", background: s.bg, border: `1px solid ${s.color}1A`, borderRadius: "0 10px 10px 0" }}>
        {/* Pill + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: f.quote ? 7 : 6 }}>
          <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: `${s.color}1C`, color: s.color, marginTop: 2 }}>
            {s.pill}
          </span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#EDEEFA", lineHeight: 1.35 }}>{f.title}</p>
        </div>
        {/* Quote block */}
        {f.quote && (
          <div style={{ margin: "0 0 7px", padding: "6px 10px", background: "rgba(0,0,0,0.35)", borderRadius: 6, fontSize: 11.5, fontStyle: "italic", color: "#7E7D9A", lineHeight: 1.5, borderLeft: `2px solid ${s.color}44` }}>
            &ldquo;{f.quote}&rdquo;
          </div>
        )}
        {/* Fix */}
        <p style={{ margin: 0, fontSize: 11.5, color: "#6E6D8E", lineHeight: 1.45 }}>
          <span style={{ color: s.color, fontWeight: 800 }}>fix → </span>{f.action}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Roast Card (per dimension) ─────────────────────────────────────────── */
function RoastCard({ result, idx }: { result: DimensionResult; idx: number }) {
  const [open, setOpen] = useState(true);
  const meta = DIM_META[result.dimension] ?? { label: result.dimension, emoji: "🎯", taunt: "" };
  const t = SCORE_TIER(result.score);
  const worstSev = result.findings.find(f => f.severity === "critical") ? "critical"
    : result.findings.find(f => f.severity === "high") ? "high"
    : result.findings.find(f => f.severity === "medium") ? "medium" : "good";
  const ws = SEV[worstSev];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16,1,0.3,1] }}
      style={{ borderRadius: 20, overflow: "hidden", marginBottom: 14 }}
      whileHover={{ y: -2 }}
    >
      {/* Card header — the roast verdict */}
      <div style={{
        background: `linear-gradient(135deg, #16162A 0%, #0F0F1C 100%)`,
        border: "1px solid rgba(255,255,255,0.07)",
        borderBottom: open ? `1px solid ${ws.color}18` : "1px solid rgba(255,255,255,0.07)",
        borderRadius: open ? "20px 20px 0 0" : 20,
        padding: "20px 22px",
      }}>
        {/* Top row: emoji label + score arc */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
          {/* Dim icon */}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ws.color}12`, border: `1px solid ${ws.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {meta.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3E3D5E" }}>
              {meta.label}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: t.color, fontWeight: 700 }}>
              {t.emoji} {t.label}
            </p>
          </div>
          {/* Score + toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ScoreArc score={result.score} size={52} />
            <button onClick={() => setOpen(v => !v)} style={{ background: "rgba(255,255,255,0.04)", border: "none", color: "#3E3D5E", fontSize: 10, padding: "5px 8px", borderRadius: 6, cursor: "pointer" }}>
              {open ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {/* Summary — the roast quote, hero text */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${ws.color}22`,
          borderLeft: `3px solid ${ws.color}`,
          borderRadius: "0 10px 10px 0",
          padding: "12px 16px",
        }}>
          <p style={{ margin: 0, fontSize: 14, color: "#D4D3EE", lineHeight: 1.55, fontStyle: "italic", fontWeight: 500 }}>
            &ldquo;{result.summary}&rdquo;
          </p>
        </div>
      </div>

      {/* Findings */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "linear-gradient(180deg, #0D0D1A 0%, #0A0A14 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: "none", borderRadius: "0 0 20px 20px",
              padding: "16px 20px 18px",
            }}>
              <p style={{ margin: "0 0 12px", fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2E2D48" }}>
                The receipts ({result.findings.length} findings)
              </p>
              {result.findings.map((f, i) => <RoastFinding key={i} f={f} i={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function RoastSkeleton({ dimKey }: { dimKey: string }) {
  const meta = DIM_META[dimKey] ?? { label: dimKey, emoji: "🎯", taunt: "working on it…" };
  return (
    <div style={{
      borderRadius: 20, marginBottom: 14,
      border: "1px solid rgba(255,255,255,0.05)",
      background: "linear-gradient(135deg, #14142A 0%, #0F0F1C 100%)",
      padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.4 }}>
        {meta.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2E2D48" }}>
          {meta.label}
        </p>
        <p style={{ margin: 0, fontSize: 11.5, color: "#FF3B3055" }}>{meta.taunt}</p>
      </div>
      <motion.div style={{ width: 52, height: 52, border: "5px solid rgba(255,255,255,0.04)", borderTopColor: "#FF3B3066", borderRadius: "50%" }}
        animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}/>
    </div>
  );
}

/* ─── Locked Card ────────────────────────────────────────────────────────── */
function LockedCard({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div style={{ borderRadius: 12, padding: "11px 16px", background: "rgba(8,8,18,0.5)", border: "1px dashed rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 14, opacity: 0.25 }}>{emoji}</span>
      <span style={{ fontSize: 12.5, color: "#2E2D48", fontWeight: 600 }}>{label}</span>
      <Lock size={11} style={{ color: "#2E2D48", marginLeft: "auto" }} />
    </div>
  );
}

/* ─── Verdict Banner ─────────────────────────────────────────────────────── */
function VerdictBanner({ score, dims }: { score: number; dims: DimensionResult[] }) {
  const t = SCORE_TIER(score);
  const particles = ["💀","🔥","😭","💅","⚰️","😤","🤡","💔"];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
      style={{
        borderRadius: 24, marginBottom: 32, overflow: "visible",
        background: "linear-gradient(145deg, #16162A 0%, #0F0F1C 100%)",
        border: `1px solid ${t.color}20`,
        boxShadow: `0 0 60px ${t.color}10, 0 8px 40px rgba(0,0,0,0.5)`,
        padding: "28px 24px",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: `radial-gradient(ellipse at 50% 0%, ${t.color}08 0%, transparent 60%)`, pointerEvents: "none" }}/>

      {/* Particle burst */}
      <div style={{ position: "absolute", top: "40%", left: "20%", pointerEvents: "none" }}>
        {particles.map((p, i) => (
          <motion.span key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], x: Math.cos(i * 45 * Math.PI/180) * 70, y: Math.sin(i * 45 * Math.PI/180) * 70, scale: [0,1.3,0] }}
            transition={{ duration: 1.3, delay: 0.4 + i * 0.06, ease: "easeOut" }}
            style={{ position: "absolute", fontSize: 18 }}
          >{p}</motion.span>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
        {/* Score arc big */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: `radial-gradient(circle, ${t.color}18 0%, transparent 70%)` }}/>
          <ScoreArc score={score} size={110} />
        </div>

        {/* Verdict text */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 99, background: `${t.color}12`, border: `1px solid ${t.color}25`, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: t.color }}>
              ROAST VERDICT
            </span>
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: t.color, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            {t.label}
          </h2>
          <p style={{ margin: "0 0 18px", fontSize: 12, color: "#3E3D5E", fontStyle: "italic" }}>{t.sub}</p>

          {/* Mini score pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
            {dims.map(d => {
              const c = d.score >= 65 ? "#30D158" : d.score >= 40 ? "#FFD60A" : "#FF3B30";
              return (
                <span key={d.dimension} style={{ padding: "3px 9px", borderRadius: 6, background: `${c}10`, border: `1px solid ${c}25`, fontSize: 10.5, color: c, fontWeight: 700 }}>
                  {DIM_META[d.dimension]?.emoji} {d.score}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Upsell ─────────────────────────────────────────────────────────────── */
function Upsell({ siteUrl }: { siteUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteUrl }) });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else { setErr(data.error ?? "Payment failed"); setLoading(false); }
    } catch (e) { setErr(e instanceof Error ? e.message : "Payment failed"); setLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.16,1,0.3,1] }}
      style={{ marginTop: 10, borderRadius: 22, border: "1px solid rgba(255,59,48,0.18)", overflow: "hidden", background: "linear-gradient(135deg, #1C0A06 0%, #130E22 55%, #0D0D1A 100%)", position: "relative" }}
    >
      <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 260, height: 260, background: "radial-gradient(circle, rgba(255,59,48,0.07) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ padding: "28px 22px", textAlign: "center", position: "relative" }}>
        {/* Teaser text */}
        <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 900, color: "#F0EFF8", letterSpacing: "-0.02em" }}>
          6 more roasts are waiting
        </h3>
        <p style={{ margin: "0 0 5px", fontSize: 13, color: "#6E6D8E", lineHeight: 1.55, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
          That was just the appetizer. The full roast goes deeper:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", margin: "12px auto 22px", maxWidth: 380 }}>
          {LOCKED_DIMS.map(d => (
            <span key={d.key} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 11.5, color: "#4E4D6E", fontWeight: 500 }}>
              {d.emoji} {d.label}
            </span>
          ))}
        </div>
        <button onClick={pay} disabled={loading} style={{
          display: "inline-flex", alignItems: "center", gap: 9,
          padding: "14px 28px", borderRadius: 13,
          background: loading ? "#200C08" : "linear-gradient(135deg, #FF3B30 0%, #FF6B3D 100%)",
          color: loading ? "#7E3D38" : "#fff", border: "none", cursor: loading ? "default" : "pointer",
          fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
          boxShadow: loading ? "none" : "0 6px 28px rgba(255,59,48,0.35)", transition: "all 0.18s",
        }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }}/> : <CreditCard size={15}/>}
          {loading ? "Heading to Stripe…" : "Unlock Full Roast — ₹2,499"}
        </button>
        {err && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#FF3B30" }}>{err}</p>}
        <p style={{ margin: "12px 0 0", fontSize: 10.5, color: "#2E2D48" }}>One-time · No subscription · Stripe secured</p>
      </div>
    </motion.div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const tier = (searchParams.get("tier") ?? "free") as "free" | "full";
  const paid = searchParams.get("paid") === "1";

  const [status, setStatus]     = useState("Warming up the roast machine…");
  const [dims, setDims]         = useState<DimensionResult[]>([]);
  const [done, setDone]         = useState(false);
  const [score, setScore]       = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [shot, setShot]         = useState<string | null>(null);
  const [taunt, setTaunt]       = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!url || started.current) return;
    started.current = true;
    const form = new FormData();
    form.append("url", url);
    form.append("tier", tier);
    if (paid) form.append("paid", "1");

    const ctrl = new AbortController();
    fetch("/api/analyze", { method: "POST", body: form, signal: ctrl.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done: rd, value } = await reader.read();
          if (rd) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const p of parts) {
            if (!p.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(p.slice(6));
              if (ev.type === "status")     setStatus(ev.payload.message);
              if (ev.type === "screenshot") setShot(ev.payload.url);
              if (ev.type === "dimension")  setDims(prev => [...prev, ev.payload]);
              if (ev.type === "done")       { setScore(ev.payload.overallScore); setDone(true); }
              if (ev.type === "error")      setError(ev.payload.message);
            } catch { /**/ }
          }
        }
      })
      .catch(e => { if (e.name !== "AbortError") setError(e.message); });
    return () => ctrl.abort();
  }, [url, tier, paid]);

  useEffect(() => {
    if (done || error) return;
    const t = setInterval(() => setTaunt(i => (i + 1) % LIVE_TAUNTS.length), 2600);
    return () => clearInterval(t);
  }, [done, error]);

  if (!url) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6E6D8E", marginBottom: 16 }}>No URL provided.</p>
        <Link href="/" style={{ color: "#FF3B30", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14}/> Back</Link>
      </div>
    </div>
  );

  const pendingDims = tier === "full"
    ? Object.keys(DIM_META).filter(d => !dims.find(r => r.dimension === d))
    : FREE_DIMS.filter(d => !dims.find(r => r.dimension === d));

  return (
    <div style={{ minHeight: "100vh", maxWidth: 700, margin: "0 auto", padding: "40px 20px 80px", color: "#F0EFF8" }}>

      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2E2D48", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#6E6D8E")}
          onMouseLeave={e => (e.currentTarget.style.color = "#2E2D48")}
        >
          <ArrowLeft size={12}/> RoastLab
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Flame size={12} color="#FF3B30"/>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3B30" }}>
            {tier === "full" && paid ? "Full Roast" : "Free Roast"}
          </span>
          <span style={{ fontSize: 10, color: "#2E2D48" }}>·</span>
          <span style={{ fontSize: 10, color: "#2E2D48" }}>{dims.length}/{tier === "full" ? 9 : 3} done</span>
        </div>
      </div>

      {/* Site URL */}
      <div style={{ marginBottom: 20 }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 13.5, fontWeight: 600, color: "#EDEEFA",
          textDecoration: "none", fontFamily: "monospace",
          maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {url} <ExternalLink size={11} style={{ color: "#3E3D5E", flexShrink: 0 }}/>
        </a>
      </div>

      {/* Screenshot */}
      <AnimatePresence>
        {shot && <SitePreview imgUrl={shot} siteUrl={url} />}
      </AnimatePresence>

      {/* Verdict banner — shown when done */}
      <AnimatePresence>
        {done && score !== null && <VerdictBanner score={score} dims={dims} />}
      </AnimatePresence>

      {/* Live status */}
      {!done && !error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", marginBottom: 22, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
          <motion.div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.05)", borderTopColor: "#FF3B30", flexShrink: 0 }}
            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>
          <AnimatePresence mode="wait">
            <motion.span key={dims.length === 0 ? "s" : taunt}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 12, color: "#6E6D8E" }}
            >
              {dims.length === 0 ? status : LIVE_TAUNTS[taunt]}
            </motion.span>
          </AnimatePresence>
          <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <motion.div key={i} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#FF3B30" }}
                animate={{ opacity: [0.15,1,0.15] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}/>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "14px 16px", marginBottom: 22, borderRadius: 12, background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)", fontSize: 13.5, color: "#FF6B3D", lineHeight: 1.5 }}>
          ☠️ {error}
        </motion.div>
      )}

      {/* Section label */}
      {(dims.length > 0 || (!done && !error)) && (
        <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2E2D48", marginBottom: 4 }}>
          {done ? "🔥 The Full Damage" : "📍 Live Roasting…"}
        </p>
      )}

      {/* Roast cards */}
      <div style={{ marginTop: 8 }}>
        {dims.map((d, i) => <RoastCard key={d.dimension} result={d} idx={i} />)}
        {!done && !error && pendingDims.map(d => <RoastSkeleton key={d} dimKey={d} />)}
      </div>

      {/* Locked + upsell */}
      {done && tier !== "full" && (
        <>
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2E2D48", marginBottom: 10 }}>
              🔒 Still Locked (6 of 9)
            </p>
            {LOCKED_DIMS.map(d => <LockedCard key={d.key} label={d.label} emoji={d.emoji} />)}
          </div>
          <Upsell siteUrl={url} />
        </>
      )}

      {/* Full done */}
      {done && tier === "full" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 16, padding: "14px 18px", borderRadius: 14, background: "rgba(48,209,88,0.04)", border: "1px solid rgba(48,209,88,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{ fontSize: 13, color: "#30D158", fontWeight: 600 }}>All 9 roasts delivered. The receipts are in. 💀</span>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div style={{ width: 26, height: 26, border: "3px solid rgba(255,255,255,0.05)", borderTopColor: "#FF3B30", borderRadius: "50%" }}
          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
