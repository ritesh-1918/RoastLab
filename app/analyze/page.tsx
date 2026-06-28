"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Lock, ExternalLink, CreditCard, Loader2, Flame } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Severity = "critical" | "high" | "medium" | "good";
interface Finding { severity: Severity; title: string; quote?: string; action: string; }
interface DimensionResult { dimension: string; score: number; summary: string; findings: Finding[]; }

/* ─── Severity ───────────────────────────────────────────────────────────── */
const SEV: Record<Severity, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: "#FF2D55", bg: "#FF2D5512", label: "💀 rip",     icon: "💀" },
  high:     { color: "#FF9F0A", bg: "#FF9F0A12", label: "🔥 caught",  icon: "🔥" },
  medium:   { color: "#FFD60A", bg: "#FFD60A0D", label: "😬 fumble",  icon: "😬" },
  good:     { color: "#32D74B", bg: "#32D74B0D", label: "✅ based",   icon: "✅" },
};

const DIM: Record<string, { label: string; emoji: string; color: string }> = {
  visual_design:     { label: "Visual Design",  emoji: "👁",  color: "#BF5AF2" },
  copywriting:       { label: "Copywriting",    emoji: "✍️", color: "#0A84FF" },
  cta:               { label: "CTA",            emoji: "🎯",  color: "#FF375F" },
  ux_flow:           { label: "UX Flow",        emoji: "🌀",  color: "#5E5CE6" },
  accessibility:     { label: "Accessibility",  emoji: "♿",  color: "#64D2FF" },
  trust_signals:     { label: "Trust Signals",  emoji: "🔒",  color: "#FFD60A" },
  mobile_experience: { label: "Mobile",         emoji: "📱",  color: "#FF6B00" },
  performance:       { label: "Performance",    emoji: "⚡",  color: "#30D158" },
  seo:               { label: "SEO",            emoji: "🔍",  color: "#FF9F0A" },
};

const FREE_DIMS = ["visual_design", "copywriting", "cta"];
const LOCKED_DIMS = [
  { key: "ux_flow",          label: "UX Flow",       emoji: "🌀" },
  { key: "accessibility",    label: "Accessibility", emoji: "♿" },
  { key: "trust_signals",    label: "Trust Signals", emoji: "🔒" },
  { key: "mobile_experience",label: "Mobile",        emoji: "📱" },
  { key: "performance",      label: "Performance",   emoji: "⚡" },
  { key: "seo",              label: "SEO",           emoji: "🔍" },
];

function scoreMeta(s: number) {
  if (s >= 75) return { grade: "A",  verdict: "actually fire 🔥",        color: "#32D74B", vibe: "understood the assignment" };
  if (s >= 60) return { grade: "B",  verdict: "mid but has potential",    color: "#FFD60A", vibe: "participation trophy behavior" };
  if (s >= 40) return { grade: "C",  verdict: "bestie what is this 💀",  color: "#FF9F0A", vibe: "deployed and prayed" };
  if (s >= 20) return { grade: "D",  verdict: "it's giving disaster 🚨",  color: "#FF6B00", vibe: "I am in physical pain" };
  return              { grade: "F",  verdict: "call 911 immediately ☠️",  color: "#FF2D55", vibe: "sent it without looking" };
}

const TAUNTS = [
  "🧠 analyzing every pixel with judgment…",
  "😤 compiling the receipts…",
  "☕ brewing maximum shade…",
  "🎯 catching every fumble…",
  "💅 writing things that will sting…",
  "🔬 finding crimes you thought were hidden…",
  "⚠️ this is going to be a lot…",
];

