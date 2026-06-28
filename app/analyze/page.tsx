"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, Zap, ArrowLeft, Flame } from "lucide-react";

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

const SEV_COLOR: Record<Severity, string> = {
  critical: "var(--sev-critical)",
  high: "var(--sev-high)",
  medium: "var(--sev-medium)",
  good: "var(--sev-good)",
};

const SEV_ICON: Record<Severity, React.ReactNode> = {
  critical: <AlertTriangle size={13} />,
  high: <Zap size={13} />,
  medium: <Info size={13} />,
  good: <CheckCircle2 size={13} />,
};

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color =
    score >= 70 ? "var(--sev-good)" : score >= 45 ? "var(--sev-medium)" : "var(--sev-critical)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-emph)" strokeWidth={5} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: fill }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.22} fontWeight="700" fill="var(--text-primary)">
        {score}
      </text>
    </svg>
  );
}

function DimensionCard({ result, index }: { result: DimensionResult; index: number }) {
  const [open, setOpen] = useState(true);
  const label = DIMENSION_LABELS[result.dimension] ?? result.dimension;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-emph)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <ScoreRing score={result.score} size={56} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-dim)" }}>
            {label}
          </div>
          <div className="text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>
            {result.summary}
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full border shrink-0" style={{ borderColor: "var(--border-emph)", color: "var(--text-dim)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col gap-2 px-5 pb-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {result.findings.map((f, i) => (
                <div key={i} className="flex gap-3 pt-3">
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                    style={{ background: SEV_COLOR[f.severity] + "22", color: SEV_COLOR[f.severity] }}
                    aria-label={f.severity}
                  >
                    {SEV_ICON[f.severity]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                      {f.title}
                    </div>
                    {f.quote && (
                      <div
                        className="text-xs mt-1 px-2 py-1 rounded italic"
                        style={{
                          background: "var(--bg-1)",
                          color: "var(--text-secondary)",
                          borderLeft: `2px solid ${SEV_COLOR[f.severity]}`,
                        }}
                      >
                        &ldquo;{f.quote}&rdquo;
                      </div>
                    )}
                    <div className="text-xs mt-1.5" style={{ color: "var(--text-dim)" }}>
                      → {f.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border"
      style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
      <div
        className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin shrink-0"
        style={{ borderColor: "var(--border-emph)", borderTopColor: "var(--ember)" }}
        aria-hidden="true"
      />
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>
          {label}
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full" style={{ background: "var(--text-dim)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ROAST_TAUNTS = [
  "Firing up the shame cannon…",
  "Consulting the council of bad design…",
  "Preparing the verdict…",
  "Counting the UX sins…",
  "Your designer will not like this…",
  "This might sting a little…",
];

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
              else if (event.type === "dimension") setDimensions((prev) => [...prev, event.payload]);
              else if (event.type === "done") { setOverallScore(event.payload.overallScore); setDone(true); }
              else if (event.type === "error") setError(event.payload.message);
            } catch { /* skip malformed */ }
          }
        }
      })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); });

    return () => ctrl.abort();
  }, [url]);

  useEffect(() => {
    if (done || error) return;
    const t = setInterval(() => setTauntIdx((i) => (i + 1) % ROAST_TAUNTS.length), 2500);
    return () => clearInterval(t);
  }, [done, error]);

  const FREE_DIMS = ["visual_design", "copywriting", "cta"];

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p style={{ color: "var(--text-secondary)" }}>No URL provided.</p>
          <Link href="/" className="inline-flex items-center gap-2 mt-4 text-sm" style={{ color: "var(--ember)" }}>
            <ArrowLeft size={14} /> Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16 max-w-2xl mx-auto" style={{ color: "var(--text-primary)" }}>
      <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8 opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Flame size={18} style={{ color: "var(--ember)" }} aria-hidden="true" />
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Roasting
          </h1>
        </div>
        <p className="text-sm font-mono truncate max-w-full" style={{ color: "var(--text-dim)" }}>
          {url}
        </p>
      </div>

      {/* Overall score */}
      <AnimatePresence>
        {done && overallScore !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-5 p-5 rounded-2xl border mb-8"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-emph)",
              boxShadow: "0 0 40px rgba(255,77,28,0.08)",
            }}
          >
            <ScoreRing score={overallScore} size={80} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>
                Overall Roast Score
              </div>
              <div className="text-2xl font-extrabold" style={{
                color: overallScore >= 70 ? "var(--sev-good)" : overallScore >= 45 ? "var(--sev-medium)" : "var(--sev-critical)",
              }}>
                {overallScore >= 70
                  ? "Ok fine, this slaps"
                  : overallScore >= 55
                  ? "Mid. Not terrible, not good."
                  : overallScore >= 35
                  ? "Babe wake up, new problems just dropped"
                  : "I deployed at 3am and prayed energy"}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Across {dimensions.length} dimension{dimensions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status / taunt */}
      {!done && !error && (
        <motion.div
          key={tauntIdx}
          className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
            style={{ borderColor: "var(--border-emph)", borderTopColor: "var(--ember)" }}
            aria-hidden="true"
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {dimensions.length === 0 ? status : ROAST_TAUNTS[tauntIdx]}
          </span>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 rounded-xl border mb-6 text-sm"
          style={{ background: "rgba(255,77,28,0.06)", borderColor: "var(--sev-critical)", color: "var(--sev-critical)" }}>
          {error}
        </motion.div>
      )}

      {/* Dimension cards */}
      <div className="flex flex-col gap-4">
        {dimensions.map((d, i) => (
          <DimensionCard key={d.dimension} result={d} index={i} />
        ))}
        {!done && !error &&
          FREE_DIMS.filter((d) => !dimensions.find((r) => r.dimension === d)).map((d) => (
            <LoadingCard key={d} label={DIMENSION_LABELS[d] ?? d} />
          ))}
      </div>

      {/* Upsell */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 p-6 rounded-2xl border text-center"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-emph)" }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--ember)" }}>
            You&apos;ve seen 3 of 9 dimensions
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            There&apos;s more pain to uncover
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Get the full roast — 6 more dimensions including Accessibility, Trust Signals, SEO, and Performance — one-time ₹2,499.
          </p>
          <button
            className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all"
            style={{ background: "var(--ember)", color: "#fff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ember-2)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ember)")}
          >
            <Flame size={15} /> Unlock Full Roast — ₹2,499
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border-emph)", borderTopColor: "var(--ember)" }} />
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  );
}
