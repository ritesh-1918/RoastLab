"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, CheckCircle2, Info, Zap, ArrowLeft,
  Flame, Lock, ExternalLink, CreditCard, Loader2, Eye
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Severity = "critical" | "high" | "medium" | "good";
interface Finding { severity: Severity; title: string; quote?: string; action: string; }
interface DimensionResult { dimension: string; score: number; summary: string; findings: Finding[]; }

/* ─── Config ─────────────────────────────────────────────────────────────── */
const LABELS: Record<string, string> = {
  visual_design: "Visual Design", copywriting: "Copywriting", cta: "CTA",
  ux_flow: "UX Flow", accessibility: "Accessibility", trust_signals: "Trust Signals",
  mobile_experience: "Mobile", performance: "Performance", seo: "SEO",
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

const SEV: Record<Severity, { color: string; bg: string; label: string; emoji: string; icon: React.ReactNode }> = {
  critical: { color: "#FF4D1C", bg: "rgba(255,77,28,0.08)",   label: "Critical", emoji: "💀", icon: <AlertTriangle size={10}/> },
  high:     { color: "#FF9F0A", bg: "rgba(255,159,10,0.08)",  label: "High",     emoji: "🔥", icon: <Zap size={10}/> },
  medium:   { color: "#F5C842", bg: "rgba(245,200,66,0.08)",  label: "Medium",   emoji: "😬", icon: <Info size={10}/> },
  good:     { color: "#30D158", bg: "rgba(48,209,88,0.08)",   label: "Good",     emoji: "✅", icon: <CheckCircle2 size={10}/> },
};

const SCORE_MEME: Array<{min: number; label: string; emoji: string; color: string; subtext: string}> = [
  { min: 75, label: "ok this actually slaps", emoji: "🔥", color: "#30D158", subtext: "understood the assignment ngl" },
  { min: 60, label: "mid but it tried", emoji: "😐", color: "#F5C842", subtext: "participation trophy behavior" },
  { min: 40, label: "bestie what is this", emoji: "💀", color: "#FF9F0A", subtext: "deployed and prayed" },
  { min: 0,  label: "call 911 immediately", emoji: "☠️", color: "#FF4D1C", subtext: "sent it without looking" },
];

const TAUNTS = [
  "🔬 Scanning the evidence…",
  "😤 AI is judging your choices…",
  "🧐 Finding every crime…",
  "💅 The roast is being cooked…",
  "🎯 Locating all the fumbles…",
  "⚠️ This might be a lot…",
  "☕ Brewing maximum shade…",
];

/* ─── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const sw = size > 80 ? 6 : 5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 65 ? "#30D158" : score >= 40 ? "#F5C842" : "#FF4D1C";
  const id = `ring-${size}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${id})`} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.1 }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={Math.round(size * 0.24)} fontWeight="800" fill="#F0EFF8"
        fontFamily="-apple-system,BlinkMacSystemFont,Inter,sans-serif">
        {score}
      </text>
    </svg>
  );
}

/* ─── Meme Reaction Burst ────────────────────────────────────────────────── */
function ReactionBurst({ score }: { score: number }) {
  const meme = SCORE_MEME.find(m => score >= m.min)!;
  const particles = ["💀","🔥","😭","💅","⚰️","😤","🤡","💔","😬","🧨"];
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {particles.slice(0, 8).map((p, i) => (
        <motion.span key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos(i * 45 * Math.PI / 180) * 55,
            y: Math.sin(i * 45 * Math.PI / 180) * 55,
            scale: [0, 1.2, 0],
          }}
          transition={{ duration: 1.1, delay: 0.25 + i * 0.08, ease: "easeOut" }}
          style={{ position: "absolute", fontSize: 15, pointerEvents: "none", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        >
          {p}
        </motion.span>
      ))}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.34,1.56,0.64,1] }}
        style={{ fontSize: 44, lineHeight: 1, filter: `drop-shadow(0 0 10px ${meme.color}55)` }}
      >
        {meme.emoji}
      </motion.div>
    </div>
  );
}

