"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, CheckCircle2, Info, Zap, ArrowLeft,
  Flame, Lock, ExternalLink
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Severity = "critical" | "high" | "medium" | "good";

interface Finding {
  severity: Severity;
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

/* ─── Constants ──────────────────────────────────────────────────────────── */

const DIMENSION_LABELS: Record<string, string> = {
  visual_design: "Visual Design",
  copywriting: "Copywriting",
  cta: "CTA",
  ux_flow: "UX Flow",
  accessibility: "Accessibility",
  trust_signals: "Trust Signals",
  mobile_experience: "Mobile",
  performance: "Performance",
  seo: "SEO",
};

const FREE_DIMS = ["visual_design", "copywriting", "cta"];

const LOCKED_DIMS = [
  { key: "ux_flow", label: "UX Flow" },
  { key: "accessibility", label: "Accessibility" },
  { key: "trust_signals", label: "Trust Signals" },
  { key: "mobile_experience", label: "Mobile" },
  { key: "performance", label: "Performance" },
  { key: "seo", label: "SEO" },
];

const SEV_CONFIG: Record<Severity, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  critical: {
    color: "#FF4D1C",
    bg: "rgba(255,77,28,0.12)",
    label: "Critical",
    icon: <AlertTriangle size={11} />,
  },
  high: {
    color: "#FF9F0A",
    bg: "rgba(255,159,10,0.12)",
    label: "High",
    icon: <Zap size={11} />,
  },
  medium: {
    color: "#F5C842",
    bg: "rgba(245,200,66,0.12)",
    label: "Medium",
    icon: <Info size={11} />,
  },
  good: {
    color: "#34C759",
    bg: "rgba(52,199,89,0.12)",
    label: "Good",
    icon: <CheckCircle2 size={11} />,
  },
};

const ROAST_TAUNTS = [
  "Firing up the shame cannon…",
  "Consulting the council of bad design…",
  "Counting the UX sins…",
  "Your designer will not like this…",
  "This might sting a little…",
  "Preparing the verdict…",
  "Taking notes on your life choices…",
];

/* ─── Score Ring ─────────────────────────────────────────────────────────── */

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const stroke = size < 70 ? 5 : 6;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color =
    score >= 65 ? "#34C759" : score >= 40 ? "#F5C842" : "#FF4D1C";
  const fontSize = Math.round(size * 0.24);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={fontSize} fontWeight="800" fill="#F0EFF8">
        {score}
      </text>
    </svg>
  );
}

/* ─── Finding Item ───────────────────────────────────────────────────────── */

function FindingItem({ finding, index }: { finding: Finding; index: number }) {
  const cfg = SEV_CONFIG[finding.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Severity badge */}
      <div style={{ paddingTop: 2 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            padding: "2px 7px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            background: cfg.bg,
            color: cfg.color,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <p style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: "#F0EFF8",
          lineHeight: 1.4,
          marginBottom: finding.quote ? 6 : 4,
        }}>
          {finding.title}
        </p>

        {/* Quote */}
        {finding.quote && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            borderLeft: `3px solid ${cfg.color}`,
            borderRadius: "0 6px 6px 0",
            padding: "6px 10px",
            marginBottom: 6,
            fontSize: 12,
            fontStyle: "italic",
            color: "#B8B7D0",
            lineHeight: 1.5,
          }}>
            &ldquo;{finding.quote}&rdquo;
          </div>
        )}

        {/* Action */}
        <p style={{
          margin: 0,
          fontSize: 12,
          color: "#7E7D9A",
          lineHeight: 1.5,
        }}>
          <span style={{ color: cfg.color, fontWeight: 600, marginRight: 4 }}>→</span>
          {finding.action}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Dimension Card ─────────────────────────────────────────────────────── */

