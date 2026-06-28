"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, Zap, ArrowLeft, Flame, Lock, ExternalLink, CreditCard, Loader2 } from "lucide-react";

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
  { key: "ux_flow", label: "UX Flow", icon: "⟳" },
  { key: "accessibility", label: "Accessibility", icon: "♿" },
  { key: "trust_signals", label: "Trust Signals", icon: "🔒" },
  { key: "mobile_experience", label: "Mobile", icon: "📱" },
  { key: "performance", label: "Performance", icon: "⚡" },
  { key: "seo", label: "SEO", icon: "🔍" },
];

const SEV: Record<Severity, { color: string; glow: string; bg: string; label: string; icon: React.ReactNode }> = {
  critical: { color: "#FF4D1C", glow: "rgba(255,77,28,0.2)", bg: "rgba(255,77,28,0.1)", label: "Critical", icon: <AlertTriangle size={10} strokeWidth={2.5}/> },
  high:     { color: "#FF9F0A", glow: "rgba(255,159,10,0.2)", bg: "rgba(255,159,10,0.1)", label: "High",     icon: <Zap size={10} strokeWidth={2.5}/> },
  medium:   { color: "#F5C842", glow: "rgba(245,200,66,0.2)", bg: "rgba(245,200,66,0.1)", label: "Medium",   icon: <Info size={10} strokeWidth={2.5}/> },
  good:     { color: "#30D158", glow: "rgba(48,209,88,0.2)",  bg: "rgba(48,209,88,0.1)",  label: "Good",     icon: <CheckCircle2 size={10} strokeWidth={2.5}/> },
};

const TAUNTS = [
  "Firing up the shame cannon…",
  "Your designer is sweating rn…",
  "Counting the sins…",
  "This might sting…",
  "Loading brutal honesty…",
  "Charging up the roast laser…",
  "Zero chill mode: activated…",
];

/* ─── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const sw = 5.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 65 ? "#30D158" : score >= 40 ? "#F5C842" : "#FF4D1C";
  const ringId = `ring-${size}-${score}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw}/>
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#${ringId})`} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 ${sw}px ${color}66)` }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={Math.round(size * 0.24)} fontWeight="800" fill="#F0EFF8"
        fontFamily="-apple-system,BlinkMacSystemFont,'Inter',sans-serif">
        {score}
      </text>
    </svg>
  );
}

/* ─── Finding card ───────────────────────────────────────────────────────── */
function Finding({ f, i }: { f: Finding; i: number }) {
  const s = SEV[f.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.07 }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderLeft: `3px solid ${s.color}`,
        borderRadius: "0 10px 10px 0",
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Badge */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0,
          padding: "2px 7px", borderRadius: 99, marginTop: 1,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
          background: s.bg, color: s.color,
        }}>
          {s.icon} {s.label}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13.5, fontWeight: 650, color: "#EDEEFA", lineHeight: 1.35 }}>
            {f.title}
          </p>
          {f.quote && (
            <div style={{
              margin: "0 0 8px",
              padding: "7px 12px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
              fontSize: 12,
              fontStyle: "italic",
              color: "#9997BC",
              lineHeight: 1.5,
            }}>
              &ldquo;{f.quote}&rdquo;
            </div>
          )}
          <p style={{ margin: 0, fontSize: 12, color: "#7E7D9A", lineHeight: 1.5 }}>
            <span style={{ color: s.color, fontWeight: 700 }}>→ </span>{f.action}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Dimension card ─────────────────────────────────────────────────────── */
function DimCard({ result, idx }: { result: DimensionResult; idx: number }) {
  const [open, setOpen] = useState(true);
  const label = LABELS[result.dimension] ?? result.dimension;
  const worst = result.findings.find(f => f.severity === "critical") ? "critical"
    : result.findings.find(f => f.severity === "high") ? "high"
    : result.findings.find(f => f.severity === "medium") ? "medium" : "good";
  const accent = SEV[worst].color;
  const glow = SEV[worst].glow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Header */}
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 18,
        padding: "18px 20px", background: "none", border: "none", cursor: "pointer",
      }}>
        {/* Score with glow */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          }} />
          <ScoreRing score={result.score} size={62} />
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          {/* Label tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
              color: accent,
            }}>{label}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
              padding: "1px 6px", borderRadius: 4,
              background: SEV[worst].bg, color: accent,
            }}>{worst}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#B8B7D0", lineHeight: 1.45 }}>
            {result.summary}
          </p>
        </div>

        <div style={{
          fontSize: 11, color: "#4E4D6E",
          padding: "5px 9px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6, flexShrink: 0,
        }}>
          {open ? "▲" : "▼"}
        </div>
      </button>

      {/* Findings */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              padding: "12px 20px 16px",
            }}>
              {result.findings.map((f, i) => <Finding key={i} f={f} i={i} />)}
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
      borderRadius: 18, padding: "18px 20px",
      background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
      border: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{ position: "relative", width: 62, height: 62, flexShrink: 0 }}>
        <svg width={62} height={62} viewBox="0 0 62 62">
          <circle cx={31} cy={31} r={26} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5.5}/>
        </svg>
        <motion.div style={{
          position: "absolute", inset: 0,
          border: "5px solid transparent",
          borderTopColor: "#FF4D1C",
          borderRadius: "50%",
        }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}/>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF4D1C", marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {[0,1,2].map(i => (
            <motion.div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#32305A" }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Locked card ────────────────────────────────────────────────────────── */