/* ─── Website Screenshot Preview ────────────────────────────────────────── */
function ScreenshotPreview({ screenshotUrl, siteUrl }: { screenshotUrl: string; siteUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
      style={{
        borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#0A0A14", position: "relative", marginBottom: 28,
      }}
    >
      {/* Fake browser chrome */}
      <div style={{
        padding: "10px 14px", background: "#141420",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map((c,i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }}/>
        ))}
        <div style={{
          flex: 1, background: "#0F0F1C", borderRadius: 6,
          padding: "4px 10px", fontSize: 11, color: "#4E4D6E",
          fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginLeft: 4,
        }}>
          {siteUrl}
        </div>
        <Eye size={12} style={{ color: "#4E4D6E", flexShrink: 0 }} />
      </div>

      {/* Screenshot */}
      <div style={{ position: "relative", maxHeight: 280, overflow: "hidden" }}>
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "#0A0A14",
            display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120,
          }}>
            <motion.div
              style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.06)", borderTopColor: "#FF4D1C", borderRadius: "50%" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt="Website screenshot"
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%", display: "block",
            filter: "brightness(0.88) saturate(0.85)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s",
          }}
        />
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 70,
          background: "linear-gradient(transparent, #0A0A14)", pointerEvents: "none",
        }}/>
        {/* ROASTING stamp */}
        {loaded && (
          <motion.div
            initial={{ opacity: 0, rotate: -20, scale: 1.6 }}
            animate={{ opacity: 1, rotate: -7, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              position: "absolute", top: 14, right: 14,
              padding: "5px 12px", borderRadius: 5,
              border: "2.5px solid rgba(255,77,28,0.7)",
              color: "rgba(255,77,28,0.85)",
              fontSize: 13, fontWeight: 900, fontFamily: "serif",
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}
          >
            🔥 ROASTING
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Finding Card ───────────────────────────────────────────────────────── */
function FindingCard({ f, i }: { f: Finding; i: number }) {
  const s = SEV[f.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, delay: i * 0.07 }}
      style={{
        background: s.bg,
        border: `1px solid ${s.color}1A`,
        borderLeft: `3px solid ${s.color}`,
        borderRadius: "0 10px 10px 0",
        padding: "10px 13px", marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0,
          padding: "2px 6px", borderRadius: 4, marginTop: 2,
          fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em",
          background: `${s.color}18`, color: s.color,
        }}>
          {s.emoji} {s.label}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 700, color: "#EDEEFA", lineHeight: 1.3 }}>
            {f.title}
          </p>
          {f.quote && (
            <div style={{
              margin: "0 0 6px", padding: "5px 10px",
              background: "rgba(0,0,0,0.3)", borderRadius: 6,
              fontSize: 11.5, fontStyle: "italic",
              color: "#7E7D9A", lineHeight: 1.5,
              borderLeft: `2px solid ${s.color}33`,
            }}>
              &ldquo;{f.quote}&rdquo;
            </div>
          )}
          <p style={{ margin: 0, fontSize: 11.5, color: "#9997BC", lineHeight: 1.45 }}>
            <span style={{ color: s.color, fontWeight: 700 }}>→ </span>{f.action}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Dimension Card ─────────────────────────────────────────────────────── */
function DimCard({ result, idx }: { result: DimensionResult; idx: number }) {
  const [open, setOpen] = useState(true);
  const label = LABELS[result.dimension] ?? result.dimension;
  const worst = result.findings.find(f => f.severity === "critical") ? "critical"
    : result.findings.find(f => f.severity === "high") ? "high"
    : result.findings.find(f => f.severity === "medium") ? "medium" : "good";
  const s = SEV[worst];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -6 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16,1,0.3,1] }}
      style={{
        borderRadius: 18,
        background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${s.color}0D`,
      }}
      whileHover={{ y: -2 }}
    >
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 16,
        padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            position: "absolute", inset: -5, borderRadius: "50%",
            background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`,
          }}/>
          <ScoreRing score={result.score} size={60} />
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: s.color }}>
              {s.emoji} {label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "#B8B7D0", lineHeight: 1.4 }}>
            {result.summary}
          </p>
        </div>
        <div style={{
          fontSize: 9, color: "#4E4D6E",
          padding: "4px 7px", background: "rgba(255,255,255,0.04)", borderRadius: 5, flexShrink: 0,
        }}>
          {open ? "▲" : "▼"}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.27, ease: [0.16,1,0.3,1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: `1px solid ${s.color}14`, padding: "10px 20px 15px" }}>
              {result.findings.map((f, i) => <FindingCard key={i} f={f} i={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton({ label }: { label: string }) {
  return (
    <div style={{
      borderRadius: 16, padding: "16px 20px",
      background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
      border: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
        <svg width={60} height={60} viewBox="0 0 60 60">
          <circle cx={30} cy={30} r={25} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5}/>
        </svg>
        <motion.div style={{
          position: "absolute", inset: 0,
          border: "5px solid transparent", borderTopColor: "#FF4D1C55", borderRadius: "50%",
        }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF4D1C55", marginBottom: 5 }}>
          ⏳ {label}
        </div>
        <div style={{ fontSize: 11, color: "#32305A" }}>AI is composing the roast…</div>
      </div>
    </div>
  );
}

/* ─── Locked Card ────────────────────────────────────────────────────────── */
function LockedCard({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div style={{
      borderRadius: 12, padding: "11px 16px",
      background: "rgba(10,10,20,0.4)",
      border: "1px dashed rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 13, opacity: 0.3 }}>{emoji}</span>
      <span style={{ fontSize: 12.5, color: "#3E3D5E", fontWeight: 600 }}>{label}</span>
      <Lock size={11} style={{ color: "#3E3D5E", marginLeft: "auto" }} />
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
      const res = await fetch("/api/stripe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; }
      else { setErr(data.error ?? "Payment failed"); setLoading(false); }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.16,1,0.3,1] }}
      style={{
        marginTop: 28, borderRadius: 22,
        background: "linear-gradient(135deg, #1A0A06 0%, #130E22 60%, #0D0D1A 100%)",
        border: "1px solid rgba(255,77,28,0.18)",
        overflow: "hidden", position: "relative",
        boxShadow: "0 0 80px rgba(255,77,28,0.05)",
      }}
    >
      <div style={{ padding: "28px 24px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", top: -50, left: "50%", transform: "translateX(-50%)",
          width: 220, height: 220,
          background: "radial-gradient(circle, rgba(255,77,28,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 12px", borderRadius: 99,
          background: "rgba(255,77,28,0.1)", border: "1px solid rgba(255,77,28,0.2)",
          color: "#FF6B3D", fontSize: 10, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16,
        }}>
          <Flame size={10}/> 6 dimensions still locked
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 23, fontWeight: 900, color: "#F0EFF8", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          There&apos;s more pain to uncover 🫣
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#9997BC", lineHeight: 1.55, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
          You only saw the appetizer. Full roast tears apart:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", margin: "10px auto 22px", maxWidth: 400 }}>
          {LOCKED_DIMS.map(d => (
            <span key={d.key} style={{
              padding: "3px 10px", borderRadius: 99,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              fontSize: 11.5, color: "#7E7D9A", fontWeight: 500,
            }}>{d.emoji} {d.label}</span>
          ))}
        </div>
        <button onClick={pay} disabled={loading} style={{
          display: "inline-flex", alignItems: "center", gap: 9,
          padding: "13px 26px", borderRadius: 12,
          background: loading ? "#2A1810" : "linear-gradient(135deg, #FF4D1C 0%, #FF6B3D 100%)",
          color: loading ? "#7E4D38" : "#fff",
          border: "none", cursor: loading ? "default" : "pointer",
          fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em",
          boxShadow: loading ? "none" : "0 6px 26px rgba(255,77,28,0.32)",
          transition: "all 0.18s",
        }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={15}/>}
          {loading ? "Redirecting…" : "Unlock Full Roast — ₹2,499"}
        </button>
        {err && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#FF4D1C" }}>{err}</p>}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 11 }}>
          {["One-time", "No subscription", "Stripe secured"].map((t,i) => (
            <span key={i} style={{ fontSize: 10, color: "#3E3D5E" }}>{t}</span>
          ))}
        </div>
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

  const [status, setStatus] = useState("Initializing…");
  const [dims, setDims] = useState<DimensionResult[]>([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [tauntIdx, setTauntIdx] = useState(0);
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
          const lines = buf.split("\n\n");
          buf = lines.pop() ?? "";
          for (const ln of lines) {
            if (!ln.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(ln.slice(6));
              if (ev.type === "status")     setStatus(ev.payload.message);
              if (ev.type === "screenshot") setScreenshotUrl(ev.payload.url);
              if (ev.type === "dimension")  setDims(p => [...p, ev.payload]);
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
    const t = setInterval(() => setTauntIdx(i => (i + 1) % TAUNTS.length), 2800);
    return () => clearInterval(t);
  }, [done, error]);

  if (!url) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#B8B7D0", marginBottom: 16 }}>No URL provided.</p>
        <Link href="/" style={{ color: "#FF4D1C", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14}/> Go back
        </Link>
      </div>
    </div>
  );

  const meme = score !== null ? SCORE_MEME.find(m => score >= m.min)! : null;
  const loadingDims = tier === "full"
    ? Object.keys(LABELS).filter(d => !dims.find(r => r.dimension === d))
    : FREE_DIMS.filter(d => !dims.find(r => r.dimension === d));

  return (
    <div style={{ minHeight: "100vh", maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px", color: "#F0EFF8" }}>
      {/* Back */}
      <Link href="/" style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 12, color: "#3E3D5E", textDecoration: "none", marginBottom: 28,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#9997BC")}
        onMouseLeave={e => (e.currentTarget.style.color = "#3E3D5E")}
      >
        <ArrowLeft size={12}/> RoastLab
      </Link>

      {/* Site header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Flame size={13} color="#FF4D1C"/>
          <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF4D1C" }}>
            {tier === "full" && paid ? "Full Roast" : "Free Roast"} · {dims.length}/{tier === "full" ? 9 : 3} dimensions
          </span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 14, fontWeight: 600, color: "#EDEEFA",
          textDecoration: "none", fontFamily: "monospace",
          maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {url} <ExternalLink size={11} style={{ color: "#4E4D6E", flexShrink: 0 }}/>
        </a>
      </div>

      {/* Screenshot preview — shows actual captured site */}
      <AnimatePresence>
        {screenshotUrl && (
          <ScreenshotPreview screenshotUrl={screenshotUrl} siteUrl={url} />
        )}
      </AnimatePresence>

      {/* Overall score card */}
      <AnimatePresence>
        {done && score !== null && meme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }}
            style={{
              borderRadius: 22,
              background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "22px 24px",
              display: "flex", alignItems: "center", gap: 20,
              marginBottom: 28,
              boxShadow: "0 8px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <ReactionBurst score={score} />
              <ScoreRing score={score} size={88} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3E3D5E" }}>
                Overall Roast Score
              </p>
              <p style={{ margin: "0 0 3px", fontSize: 22, fontWeight: 900, color: meme.color, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                {meme.label}
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "#4E4D6E", fontStyle: "italic" }}>
                {meme.subtext}
              </p>
              {/* Dim score pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {dims.map(d => {
                  const c = d.score >= 65 ? "#30D158" : d.score >= 40 ? "#F5C842" : "#FF4D1C";
                  return (
                    <span key={d.dimension} style={{
                      padding: "2px 7px", borderRadius: 5,
                      background: `${c}12`, border: `1px solid ${c}28`,
                      fontSize: 10, color: c, fontWeight: 700,
                    }}>
                      {LABELS[d.dimension]} {d.score}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live status bar */}
      {!done && !error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", marginBottom: 20,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12,
        }}>
          <motion.div style={{
            width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
            border: "2.5px solid rgba(255,255,255,0.06)", borderTopColor: "#FF4D1C",
          }} animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}/>
          <AnimatePresence mode="wait">
            <motion.span key={dims.length === 0 ? "s" : tauntIdx}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 12.5, color: "#9997BC" }}
            >
              {dims.length === 0 ? status : TAUNTS[tauntIdx]}
            </motion.span>
          </AnimatePresence>
          <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <motion.div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF4D1C" }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
          padding: "13px 16px", marginBottom: 20, borderRadius: 12,
          background: "rgba(255,77,28,0.06)", border: "1px solid rgba(255,77,28,0.2)",
          fontSize: 13.5, color: "#FF6B3D", lineHeight: 1.5,
        }}>
          ☠️ {error}
        </motion.div>
      )}

      {/* Section label */}
      {(dims.length > 0 || (!done && !error)) && (
        <p style={{ fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3E3D5E", marginBottom: 12 }}>
          {tier === "full" ? "All 9 Dimensions" : "Free Preview (3 of 9)"}
        </p>
      )}

      {/* Dimension cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dims.map((d, i) => <DimCard key={d.dimension} result={d} idx={i} />)}
        {!done && !error && loadingDims.map(d => <Skeleton key={d} label={LABELS[d] ?? d} />)}
      </div>

      {/* Locked + upsell */}
      {done && tier !== "full" && (
        <>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#3E3D5E", marginBottom: 10 }}>
              Locked (6 of 9)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {LOCKED_DIMS.map(d => <LockedCard key={d.key} label={d.label} emoji={d.emoji} />)}
            </div>
          </div>
          <Upsell siteUrl={url} />
        </>
      )}

      {/* Full audit done */}
      {done && tier === "full" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{
            marginTop: 24, padding: "14px 18px", borderRadius: 14,
            background: "rgba(48,209,88,0.05)", border: "1px solid rgba(48,209,88,0.16)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
          <CheckCircle2 size={15} color="#30D158"/>
          <span style={{ fontSize: 13, color: "#30D158", fontWeight: 600 }}>
            All 9 dimensions roasted. The evidence is damning. 💀
          </span>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Export ─────────────────────────────────────────────────────────────── */
export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.06)", borderTopColor: "#FF4D1C", borderRadius: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
        />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