function DimensionCard({ result, index }: { result: DimensionResult; index: number }) {
  const [open, setOpen] = useState(true);
  const label = DIMENSION_LABELS[result.dimension] ?? result.dimension;
  const worstSev = result.findings.find(f => f.severity === "critical")
    ? "critical"
    : result.findings.find(f => f.severity === "high")
    ? "high"
    : result.findings.find(f => f.severity === "medium")
    ? "medium"
    : "good";
  const accentColor = SEV_CONFIG[worstSev].color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "#13131F",
        border: "1px solid #22213A",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <ScoreRing score={result.score} size={60} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: accentColor,
            marginBottom: 4,
          }}>
            {label}
          </div>
          <p style={{
            margin: 0,
            fontSize: 13,
            color: "#B8B7D0",
            lineHeight: 1.45,
          }}>
            {result.summary}
          </p>
        </div>

        <div style={{
          fontSize: 11,
          color: "#7E7D9A",
          padding: "4px 8px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 6,
          flexShrink: 0,
        }}>
          {open ? "▲" : "▼"}
        </div>
      </button>

      {/* Findings */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              padding: "0 20px 4px",
            }}>
              {result.findings.map((f, i) => (
                <FindingItem key={i} finding={f} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton loader card ───────────────────────────────────────────────── */

function SkeletonCard({ label }: { label: string }) {
  return (
    <div style={{
      background: "#13131F",
      border: "1px solid #22213A",
      borderLeft: "3px solid #22213A",
      borderRadius: 16,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}>
      {/* Spinning ring */}
      <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
        <svg width={60} height={60} viewBox="0 0 60 60">
          <circle cx={30} cy={30} r={25} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        </svg>
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            border: "5px solid transparent",
            borderTopColor: "#FF4D1C",
            borderRadius: "50%",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#7E7D9A",
          marginBottom: 8,
        }}>
          {label}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: "#32305A",
            }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Locked dimension row ───────────────────────────────────────────────── */

function LockedCard({ label }: { label: string }) {
  return (
    <div style={{
      background: "rgba(19,19,31,0.5)",
      border: "1px dashed #22213A",
      borderRadius: 16,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      opacity: 0.6,
    }}>
      <Lock size={16} style={{ color: "#7E7D9A", flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "#7E7D9A", fontWeight: 500 }}>
        {label} — locked
      </span>
    </div>
  );
}

/* ─── Main content ───────────────────────────────────────────────────────── */

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";

  const [status, setStatus] = useState("Capturing screenshot…");
  const [dimensions, setDimensions] = useState<DimensionResult[]>([]);
  const [done, setDone] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tauntIdx, setTauntIdx] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!url || started.current) return;
    started.current = true;

    const form = new FormData();
    form.append("url", url);
    form.append("tier", "free");

    const ctrl = new AbortController();
    fetch("/api/analyze", { method: "POST", body: form, signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const reader = res.body!.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done: rdone, value } = await reader.read();
          if (rdone) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "status") setStatus(event.payload.message);
              else if (event.type === "dimension") setDimensions(p => [...p, event.payload]);
              else if (event.type === "done") { setOverallScore(event.payload.overallScore); setDone(true); }
              else if (event.type === "error") setError(event.payload.message);
            } catch { /* skip */ }
          }
        }
      })
      .catch(e => { if (e.name !== "AbortError") setError(e.message); });

    return () => ctrl.abort();
  }, [url]);

  useEffect(() => {
    if (done || error) return;
    const t = setInterval(() => setTauntIdx(i => (i + 1) % ROAST_TAUNTS.length), 2800);
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

  const scoreVerdict =
    overallScore === null ? null
    : overallScore >= 70 ? { text: "Ok fine, this slaps", color: "#34C759" }
    : overallScore >= 55 ? { text: "Mid. Not terrible, not good.", color: "#F5C842" }
    : overallScore >= 35 ? { text: "Babe wake up, new problems just dropped", color: "#FF9F0A" }
    : { text: "I deployed at 3am and prayed energy", color: "#FF4D1C" };

  return (
    <div style={{
      minHeight: "100vh",
      maxWidth: 680,
      margin: "0 auto",
      padding: "48px 20px 80px",
      color: "#F0EFF8",
    }}>
      {/* Back nav */}
      <Link href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#7E7D9A",
        textDecoration: "none",
        marginBottom: 32,
        transition: "color 0.15s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = "#B8B7D0")}
        onMouseLeave={e => (e.currentTarget.style.color = "#7E7D9A")}
      >
        <ArrowLeft size={14} /> Back to RoastLab
      </Link>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}>
          <Flame size={16} color="#FF4D1C" />
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#F0EFF8" }}>
            Roasting
          </h1>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            color: "#7E7D9A",
            fontFamily: "var(--font-geist-mono, monospace)",
            textDecoration: "none",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {url}
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Overall score card */}
      <AnimatePresence>
        {done && overallScore !== null && scoreVerdict && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "linear-gradient(135deg, #13131F 0%, #1A1428 100%)",
              border: "1px solid #32305A",
              borderRadius: 20,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 32,
              boxShadow: `0 0 48px rgba(255,77,28,0.10)`,
            }}
          >
            <ScoreRing score={overallScore} size={88} />
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#7E7D9A" }}>
                Overall Roast Score
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: scoreVerdict.color, lineHeight: 1.2 }}>
                {scoreVerdict.text}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#7E7D9A" }}>
                Across {dimensions.length} of 9 dimensions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading status */}
      {!done && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={tauntIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "#0F0F1A",
              border: "1px solid #22213A",
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <motion.div
              style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid #22213A",
                borderTopColor: "#FF4D1C",
                flexShrink: 0,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            />
            <span style={{ fontSize: 13, color: "#B8B7D0" }}>
              {dimensions.length === 0 ? status : ROAST_TAUNTS[tauntIdx]}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: "14px 18px",
            background: "rgba(255,77,28,0.08)",
            border: "1px solid rgba(255,77,28,0.3)",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14,
            color: "#FF6B3D",
            lineHeight: 1.5,
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Section label */}
      {(dimensions.length > 0 || (!done && !error)) && (
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#7E7D9A",
          marginBottom: 12,
        }}>
          Free Dimensions (3 of 9)
        </p>
      )}

      {/* Dimension results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dimensions.map((d, i) => (
          <DimensionCard key={d.dimension} result={d} index={i} />
        ))}

        {/* Loading skeletons */}
        {!done && !error &&
          FREE_DIMS.filter(d => !dimensions.find(r => r.dimension === d)).map(d => (
            <SkeletonCard key={d} label={DIMENSION_LABELS[d] ?? d} />
          ))
        }
      </div>

      {/* Locked dimensions */}
      {(done || dimensions.length > 0) && (
        <div style={{ marginTop: 24 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#7E7D9A",
            marginBottom: 12,
          }}>
            Locked (6 of 9)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOCKED_DIMS.map(d => <LockedCard key={d.key} label={d.label} />)}
          </div>
        </div>
      )}

      {/* Upsell */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 32,
            background: "linear-gradient(135deg, #1A0E0A 0%, #1A1428 100%)",
            border: "1px solid rgba(255,77,28,0.25)",
            borderRadius: 20,
            padding: "28px 28px",
            textAlign: "center",
          }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            background: "rgba(255,77,28,0.12)",
            color: "#FF4D1C",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}>
            <Flame size={11} />
            6 more dimensions waiting
          </div>

          <h2 style={{
            margin: "0 0 10px",
            fontSize: 22,
            fontWeight: 800,
            color: "#F0EFF8",
            lineHeight: 1.2,
          }}>
            There&apos;s more pain to uncover
          </h2>
          <p style={{
            margin: "0 0 24px",
            fontSize: 14,
            color: "#B8B7D0",
            lineHeight: 1.6,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            Unlock Accessibility, UX Flow, Trust Signals, Mobile, Performance, and SEO audits. One payment, full roast forever.
          </p>

          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              background: "#FF4D1C",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#FF6B3D";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "#FF4D1C";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <Flame size={16} />
            Unlock Full Roast — ₹2,499
          </button>

          <p style={{ margin: "12px 0 0", fontSize: 12, color: "#7E7D9A" }}>
            One-time payment · No subscription · Results in ~90s
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          style={{ width: 32, height: 32, border: "3px solid #22213A", borderTopColor: "#FF4D1C", borderRadius: "50%" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