function LockedCard({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{
      borderRadius: 14, padding: "13px 18px",
      background: "rgba(13,13,28,0.5)",
      border: "1px dashed rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 15, opacity: 0.4 }}>{icon}</span>
      <span style={{ fontSize: 13, color: "#4E4D6E", fontWeight: 500 }}>{label}</span>
      <Lock size={12} style={{ color: "#4E4D6E", marginLeft: "auto" }} />
    </div>
  );
}

/* ─── Upsell / payment ───────────────────────────────────────────────────── */
function Upsell({ siteUrl }: { siteUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function pay() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErr(data.error ?? "Payment failed");
        setLoading(false);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 32,
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Gradient border trick */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22,
        padding: 1,
        background: "linear-gradient(135deg, rgba(255,77,28,0.5) 0%, rgba(100,80,200,0.3) 100%)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "linear-gradient(135deg, #1A0E0A 0%, #130E22 50%, #0F0F1C 100%)",
        padding: "32px 28px",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,77,28,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 14px", borderRadius: 99,
          background: "rgba(255,77,28,0.12)",
          border: "1px solid rgba(255,77,28,0.2)",
          color: "#FF6B3D",
          fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 18,
        }}>
          <Flame size={11} /> 6 more dimensions waiting
        </div>

        <h2 style={{
          margin: "0 0 12px",
          fontSize: 26, fontWeight: 900,
          color: "#F0EFF8", lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}>
          There&apos;s more pain<br />to uncover
        </h2>

        <p style={{
          margin: "0 0 8px",
          fontSize: 14, color: "#9997BC", lineHeight: 1.6,
          maxWidth: 380, marginLeft: "auto", marginRight: "auto",
        }}>
          You saw 3 free dimensions. The full roast unlocks 6 more:
        </p>

        {/* Dimension pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6,
          justifyContent: "center", margin: "12px auto 24px",
          maxWidth: 380,
        }}>
          {["UX Flow", "Accessibility", "Trust Signals", "Mobile", "Performance", "SEO"].map(d => (
            <span key={d} style={{
              padding: "4px 10px", borderRadius: 99,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 12, color: "#9997BC", fontWeight: 500,
            }}>{d}</span>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button
            onClick={pay}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "15px 32px", borderRadius: 14,
              background: loading ? "#2A1810" : "linear-gradient(135deg, #FF4D1C 0%, #FF6B3D 100%)",
              color: loading ? "#7E4D38" : "#fff",
              border: "none", cursor: loading ? "default" : "pointer",
              fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em",
              boxShadow: loading ? "none" : "0 8px 32px rgba(255,77,28,0.35), 0 2px 8px rgba(0,0,0,0.5)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {loading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <CreditCard size={17} />}
            {loading ? "Redirecting to payment…" : "Unlock Full Roast — ₹2,499"}
          </button>

          {err && (
            <p style={{ margin: 0, fontSize: 12, color: "#FF4D1C" }}>{err}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {["One-time payment", "No subscription", "Powered by Stripe"].map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: "#4E4D6E", display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && <span style={{ color: "#22213A" }}>·</span>} {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main content ───────────────────────────────────────────────────────── */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const tier = (searchParams.get("tier") ?? "free") as "free" | "full";
  const paid = searchParams.get("paid") === "1";

  const [status, setStatus] = useState("Capturing screenshot…");
  const [dims, setDims] = useState<DimensionResult[]>([]);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taunt, setTaunt] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!url || started.current) return;
    started.current = true;

    const form = new FormData();
    form.append("url", url);
    form.append("tier", tier);
    // Skip rate limit for paid users
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
              if (ev.type === "status")    setStatus(ev.payload.message);
              if (ev.type === "dimension") setDims(p => [...p, ev.payload]);
              if (ev.type === "done")      { setScore(ev.payload.overallScore); setDone(true); }
              if (ev.type === "error")     setError(ev.payload.message);
            } catch { /**/ }
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
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#B8B7D0", marginBottom: 16 }}>No URL provided.</p>
        <Link href="/" style={{ color: "#FF4D1C", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <ArrowLeft size={14} /> Go back
        </Link>
      </div>
    </div>
  );

  const verdict =
    score === null ? null
    : score >= 70 ? { text: "Ok fine, this actually slaps 👏", color: "#30D158" }
    : score >= 55 ? { text: "Mid. Potential, but fumbling it.", color: "#F5C842" }
    : score >= 35 ? { text: "Babe wake up, new problems just dropped 💀", color: "#FF9F0A" }
    : { text: "I deployed at 3am and prayed energy ☠️", color: "#FF4D1C" };

  const loadingDims = tier === "full"
    ? Object.keys(LABELS).filter(d => !dims.find(r => r.dimension === d))
    : FREE_DIMS.filter(d => !dims.find(r => r.dimension === d));

  return (
    <div style={{
      minHeight: "100vh",
      maxWidth: 700,
      margin: "0 auto",
      padding: "44px 20px 80px",
      color: "#F0EFF8",
    }}>
      {/* Back */}
      <Link href="/" style={{
        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13,
        color: "#4E4D6E", textDecoration: "none", marginBottom: 36,
        transition: "color 0.15s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#9997BC")}
        onMouseLeave={e => (e.currentTarget.style.color = "#4E4D6E")}
      >
        <ArrowLeft size={13} /> RoastLab
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <Flame size={15} color="#FF4D1C" />
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF4D1C" }}>
            {tier === "full" && paid ? "Full Audit" : "Free Audit"}
          </span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 5, fontSize: 15, fontWeight: 600,
          color: "#EDEEFA", textDecoration: "none", fontFamily: "var(--font-geist-mono, monospace)",
          maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {url} <ExternalLink size={12} style={{ color: "#4E4D6E", flexShrink: 0 }} />
        </a>
      </div>

      {/* Overall score */}
      <AnimatePresence>
        {done && score !== null && verdict && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "linear-gradient(145deg, #141424 0%, #0F0F1C 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              padding: "24px 26px",
              display: "flex", alignItems: "center", gap: 22,
              marginBottom: 32,
              boxShadow: "0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                background: `radial-gradient(circle, ${verdict.color}20 0%, transparent 70%)`,
              }}/>
              <ScoreRing score={score} size={92} />
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4E4D6E" }}>
                Overall Roast Score
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: verdict.color, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                {verdict.text}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#7E7D9A" }}>
                {dims.length} of 9 dimensions · {tier === "full" ? "Full audit" : "Free preview"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading status */}
      {!done && !error && (
        <AnimatePresence mode="wait">
          <motion.div key={taunt}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", marginBottom: 24,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12,
            }}
          >
            <motion.div style={{
              width: 15, height: 15, borderRadius: "50%",
              border: "2.5px solid rgba(255,255,255,0.06)",
              borderTopColor: "#FF4D1C", flexShrink: 0,
            }} animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}/>
            <span style={{ fontSize: 13, color: "#9997BC" }}>
              {dims.length === 0 ? status : TAUNTS[taunt]}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            padding: "14px 18px", marginBottom: 24, borderRadius: 12,
            background: "rgba(255,77,28,0.07)",
            border: "1px solid rgba(255,77,28,0.25)",
            fontSize: 14, color: "#FF6B3D", lineHeight: 1.5,
          }}>
          {error}
        </motion.div>
      )}

      {/* Section header */}
      {(dims.length > 0 || (!done && !error)) && (
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4E4D6E", marginBottom: 14 }}>
          {tier === "full" ? "All 9 Dimensions" : "Free Dimensions (3 of 9)"}
        </p>
      )}

      {/* Dimension cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {dims.map((d, i) => <DimCard key={d.dimension} result={d} idx={i} />)}
        {!done && !error && loadingDims.map(d => <Skeleton key={d} label={LABELS[d] ?? d} />)}
      </div>

      {/* Locked preview + upsell */}
      {done && tier !== "full" && (
        <>
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4E4D6E", marginBottom: 12 }}>
              Locked (6 of 9)
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LOCKED_DIMS.map(d => <LockedCard key={d.key} label={d.label} icon={d.icon} />)}
            </div>
          </div>
          <Upsell siteUrl={url} />
        </>
      )}

      {/* Done — full audit */}
      {done && tier === "full" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 28, padding: "18px 22px", borderRadius: 14,
            background: "rgba(48,209,88,0.06)",
            border: "1px solid rgba(48,209,88,0.2)",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <CheckCircle2 size={18} color="#30D158" />
          <span style={{ fontSize: 13, color: "#30D158", fontWeight: 600 }}>
            Full roast complete — all 9 dimensions analysed.
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
          style={{ width: 30, height: 30, border: "3px solid rgba(255,255,255,0.06)", borderTopColor: "#FF4D1C", borderRadius: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
        />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