/* ─── Score badge ────────────────────────────────────────────────────────── */
function ScoreBadge({ score, size = 56 }: { score: number; size?: number }) {
  const m = scoreMeta(score);
  const sw = 5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={m.color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.15 }}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: `drop-shadow(0 0 6px ${m.color}88)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 900, color: "#F0EFF8", lineHeight: 1, fontFamily: "system-ui,sans-serif" }}>{score}</span>
      </div>
    </div>
  );
}

/* ─── Browser frame + screenshot ─────────────────────────────────────────── */
function SiteFrame({ imgUrl, siteUrl }: { imgUrl: string; siteUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
      style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 28, background: "#080814" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#10101E", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }}/>)}
        <div style={{ flex: 1, marginLeft: 6, background: "#080814", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#3A3A5E", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {siteUrl}
        </div>
      </div>
      <div style={{ position: "relative", maxHeight: 220, overflow: "hidden" }}>
        {!loaded && (
          <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div style={{ width: 18, height: 18, border: "2px solid #FF2D5533", borderTopColor: "#FF2D55", borderRadius: "50%" }}
              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl} alt="" onLoad={() => setLoaded(true)}
          style={{ width: "100%", display: "block", filter: "brightness(0.8) saturate(0.75)", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #080814)", pointerEvents: "none" }}/>
        {loaded && (
          <motion.div initial={{ opacity: 0, rotate: -25, scale: 2 }} animate={{ opacity: 1, rotate: -8, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", border: "2px solid #FF2D5588", color: "#FF2D55CC", fontSize: 11, fontWeight: 900, fontFamily: "serif", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", borderRadius: 3, pointerEvents: "none" }}>
            ROASTED
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── BIG verdict hero ───────────────────────────────────────────────────── */
function VerdictHero({ score, dims }: { score: number; dims: DimensionResult[] }) {
  const m = scoreMeta(score);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ marginBottom: 36, position: "relative" }}
    >
      {/* Grade — massive background text */}
      <div style={{ position: "absolute", right: -10, top: -20, fontSize: 160, fontWeight: 900, color: `${m.color}08`, lineHeight: 1, pointerEvents: "none", userSelect: "none", fontFamily: "system-ui,sans-serif" }}>
        {m.grade}
      </div>

      {/* Score number — huge */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 6 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34,1.56,0.64,1], delay: 0.1 }}
          style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.9, color: m.color, letterSpacing: "-0.04em", fontFamily: "system-ui,sans-serif", filter: `drop-shadow(0 0 30px ${m.color}44)` }}
        >
          {score}
        </motion.span>
        <div style={{ paddingBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3A3A5E", marginBottom: 2 }}>/ 100</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3A3A5E" }}>ROAST SCORE</div>
        </div>
      </div>

      {/* Verdict line */}
      <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
        style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "#F0EFF8", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
        {m.verdict}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ margin: "0 0 20px", fontSize: 13, color: "#4A4A6E", fontStyle: "italic" }}>
        {m.vibe}
      </motion.p>

      {/* Dim score pills row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {dims.map(d => {
          const meta = DIM[d.dimension];
          const c = d.score >= 65 ? "#32D74B" : d.score >= 40 ? "#FFD60A" : "#FF2D55";
          return (
            <motion.span key={d.dimension}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + dims.indexOf(d) * 0.05 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: `${c}10`, border: `1px solid ${c}22`, fontSize: 11, color: c, fontWeight: 700 }}
            >
              {meta?.emoji} <span style={{ color: "#4A4A6E", fontWeight: 400 }}>{meta?.label}</span> {d.score}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Single finding ─────────────────────────────────────────────────────── */
function Finding({ f, i }: { f: Finding; i: number }) {
  const s = SEV[f.severity];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.06 }}
      style={{ marginBottom: 12 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Left accent line */}
        <div style={{ width: 2.5, minHeight: 40, borderRadius: 2, background: s.color, flexShrink: 0, marginTop: 3, boxShadow: `0 0 6px ${s.color}66` }}/>
        <div style={{ flex: 1 }}>
          {/* Severity + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", padding: "2px 6px", borderRadius: 4, background: s.bg, color: s.color }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "#DDDDF0", lineHeight: 1.3 }}>{f.title}</span>
          </div>
          {/* Quote block */}
          {f.quote && (
            <div style={{ margin: "0 0 7px", padding: "8px 12px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12, fontStyle: "italic", color: "#5A5A80", lineHeight: 1.55 }}>
              <span style={{ color: s.color, fontWeight: 900, fontStyle: "normal" }}>❝ </span>{f.quote}<span style={{ color: s.color, fontWeight: 900, fontStyle: "normal" }}> ❞</span>
            </div>
          )}
          {/* Fix */}
          <p style={{ margin: 0, fontSize: 12, color: "#4A4A6E", lineHeight: 1.5 }}>
            <span style={{ color: s.color, fontWeight: 800, fontSize: 11 }}>FIX → </span>{f.action}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Roast Card ─────────────────────────────────────────────────────────── */
function RoastCard({ result, idx }: { result: DimensionResult; idx: number }) {
  const [open, setOpen] = useState(true);
  const meta = DIM[result.dimension] ?? { label: result.dimension, emoji: "🔥", color: "#FF2D55" };
  const sm = scoreMeta(result.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: idx * 0.12, ease: [0.16,1,0.3,1] }}
      style={{ marginBottom: 16 }}
    >
      {/* Card */}
      <div style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        background: "linear-gradient(160deg, #131328 0%, #0C0C1A 100%)",
        boxShadow: `0 2px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}>
        {/* Colored top border */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.color} 0%, ${meta.color}44 100%)` }}/>

        {/* Header row */}
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", padding: "18px 20px 14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left" }}>
          {/* Dim icon box */}
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${meta.color}14`, border: `1px solid ${meta.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {meta.emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: meta.color }}>
                {meta.label}
              </span>
              {/* Score inline pill */}
              <span style={{ fontSize: 11, fontWeight: 900, padding: "1px 7px", borderRadius: 6, background: `${sm.color}15`, color: sm.color, border: `1px solid ${sm.color}25` }}>
                {result.score}/100
              </span>
              <span style={{ fontSize: 11, color: "#3A3A5E" }}>· {sm.verdict.split(" ")[0]}</span>
            </div>

            {/* Summary — BIG roast quote */}
            <p style={{ margin: 0, fontSize: 14.5, color: "#C8C8E8", lineHeight: 1.55, fontStyle: "italic" }}>
              {result.summary}
            </p>
          </div>

          {/* Score badge */}
          <div style={{ flexShrink: 0 }}>
            <ScoreBadge score={result.score} size={50} />
          </div>
        </button>

        {/* Findings */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 20px 18px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                {/* Receipts header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 10px" }}>
                  <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3A3A5E" }}>
                    the receipts
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }}/>
                  <span style={{ fontSize: 9, color: "#2E2E4E" }}>{result.findings.length} counts</span>
                </div>
                {result.findings.map((f, i) => <Finding key={i} f={f} i={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.015)", border: "none", borderTop: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", fontSize: 10, color: "#3A3A5E" }}>
          {open ? "▲ collapse" : "▼ show receipts"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton({ dimKey }: { dimKey: string }) {
  const meta = DIM[dimKey] ?? { label: dimKey, emoji: "🔥", color: "#FF2D55" };
  return (
    <div style={{ marginBottom: 16, borderRadius: 18, border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(160deg, #131328 0%, #0C0C1A 100%)", overflow: "hidden" }}>
      <div style={{ height: 2, background: `${meta.color}33` }}/>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${meta.color}0A`, border: `1px solid ${meta.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.4 }}>
          {meta.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#2E2E4E" }}>{meta.label}</p>
          <motion.div style={{ height: 2, borderRadius: 2, background: `${meta.color}33`, transformOrigin: "left" }}
            animate={{ scaleX: [0.1, 0.9, 0.4, 0.7, 0.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div style={{ width: 44, height: 44, border: `4px solid ${meta.color}22`, borderTopColor: meta.color, borderRadius: "50%" }}
          animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}/>
      </div>
    </div>
  );
}

/* ─── Locked ─────────────────────────────────────────────────────────────── */
function Locked({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.06)", marginBottom: 6 }}>
      <span style={{ opacity: 0.2, fontSize: 14 }}>{emoji}</span>
      <span style={{ fontSize: 12, color: "#2E2E4E", fontWeight: 500 }}>{label}</span>
      <Lock size={10} style={{ color: "#2E2E4E", marginLeft: "auto" }}/>
    </div>
  );
}

/* ─── Upsell ─────────────────────────────────────────────────────────────── */
function Upsell({ siteUrl }: { siteUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/stripe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteUrl }) });
      const d = await r.json() as { url?: string; error?: string };
      if (d.url) window.location.href = d.url;
      else { setErr(d.error ?? "failed"); setLoading(false); }
    } catch (e) { setErr(e instanceof Error ? e.message : "error"); setLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}
      style={{ marginTop: 8, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,45,85,0.2)", background: "linear-gradient(160deg, #1C0810 0%, #120A1E 60%, #0C0C1A 100%)", position: "relative" }}
    >
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 280, height: 280, background: "radial-gradient(circle, rgba(255,45,85,0.07) 0%, transparent 65%)", pointerEvents: "none" }}/>
      <div style={{ padding: "28px 22px", textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 900, color: "#F0EFF8", letterSpacing: "-0.02em" }}>
          6 more roasts waiting to destroy you
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#4A4A6E", lineHeight: 1.6, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
          You survived the preview. The full roast is worse. UX, Accessibility, Trust, Mobile, Performance, SEO — all getting dragged.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 22 }}>
          {LOCKED_DIMS.map(d => (
            <span key={d.key} style={{ padding: "3px 9px", borderRadius: 99, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 11.5, color: "#3A3A5E" }}>
              {d.emoji} {d.label}
            </span>
          ))}
        </div>
        <button onClick={pay} disabled={loading} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "13px 26px", borderRadius: 12,
          background: loading ? "#180608" : "linear-gradient(135deg, #FF2D55 0%, #FF6B3D 100%)",
          color: loading ? "#6E2030" : "#fff", border: "none", cursor: loading ? "default" : "pointer",
          fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
          boxShadow: loading ? "none" : "0 4px 24px rgba(255,45,85,0.35)", transition: "all 0.18s",
        }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }}/> : <CreditCard size={15}/>}
          {loading ? "Going to Stripe…" : "Unlock Full Roast — ₹2,499"}
        </button>
        {err && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#FF2D55" }}>{err}</p>}
        <p style={{ margin: "12px 0 0", fontSize: 10, color: "#2E2E4E" }}>one-time · no subscription · stripe</p>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const tier = (searchParams.get("tier") ?? "free") as "free" | "full";
  const paid = searchParams.get("paid") === "1";

  const [status, setStatus] = useState("warming up the roast machine…");
  const [dims, setDims]     = useState<DimensionResult[]>([]);
  const [done, setDone]     = useState(false);
  const [score, setScore]   = useState<number | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [shot, setShot]     = useState<string | null>(null);
  const [taunt, setTaunt]   = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!url || started.current) return;
    started.current = true;
    const form = new FormData();
    form.append("url", url); form.append("tier", tier);
    if (paid) form.append("paid", "1");
    const ctrl = new AbortController();
    fetch("/api/analyze", { method: "POST", body: form, signal: ctrl.signal })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body!.getReader(); const dec = new TextDecoder(); let buf = "";
        while (true) {
          const { done: rd, value } = await reader.read(); if (rd) break;
          buf += dec.decode(value, { stream: true });
          const parts = buf.split("\n\n"); buf = parts.pop() ?? "";
          for (const p of parts) {
            if (!p.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(p.slice(6));
              if (ev.type === "status")     setStatus(ev.payload.message);
              if (ev.type === "screenshot") setShot(ev.payload.url);
              if (ev.type === "dimension")  setDims(prev => [...prev, ev.payload]);
              if (ev.type === "done")       { setScore(ev.payload.overallScore); setDone(true); }
              if (ev.type === "error")      setError(ev.payload.message);
            } catch {/**/ }
          }
        }
      })
      .catch(e => { if (e.name !== "AbortError") setError(e.message); });
    return () => ctrl.abort();
  }, [url, tier, paid]);

  useEffect(() => {
    if (done || error) return;
    const t = setInterval(() => setTaunt(i => (i + 1) % TAUNTS.length), 2600);
    return () => clearInterval(t);
  }, [done, error]);

  if (!url) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Link href="/" style={{ color: "#FF2D55", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14}/> back</Link>
    </div>
  );

  const pendingDims = tier === "full"
    ? Object.keys(DIM).filter(d => !dims.find(r => r.dimension === d))
    : FREE_DIMS.filter(d => !dims.find(r => r.dimension === d));

  return (
    <div style={{ minHeight: "100vh", maxWidth: 680, margin: "0 auto", padding: "36px 18px 80px", color: "#F0EFF8" }}>

      {/* Top nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#2E2E4E", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#6E6D8E")}
          onMouseLeave={e => (e.currentTarget.style.color = "#2E2E4E")}
        >
          <ArrowLeft size={11}/> roastlab
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Flame size={11} color="#FF2D55"/>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF2D55" }}>
            {tier === "full" && paid ? "full roast" : "free roast"}
          </span>
          <span style={{ fontSize: 10, color: "#2E2E4E" }}>· {dims.length}/{tier === "full" ? 9 : 3}</span>
        </div>
      </div>

      {/* URL */}
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#DDDDF0", textDecoration: "none", fontFamily: "monospace", marginBottom: 20, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {url} <ExternalLink size={10} style={{ color: "#3A3A5E", flexShrink: 0 }}/>
      </a>

      {/* Screenshot */}
      <AnimatePresence>{shot && <SiteFrame imgUrl={shot} siteUrl={url} />}</AnimatePresence>

      {/* Big verdict */}
      <AnimatePresence>
        {done && score !== null && <VerdictHero score={score} dims={dims} />}
      </AnimatePresence>

      {/* Live status */}
      {!done && !error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", marginBottom: 20, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
          <motion.div style={{ width: 12, height: 12, border: "2px solid rgba(255,45,85,0.15)", borderTopColor: "#FF2D55", borderRadius: "50%", flexShrink: 0 }}
            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>
          <AnimatePresence mode="wait">
            <motion.span key={dims.length === 0 ? "s" : taunt}
              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 12, color: "#5A5A80" }}
            >
              {dims.length === 0 ? status : TAUNTS[taunt]}
            </motion.span>
          </AnimatePresence>
          <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <motion.div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#FF2D55" }}
                animate={{ opacity: [0.1, 1, 0.1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}/>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "12px 16px", marginBottom: 20, borderRadius: 10, background: "rgba(255,45,85,0.06)", border: "1px solid rgba(255,45,85,0.18)", fontSize: 13, color: "#FF6B8A", lineHeight: 1.5 }}>
          ☠️ {error}
        </motion.div>
      )}

      {/* Roasts section label */}
      {(dims.length > 0 || (!done && !error)) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2E2E4E" }}>
            {done ? "🔥 the full damage" : "📡 live roasting…"}
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }}/>
        </div>
      )}

      {/* Cards */}
      {dims.map((d, i) => <RoastCard key={d.dimension} result={d} idx={i} />)}
      {!done && !error && pendingDims.map(d => <Skeleton key={d} dimKey={d} />)}

      {/* Locked + upsell */}
      {done && tier !== "full" && (
        <>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "#2E2E4E" }}>🔒 still locked</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.04)" }}/>
            </div>
            {LOCKED_DIMS.map(d => <Locked key={d.key} label={d.label} emoji={d.emoji} />)}
          </div>
          <Upsell siteUrl={url} />
        </>
      )}

      {done && tier === "full" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(50,215,75,0.04)", border: "1px solid rgba(50,215,75,0.14)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{ fontSize: 13, color: "#32D74B", fontWeight: 600 }}>all 9 roasts delivered. the receipts are in. 💀</span>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div style={{ width: 24, height: 24, border: "2.5px solid rgba(255,45,85,0.15)", borderTopColor: "#FF2D55", borderRadius: "50%" }}
          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}/>
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
