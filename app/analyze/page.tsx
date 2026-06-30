"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Lock, ExternalLink, CreditCard, Loader2, Flame, Download } from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";

const ADMIN_EMAILS = ['bonthalamadhavi1@gmail.com', 'ritesh@gratiantechnologies.com'];

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
        <a href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", cursor: "zoom-in" }} title="Click to view full screenshot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt="Site screenshot" onLoad={() => setLoaded(true)}
            style={{ width: "100%", display: "block", filter: "brightness(0.8) saturate(0.75)", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}/>
        </a>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, #080814)", pointerEvents: "none" }}/>
        {loaded && (
          <>
            <motion.div initial={{ opacity: 0, rotate: -25, scale: 2 }} animate={{ opacity: 1, rotate: -8, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              style={{ position: "absolute", top: 10, right: 10, padding: "3px 10px", border: "2px solid #FF2D5588", color: "#FF2D55CC", fontSize: 11, fontWeight: 900, fontFamily: "serif", textTransform: "uppercase", letterSpacing: "0.1em", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", borderRadius: 3, pointerEvents: "none" }}>
              ROASTED
            </motion.div>
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#3A3A5E", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 4, backdropFilter: "blur(4px)", pointerEvents: "none" }}>
              click to view full
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Telugu/Indian meme sticker ─────────────────────────────────────────── */
function enc(s: string) {
  return s.replace(/_/g,"__").replace(/\//g,"~s").replace(/ /g,"_").replace(/\?/g,"~q").replace(/&/g,"~a").replace(/%/g,"~p");
}

/* score >= 65 = hype mode, < 65 = roast mode */
const DIM_MEMES: Record<string, (score: number) => { template: string; top: string; bottom: string }> = {
  visual_design: (s) => s >= 65
    ? { template: "success-kid",   top: enc("visual design game"),              bottom: enc("absolutely ate and left crumbs bhai") }
    : s < 40
    ? { template: "facepalm",      top: enc("tera visual design dekh ke"),      bottom: enc("aankhein dard kar rahi hain bhai") }
    : { template: "this-is-fine",  top: enc(`visual design ${s}/100`),          bottom: enc("not great not terrible") },
  copywriting: (s) => s >= 65
    ? { template: "two-buttons",   top: enc("bad copy"),                        bottom: enc("teri copy actually slaps bhai fire hai") }
    : s < 40
    ? { template: "this-is-fine",  top: enc("teri copy padhne ke baad"),        bottom: enc("kuch samaj nahi aaya yaar") }
    : { template: "drake",         top: enc("boring generic copy"),             bottom: enc("teri copywriting mid hai but okay-ish") },
  cta: (s) => s >= 65
    ? { template: "success-kid",   top: enc("CTA button finally"),              bottom: enc("people are actually clicking it bhai") }
    : s < 40
    ? { template: "disaster-girl", top: enc("tera CTA button dekh ke"),         bottom: enc("click karne ka mann hi nahi kiya") }
    : { template: "facepalm",      top: enc("CTA thoda better"),                bottom: enc("par still confusing hai bhai") },
  ux_flow: (s) => s >= 65
    ? { template: "success-kid",   top: enc("tera UX flow dekh ke"),            bottom: enc("user ek baar mein samjha fire") }
    : s < 40
    ? { template: "always-has-been", top: enc("tera UX flow"),                  bottom: enc("always been a maze bhai") }
    : { template: "hide-the-pain",  top: enc(`UX flow ${s}/100`),               bottom: enc("user toh confuse hai par okay") },
  accessibility: (s) => s >= 65
    ? { template: "success-kid",   top: enc("accessibility score"),             bottom: enc("screen reader khush hai bhai") }
    : s < 40
    ? { template: "facepalm",      top: enc("screen reader ne try kiya"),       bottom: enc("give up kar diya bhai") }
    : { template: "drake",         top: enc("inaccessible websites"),           bottom: enc("tera accessibility game decent") },
  trust_signals: (s) => s >= 65
    ? { template: "success-kid",   top: enc("trust signals"),                   bottom: enc("visitors trust kar rahe hain bhai legend") }
    : s < 40
    ? { template: "this-is-fine",  top: enc("visitor trust karne ki koshish"),  bottom: enc("RUN likhke chala gaya") }
    : { template: "hide-the-pain", top: enc(`trust signals ${s}/100`),          bottom: enc("thoda trust toh aaya") },
  mobile_experience: (s) => s >= 65
    ? { template: "success-kid",   top: enc("mobile pe khola tera site"),       bottom: enc("no zoom needed smooth hai bhai") }
    : s < 40
    ? { template: "disaster-girl", top: enc("mobile pe khola tera site"),       bottom: enc("zoom out karna pad gaya 5 baar") }
    : { template: "facepalm",      top: enc("mobile UX"),                       bottom: enc("better than expected par still") },
  performance: (s) => s >= 65
    ? { template: "success-kid",   top: enc("performance score"),               bottom: enc("site load speed bilkul fast bhai") }
    : s < 40
    ? { template: "always-has-been", top: enc("loading loader loading"),        bottom: enc("tera site always slow raha") }
    : { template: "drake",           top: enc("slow websites"),                 bottom: enc("tera performance score okay-ish") },
  seo: (s) => s >= 65
    ? { template: "success-kid",   top: enc("google ne tera site dekha"),       bottom: enc("first page pe aa gaya bhai legend") }
    : s < 40
    ? { template: "this-is-fine",  top: enc("google ne tera site dekha"),       bottom: enc("skip maar ke nikal gaya") }
    : { template: "hide-the-pain", top: enc(`SEO score ${s}/100`),              bottom: enc("google notice karega... shayad") },
};

function MemeSticker({ score, dimension }: { score: number; dimension?: string }) {
  let template: string, top: string, bottom: string;
  const hype = score >= 65;

  if (dimension && DIM_MEMES[dimension]) {
    const m = DIM_MEMES[dimension](score);
    template = m.template; top = m.top; bottom = m.bottom;
  } else if (score >= 85) {
    template = "success-kid";  top = enc("site score 85 plus");       bottom = enc("bhai actually sent it and it slapped");
  } else if (score >= 65) {
    template = "success-kid";  top = enc(`score ${score}/100 fire`);  bottom = enc("ab toh proud feel ho raha hai");
  } else if (score >= 50) {
    template = "disaster-girl";top = enc("tera website dekh ke");     bottom = enc("machi ee design chusav aa");
  } else if (score >= 30) {
    template = "this-is-fine"; top = enc(`website score ${score}`);   bottom = enc("yaar ye kya kar diya tune");
  } else {
    template = "facepalm";     top = enc("arey baap re");             bottom = enc("ee site ki design chesindi eppudu");
  }

  const memeUrl = `https://api.memegen.link/images/${template}/${top}/${bottom}.png`;
  const badgeColor = hype ? "#32D74B" : "#E8334A";
  const tiltDeg = hype ? 2 : -2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: hype ? 3 : -3 }}
      animate={{ opacity: 1, scale: 1, rotate: tiltDeg }}
      transition={{ delay: 0.4, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        {hype && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", background: "#32D74B", color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.1em", zIndex: 1 }}>
            🔥 FIRE SCORE
          </motion.div>
        )}
        <div style={{ padding: 6, background: "#fff", borderRadius: 12, boxShadow: hype ? "0 8px 32px rgba(50,215,75,0.4), 0 2px 8px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)", transform: `rotate(${tiltDeg}deg)`, display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={memeUrl} alt="meme" style={{ width: 260, height: "auto", borderRadius: 8, display: "block", minHeight: 160 }} loading="lazy"/>
        </div>
        <div style={{ position: "absolute", top: -10, right: -10, width: 36, height: 36, borderRadius: "50%", background: badgeColor, border: "3px solid #09090B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", boxShadow: `0 2px 8px ${badgeColor}80` }}>
          {score}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── BIG verdict hero — DAMAGE REPORT ──────────────────────────────────── */
function VerdictHero({ score, dims }: { score: number; dims: DimensionResult[] }) {
  const m = scoreMeta(score);
  const MONO = "'Courier New', 'Lucida Console', monospace";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: 32, position: "relative",
        border: `2px solid ${m.color}`,
        boxShadow: `8px 8px 0 ${m.color}`,
        background: "#0A0A0A",
        overflow: "hidden",
      }}
    >
      {/* Top label bar */}
      <div style={{ background: m.color, padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", color: "#000" }}>▶ DAMAGE REPORT</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#00000088", letterSpacing: "0.1em" }}>ROASTLAB.AI</span>
      </div>

      <div style={{ padding: "24px 24px 20px", position: "relative" }}>
        {/* Ghost grade watermark */}
        <div style={{ position: "absolute", right: 12, top: 8, fontSize: 140, fontWeight: 900, color: `${m.color}10`, lineHeight: 1, pointerEvents: "none", userSelect: "none", fontFamily: "system-ui,sans-serif", transform: "rotate(12deg)" }}>
          {m.grade}
        </div>

        {/* Score + /100 */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
          <motion.span
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1], delay: 0.1 }}
            style={{ fontSize: 108, fontWeight: 900, lineHeight: 0.85, color: m.color, letterSpacing: "-0.05em", fontFamily: "system-ui,sans-serif" }}
          >
            {score}
          </motion.span>
          <div style={{ paddingBottom: 10, fontFamily: MONO }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#333" }}>/100</div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>roast score</div>
          </div>
        </div>

        {/* Red divider */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.4 }} style={{ height: 2, background: m.color, marginBottom: 14, transformOrigin: "left" }} />

        {/* Verdict + vibe */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 900, color: "#F0F0F0", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          {m.verdict}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ margin: "0 0 20px", fontSize: 11, color: "#444", fontFamily: MONO }}>
          $ {m.vibe}
        </motion.p>

        {/* Dimension progress bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {dims.map((d, i) => {
            const meta = DIM[d.dimension];
            const c = d.score >= 65 ? "#32D74B" : d.score >= 40 ? "#FFD60A" : "#FF2D55";
            return (
              <motion.div key={d.dimension}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.04 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ width: 86, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#333", fontFamily: MONO, flexShrink: 0 }}>
                  {meta?.label?.slice(0, 12)}
                </span>
                <div style={{ flex: 1, height: 3, background: "#1A1A1A", position: "relative", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${d.score}%` }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.04, ease: [0.16,1,0.3,1] }}
                    style={{ height: "100%", background: c, position: "absolute", top: 0, left: 0 }}
                  />
                </div>
                <span style={{ width: 24, fontSize: 10, fontWeight: 900, color: c, textAlign: "right", fontFamily: MONO }}>
                  {d.score}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Single finding — evidence entry ───────────────────────────────────── */
function Finding({ f, i }: { f: Finding; i: number }) {
  const s = SEV[f.severity];
  const MONO = "'Courier New', 'Lucida Console', monospace";
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, delay: i * 0.05 }}
      style={{ marginBottom: 14, borderLeft: `3px solid ${s.color}`, paddingLeft: 14 }}
    >
      {/* Severity tag + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 7px", border: `1px solid ${s.color}`, color: s.color, fontFamily: MONO }}>
          {f.severity.toUpperCase()}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#E0E0E0", lineHeight: 1.3 }}>{f.title}</span>
      </div>
      {/* Quote */}
      {f.quote && (
        <div style={{ margin: "0 0 6px", padding: "6px 10px", background: "#0A0A0A", borderLeft: `2px solid ${s.color}44`, fontSize: 11, fontStyle: "italic", color: "#555", lineHeight: 1.5, fontFamily: MONO }}>
          "{f.quote}"
        </div>
      )}
      {/* Fix */}
      <p style={{ margin: 0, fontSize: 11, color: "#555", lineHeight: 1.5, fontFamily: MONO }}>
        <span style={{ color: s.color, fontWeight: 900 }}>FIX → </span>{f.action}
      </p>
    </motion.div>
  );
}

/* ─── Theme 0: Crime Scene ───────────────────────────────────────────────── */
function CrimeSceneCard({ result, idx, isWorst }: { result: DimensionResult; idx: number; isWorst?: boolean }) {
  const [open, setOpen] = useState(true);
  const meta = DIM[result.dimension] ?? { label: result.dimension, emoji: "🔥", color: "#FF2D55" };
  const TAPE = "#FFE600"; const MONO = "'Courier New','Lucida Console',monospace";
  const verdict = result.score < 40 ? "GUILTY" : result.score < 65 ? "PROBATION" : "ACQUITTED";
  return (
    <motion.div initial={{ opacity: 0, rotate: -0.5 }} animate={{ opacity: 1, rotate: isWorst ? 0.5 : -0.3 }}
      transition={{ duration: 0.5, delay: idx * 0.1 }} style={{ marginBottom: 24, position: "relative" }}>
      <div style={{ height: 22, background: `repeating-linear-gradient(45deg,${TAPE},${TAPE} 12px,#000 12px,#000 24px)`, borderBottom: "2px solid #000" }} />
      <div style={{ background: "#080808", border: `2px solid ${isWorst ? TAPE : "#2A2A00"}`, boxShadow: isWorst ? `0 0 28px rgba(255,230,0,0.18)` : "none", position: "relative", overflow: "hidden" }}>
        {/* Evidence number circle */}
        <div style={{ position: "absolute", right: 14, top: 14, width: 38, height: 38, borderRadius: "50%", border: `2px solid ${TAPE}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 13, fontWeight: 900, color: TAPE }}>
          {String(idx + 1).padStart(2, "0")}
        </div>
        {/* Header */}
        <div style={{ padding: "14px 60px 10px 16px" }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: TAPE, letterSpacing: "0.2em", marginBottom: 3 }}>EXHIBIT {String(idx + 1).padStart(2, "0")} — CASE FILE</div>
          <div style={{ fontSize: 17, fontWeight: 900, textTransform: "uppercase", color: "#EEE", letterSpacing: "-0.01em" }}>{meta.label}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#555", marginTop: 3 }}>
            SENTENCE: {result.score}/100 — <span style={{ color: result.score < 40 ? "#FF2D55" : result.score < 65 ? "#FF9F0A" : "#32D74B" }}>{verdict}</span>
            {isWorst && <span style={{ marginLeft: 8, color: TAPE, border: `1px solid ${TAPE}44`, padding: "0 5px" }}>WORST OFFENDER</span>}
          </div>
        </div>
        {/* Witness statement */}
        <div style={{ margin: "0 16px 12px", padding: "9px 12px", background: "#0D0D00", borderLeft: `3px solid ${TAPE}` }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: TAPE, marginBottom: 5, letterSpacing: "0.15em" }}>WITNESS STATEMENT:</div>
          <p style={{ margin: 0, fontSize: 12, color: "#AAA", fontStyle: "italic", lineHeight: 1.65 }}>"{result.summary}"</p>
        </div>
        {/* Findings */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
              <div style={{ padding: "0 16px 14px" }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: "#2A2A00", letterSpacing: "0.12em", marginBottom: 8 }}>EVIDENCE LOG ({result.findings.length} counts):</div>
                {result.findings.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ marginBottom: 10, padding: "7px 10px", background: "#0A0A00", borderLeft: `3px solid ${f.severity === "critical" ? TAPE : f.severity === "high" ? "#FF4400" : "#333"}` }}>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: "#333", marginBottom: 3 }}>EVIDENCE {String(i + 1).padStart(2, "0")} [{f.severity.toUpperCase()}]</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#DDD", marginBottom: 3 }}>{f.title}</div>
                    {f.quote && <div style={{ fontSize: 10, fontStyle: "italic", color: "#444", marginBottom: 3 }}>"{f.quote}"</div>}
                    <div style={{ fontFamily: MONO, fontSize: 10, color: "#555" }}><span style={{ color: TAPE }}>REMEDY → </span>{f.action}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", background: "#0A0A00", border: "none", borderTop: "1px solid #1A1A00", padding: "6px", fontFamily: MONO, fontSize: 8, color: "#333", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {open ? "▲ seal case file" : "▼ open case file"}
        </button>
      </div>
      <div style={{ height: 22, background: `repeating-linear-gradient(45deg,${TAPE},${TAPE} 12px,#000 12px,#000 24px)`, borderTop: "2px solid #000" }} />
    </motion.div>
  );
}

/* ─── Theme 1: Hacker Terminal ───────────────────────────────────────────── */
function HackerCard({ result, idx, isWorst }: { result: DimensionResult; idx: number; isWorst?: boolean }) {
  const [open, setOpen] = useState(true);
  const meta = DIM[result.dimension] ?? { label: result.dimension, emoji: "🔥", color: "#FF2D55" };
  const GREEN = "#00FF41"; const DIM_KEY = meta.label.toUpperCase().replace(/\s/g, "_");
  const breach = result.score < 40; const warn = result.score < 65;
  const statusColor = breach ? "#FF0000" : warn ? "#FFD60A" : GREEN;
  const MONO = "'Courier New','Lucida Console',monospace";
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.08 }} style={{ marginBottom: 24 }}>
      <div style={{
        background: "#000000",
        backgroundImage: `repeating-linear-gradient(45deg,rgba(0,255,65,0.025) 0,rgba(0,255,65,0.025) 1px,transparent 1px,transparent 14px),repeating-linear-gradient(-45deg,rgba(0,255,65,0.025) 0,rgba(0,255,65,0.025) 1px,transparent 1px,transparent 14px)`,
        backgroundSize: "28px 28px",
        border: `1px solid ${isWorst ? GREEN : "#052010"}`,
        boxShadow: isWorst ? `0 0 24px rgba(0,255,65,0.12),inset 0 0 40px rgba(0,255,65,0.02)` : "none",
        fontFamily: MONO,
      }}>
        {/* Prompt header */}
        <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid #052010" }}>
          <div style={{ fontSize: 9, color: "#023010", marginBottom: 4 }}>root@roastlab:~$ ./scan --dim={DIM_KEY} --mode=deep</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, color: "#005A20", marginBottom: 4 }}>&gt; <span style={{ color: statusColor }}>SCANNING {DIM_KEY}...</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 110, height: 7, background: "#001A05", border: `1px solid ${GREEN}22`, position: "relative", overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }}
                    transition={{ duration: 0.9, delay: idx * 0.08 + 0.2 }}
                    style={{ height: "100%", background: statusColor }} />
                </div>
                <span style={{ fontSize: 10, color: statusColor }}>{result.score}%</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, color: "#005A20" }}>EXIT_CODE:</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: statusColor, lineHeight: 1 }}>{result.score}</div>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: statusColor }}>
            {breach ? "⚠ BREACH DETECTED — CRITICAL VULNERABILITIES" : warn ? "! WARNING — SECURITY ADVISORIES FOUND" : "✓ SCAN COMPLETE — MINOR ISSUES ONLY"}
            {isWorst && <span style={{ marginLeft: 8, border: `1px solid ${GREEN}44`, padding: "0 5px", color: GREEN }}>WORST</span>}
          </div>
        </div>
        {/* Analysis output */}
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #052010" }}>
          <div style={{ fontSize: 8, color: "#023010", marginBottom: 3 }}>{"// ANALYSIS OUTPUT:"}</div>
          <p style={{ margin: 0, fontSize: 12, color: "#00CC33", lineHeight: 1.65, opacity: 0.9 }}>{result.summary}</p>
        </div>
        {/* Vulnerability log */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
              <div style={{ padding: "8px 16px 12px" }}>
                <div style={{ fontSize: 8, color: "#023010", marginBottom: 6 }}>{"/* VULNERABILITY LOG */"}</div>
                {result.findings.map((f, i) => {
                  const fc = f.severity === "critical" ? "#FF0000" : f.severity === "high" ? "#FF6600" : f.severity === "medium" ? "#FFD60A" : GREEN;
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      style={{ marginBottom: 9, paddingLeft: 10, borderLeft: `2px solid ${fc}` }}>
                      <div style={{ fontSize: 8, color: "#004A15", marginBottom: 2 }}>[{String(i + 1).padStart(2, "0")}] {f.severity.toUpperCase()} :: {f.title}</div>
                      {f.quote && <div style={{ fontSize: 9, color: "#003010", fontStyle: "italic", marginBottom: 2 }}>// "{f.quote}"</div>}
                      <div style={{ fontSize: 9, color: "#00AA28" }}><span style={{ color: GREEN }}>PATCH: </span>{f.action}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", background: "#000800", border: "none", borderTop: "1px solid #052010", padding: "5px", fontSize: 8, color: "#023010", cursor: "pointer", letterSpacing: "0.1em", fontFamily: MONO }}>
          {open ? "$ --collapse" : "$ --expand"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Theme 2: Breaking News ─────────────────────────────────────────────── */
function BreakingNewsCard({ result, idx, isWorst }: { result: DimensionResult; idx: number; isWorst?: boolean }) {
  const [open, setOpen] = useState(true);
  const meta = DIM[result.dimension] ?? { label: result.dimension, emoji: "🔥", color: "#FF2D55" };
  const sm = scoreMeta(result.score);
  const RED = "#8B0000"; const INK = "#1A0A04"; const CREAM = "#F0E8D8";
  const headline = `${meta.label.toUpperCase()} IN CRISIS: SCORE ${result.score}/100`;
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: idx * 0.1 }} style={{ marginBottom: 24 }}>
      <div style={{ background: CREAM, border: `2px solid ${INK}`, boxShadow: isWorst ? `6px 6px 0 ${RED}` : `4px 4px 0 #3A2010`, overflow: "hidden" }}>
        {/* Ticker tape */}
        <div style={{ background: RED, height: 26, overflow: "hidden", display: "flex", alignItems: "center" }}>
          <motion.div animate={{ x: [0, -800] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ whiteSpace: "nowrap", fontSize: 9, fontWeight: 900, color: "#FFE600", letterSpacing: "0.12em", fontFamily: "'Courier New',monospace", paddingLeft: "100%" }}>
            ⚡ BREAKING ⚡ ROASTLAB EXCLUSIVE ⚡ WEBSITE AUDIT ⚡ {meta.label.toUpperCase()} UNDER SCRUTINY ⚡ FULL REPORT BELOW ⚡ BREAKING ⚡ ROASTLAB EXCLUSIVE ⚡ WEBSITE AUDIT ⚡
          </motion.div>
        </div>
        {/* Masthead */}
        <div style={{ textAlign: "center", padding: "8px 16px 6px", borderBottom: `3px double ${INK}` }}>
          <div style={{ fontSize: 7, letterSpacing: "0.3em", color: "#6A4020", marginBottom: 4 }}>THE ROASTLAB EXAMINER — {new Date().getFullYear()} — SPECIAL EDITION</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: INK }} />
            <span style={{ background: RED, color: "#FFE600", padding: "2px 8px", fontSize: 8, fontWeight: 900, letterSpacing: "0.1em" }}>
              {isWorst ? "🔴 URGENT" : "⚡ BREAKING"}
            </span>
            <div style={{ flex: 1, height: 1, background: INK }} />
          </div>
        </div>
        {/* Headline + score floated right */}
        <div style={{ padding: "10px 16px 8px" }}>
          <div style={{ float: "right", marginLeft: 12, marginBottom: 6, padding: "6px 10px", background: result.score < 40 ? RED : result.score < 65 ? "#7A5500" : "#1A5A1A", textAlign: "center", minWidth: 54 }}>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: "#FFE600" }}>{result.score}</div>
            <div style={{ fontSize: 7, color: "#FFE60088", letterSpacing: "0.08em" }}>OUT OF 100</div>
          </div>
          <h2 style={{ margin: "0 0 3px", fontSize: isWorst ? 19 : 16, fontWeight: 900, color: INK, lineHeight: 1.2, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{headline}</h2>
          <div style={{ fontSize: 8, color: "#6A4020", fontStyle: "italic", marginBottom: 6 }}>By RoastLab Correspondent · Score: {result.score}/100 · Published now</div>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: INK, lineHeight: 1.65, fontStyle: "italic", borderLeft: `3px solid ${RED}`, paddingLeft: 9 }}>"{result.summary}"</p>
          <div style={{ clear: "both" }} />
        </div>
        {/* Article body — findings */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
              <div style={{ padding: "0 16px 12px", borderTop: `1px solid #C0A080` }}>
                <div style={{ fontSize: 8, letterSpacing: "0.15em", color: "#6A4020", margin: "8px 0 6px", textAlign: "center" }}>— FULL INVESTIGATIVE REPORT —</div>
                {result.findings.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ marginBottom: 8, borderBottom: "1px dotted #C0A080", paddingBottom: 7 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "flex-start", marginBottom: 3 }}>
                      <span style={{ fontSize: 7, fontWeight: 900, background: RED, color: "#FFE600", padding: "1px 4px", flexShrink: 0, marginTop: 2 }}>{f.severity.toUpperCase()}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{f.title}</span>
                    </div>
                    {f.quote && <p style={{ margin: "0 0 3px", fontSize: 10, fontStyle: "italic", color: "#6A4020", paddingLeft: 6 }}>"{f.quote}"</p>}
                    <p style={{ margin: 0, fontSize: 10, color: "#4A2010" }}><span style={{ fontWeight: 900, color: RED }}>EDITOR'S NOTE: </span>{f.action}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", background: "#E8DCC8", border: "none", borderTop: `2px solid ${INK}`, padding: "6px", fontSize: 8, color: "#6A4020", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Georgia,serif" }}>
          {open ? "▲ fold paper" : "▼ read full story"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Theme 3: Medical Diagnosis (glassmorphism) ─────────────────────────── */
function MedicalCard({ result, idx, isWorst }: { result: DimensionResult; idx: number; isWorst?: boolean }) {
  const [open, setOpen] = useState(true);
  const meta = DIM[result.dimension] ?? { label: result.dimension, emoji: "🔥", color: "#FF2D55" };
  const TEAL = "#00B5A5"; const critical = result.score < 40; const guarded = result.score < 65;
  const statusColor = critical ? "#FF3B30" : guarded ? "#FF9F0A" : TEAL;
  const statusLabel = critical ? "🔴 CRITICAL" : guarded ? "🟡 GUARDED" : "🟢 STABLE";
  const MONO = "'Courier New','Lucida Console',monospace";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16,1,0.3,1] }} style={{ marginBottom: 24 }}>
      <div style={{
        background: "rgba(0,181,165,0.05)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${critical ? "#FF3B3033" : isWorst ? `${TEAL}66` : `${TEAL}22`}`,
        boxShadow: `0 8px 32px rgba(0,181,165,0.07),inset 0 1px 0 rgba(255,255,255,0.05)`,
        borderRadius: 4,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: critical ? "rgba(255,59,48,0.1)" : "rgba(0,181,165,0.08)", borderBottom: `1px solid ${statusColor}22`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.15em", color: TEAL, marginBottom: 2, fontFamily: MONO }}>PATIENT CHART — DEPT. OF ROASTOLOGY</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#D0EDED", letterSpacing: "0.02em", textTransform: "uppercase" }}>
              {meta.label}
              {isWorst && <span style={{ marginLeft: 8, fontSize: 8, color: statusColor, border: `1px solid ${statusColor}44`, padding: "0 5px", fontFamily: MONO }}>WORST</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: statusColor, fontFamily: MONO, marginBottom: 1 }}>{statusLabel}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: statusColor, lineHeight: 1, fontFamily: MONO }}>{result.score}</div>
          </div>
        </div>
        {/* ECG line animation */}
        <div style={{ padding: "6px 16px", borderBottom: `1px solid rgba(0,181,165,0.08)` }}>
          <svg width="100%" height="28" viewBox="0 0 300 28" preserveAspectRatio="none" style={{ display: "block" }}>
            <motion.polyline
              points="0,14 20,14 25,4 30,24 35,14 60,14 65,2 70,26 75,14 100,14 105,7 110,21 115,14 140,14 145,2 150,26 155,14 180,14 185,9 190,19 195,14 220,14 225,4 230,24 235,14 260,14 265,2 270,26 275,14 300,14"
              fill="none" stroke={statusColor} strokeWidth="1.5" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: idx * 0.1, ease: "easeInOut" }}
            />
          </svg>
        </div>
        {/* Clinical notes */}
        <div style={{ padding: "10px 16px", borderBottom: `1px solid rgba(0,181,165,0.08)` }}>
          <div style={{ fontSize: 8, color: TEAL, letterSpacing: "0.12em", marginBottom: 5, fontFamily: MONO }}>CLINICAL NOTES:</div>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#B0E4E0", lineHeight: 1.65, borderLeft: `2px solid ${statusColor}`, paddingLeft: 9 }}>{result.summary}</p>
          <div style={{ padding: "5px 8px", background: `rgba(0,181,165,0.04)`, border: `1px solid ${statusColor}22`, borderRadius: 2 }}>
            <div style={{ fontSize: 9, color: statusColor, fontFamily: MONO }}>
              PROGNOSIS: {critical ? "CRITICAL — IMMEDIATE INTERVENTION REQUIRED" : guarded ? "GUARDED — TREATMENT PLAN RECOMMENDED" : "STABLE — ROUTINE MAINTENANCE ADVISED"}
            </div>
          </div>
        </div>
        {/* Rx findings */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
              <div style={{ padding: "10px 16px 12px" }}>
                <div style={{ fontSize: 8, color: TEAL, letterSpacing: "0.12em", marginBottom: 8, fontFamily: MONO }}>Rx — TREATMENT ORDERS ({result.findings.length}):</div>
                {result.findings.map((f, i) => {
                  const fc = f.severity === "critical" ? "#FF3B30" : f.severity === "high" ? "#FF9F0A" : f.severity === "medium" ? "#FFD60A" : TEAL;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ marginBottom: 9, padding: "7px 9px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,181,165,0.1)", borderRadius: 2 }}>
                      <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 7, color: fc, fontFamily: MONO, letterSpacing: "0.08em" }}>[{f.severity.toUpperCase()}]</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#C0EDED" }}>{f.title}</span>
                      </div>
                      {f.quote && <div style={{ fontSize: 10, color: "#4A8A87", fontStyle: "italic", marginBottom: 3 }}>"{f.quote}"</div>}
                      <div style={{ fontSize: 9, color: "#6A9E9C", fontFamily: MONO }}><span style={{ color: TEAL }}>Rx → </span>{f.action}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setOpen(v => !v)} style={{ width: "100%", background: "transparent", border: "none", borderTop: "1px solid rgba(0,181,165,0.08)", padding: "6px", fontSize: 8, color: "rgba(0,181,165,0.35)", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: MONO }}>
          {open ? "▲ close chart" : "▼ open chart"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Roast Card dispatcher — cycles 4 themes by idx ────────────────────── */
function RoastCard({ result, idx, isWorst }: { result: DimensionResult; idx: number; isWorst?: boolean }) {
  const theme = idx % 4;
  const props = { result, idx, isWorst };
  if (theme === 0) return <CrimeSceneCard {...props} />;
  if (theme === 1) return <HackerCard {...props} />;
  if (theme === 2) return <BreakingNewsCard {...props} />;
  return <MedicalCard {...props} />;
}

/* ─── Skeleton — industrial terminal ─────────────────────────────────────── */
function Skeleton({ dimKey }: { dimKey: string }) {
  const meta = DIM[dimKey] ?? { label: dimKey, emoji: "🔥", color: "#FF2D55" };
  const MONO = "'Courier New', 'Lucida Console', monospace";
  return (
    <div style={{ marginBottom: 20, border: "2px solid #1A1A1A", boxShadow: "4px 4px 0 #111", background: "#0A0A0A", overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#222", letterSpacing: "0.05em" }}>[--]</span>
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#2A2A2A" }}>{meta.label}</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 900, color: "#1A1A1A" }}>??</span>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ height: 2, background: "#111", marginBottom: 10, overflow: "hidden" }}>
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "100%", width: "40%", background: `linear-gradient(90deg, transparent, ${meta.color}66, transparent)` }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, color: "#2A2A2A" }}>
          <span>$ ANALYZING {meta.label.toUpperCase().replace(" ", "_")}...</span>
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>█</motion.span>
        </div>
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

/* ─── Auth gate ─────────────────────────────────────────────────────────── */
function AuthGate({ onSignIn }: { onSignIn: () => void }) {
  const { openSignIn } = useClerk();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        style={{ maxWidth: 400, width: "100%", borderRadius: 20, background: "#111117", border: "1px solid rgba(232,51,74,0.25)", padding: "36px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        <motion.div
          animate={{ x: ['-100%','100%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #E8334A, transparent)', pointerEvents: 'none' }}
        />
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: "#FAFAFA", letterSpacing: "-0.02em" }}>
          Free audit used
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#8B8BA3", lineHeight: 1.6 }}>
          {"You've used your 1 free audit. Sign in to get 2 more free audits and keep roasting."}
        </p>
        <button
          onClick={() => { openSignIn(); onSignIn(); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", borderRadius: 12, border: "none",
            background: "#E8334A", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", letterSpacing: "-0.01em", width: "100%", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(232,51,74,0.3)",
          }}
        >
          Sign in to continue
        </button>
        <Link href="/" style={{ display: "block", marginTop: 16, fontSize: 12, color: "#4A4A62", textDecoration: "none" }}>
          ← back to home
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
function AnalyzeContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const tier = (searchParams.get("tier") ?? "free") as "free" | "full";
  const paid = searchParams.get("paid") === "1";
  const upload = searchParams.get("upload") === "1";
  const cachedId = searchParams.get("id") ?? "";

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.emailAddresses.some(e => ADMIN_EMAILS.includes(e.emailAddress)) ?? false;
  const effectiveTier = isAdmin ? 'full' : (cachedTier ?? tier);

  const [status, setStatus]   = useState("warming up the roast machine…");
  const [dims, setDims]       = useState<DimensionResult[]>([]);
  const [done, setDone]       = useState(false);
  const [score, setScore]     = useState<number | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [shots, setShots]     = useState<string[]>([]);
  const [cachedUrl, setCachedUrl] = useState("");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [taunt, setTaunt]     = useState(0);
  const [gated, setGated]     = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cachedTier, setCachedTier] = useState<"free" | "full" | null>(null);
  const started = useRef(false);

  // Load cached audit from DB when ?id= is present
  useEffect(() => {
    if (!cachedId || started.current) return;
    started.current = true;
    fetch(`/api/audit/${cachedId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { url: string; score: number; tier: string; dimensions: DimensionResult[] } | null) => {
        if (!data) { setError("Audit not found."); return; }
        setCachedUrl(data.url);
        setCachedTier((data.tier === 'full' ? 'full' : 'free') as "free" | "full");
        setDims(data.dimensions as DimensionResult[]);
        setScore(data.score);
        setDone(true);
      })
      .catch(() => setError("Failed to load cached audit."));
  }, [cachedId]);

  useEffect(() => {
    if (!isLoaded) return;
    if (started.current) return;
    if (!upload && !url) return;
    if (cachedId) return; // handled by cachedId useEffect

    // Session gate: 1 free audit per session without sign-in
    if (!isSignedIn && !paid) {
      const count = parseInt(localStorage.getItem("roastlab_audit_count") ?? "0");
      if (count >= 1) {
        setGated(true);
        return;
      }
    }

    started.current = true;

    const form = new FormData();
    form.append("tier", tier);
    if (paid) form.append("paid", "1");

    if (upload) {
      try {
        const raw = sessionStorage.getItem("roastlab_upload");
        if (!raw) { setError("No screenshot found. Please upload again."); return; }
        const { base64, mimeType, name } = JSON.parse(raw) as { base64: string; mimeType: string; name: string };
        sessionStorage.removeItem("roastlab_upload");
        form.append("imageBase64", base64);
        form.append("imageMimeType", mimeType);
        setUploadName(name);
      } catch {
        setError("Failed to read uploaded screenshot.");
        return;
      }
    } else {
      form.append("url", url);
    }
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
              if (ev.type === "status")      setStatus(ev.payload.message);
              if (ev.type === "screenshot")  setShots(prev => prev.includes(ev.payload.url) ? prev : [...prev, ev.payload.url]);
              if (ev.type === "screenshots") setShots(ev.payload.urls ?? []);
              if (ev.type === "dimension")  setDims(prev => [...prev, ev.payload]);
              if (ev.type === "done") {
                setScore(ev.payload.overallScore);
                setDone(true);
                // Increment session audit count
                const prev = parseInt(localStorage.getItem("roastlab_audit_count") ?? "0");
                localStorage.setItem("roastlab_audit_count", String(prev + 1));
              }
              if (ev.type === "error")      setError(ev.payload.message);
            } catch {/**/ }
          }
        }
      })
      .catch(e => { if (e.name !== "AbortError") setError(e.message); });
    return () => ctrl.abort();
  }, [url, tier, paid, upload, isLoaded, isSignedIn]);

  useEffect(() => {
    if (done || error) return;
    const t = setInterval(() => setTaunt(i => (i + 1) % TAUNTS.length), 2600);
    return () => clearInterval(t);
  }, [done, error]);

  function handleDownloadPDF() {
    if (!score) return;
    setPdfLoading(true);
    import("@/lib/generate-pdf").then(({ generateRoastPDF }) => {
      generateRoastPDF({ url: upload ? (uploadName ?? "screenshot") : (cachedUrl || url), score, dims });
      setPdfLoading(false);
    }).catch(() => setPdfLoading(false));
  }

  if (gated) return <AuthGate onSignIn={() => { setGated(false); }} />;

  if (!url && !upload && !cachedId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#5A5A80", marginBottom: 12, fontSize: 14 }}>No URL or screenshot provided.</p>
        <Link href="/" style={{ color: "#FF2D55", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14}/> back</Link>
      </div>
    </div>
  );

  const pendingDims = effectiveTier === "full"
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
            {effectiveTier === "full" ? "full roast" : "free roast"}
          </span>
          <span style={{ fontSize: 10, color: "#2E2E4E" }}>· {dims.length}/{effectiveTier === "full" ? 9 : 3}</span>
        </div>
      </div>

      {/* URL or upload name — mono terminal style */}
      {(() => {
        const MONO = "'Courier New','Lucida Console',monospace";
        return upload ? (
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#555", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#E8334A" }}>$</span> analyzing uploaded screenshot
          </div>
        ) : (
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#555", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
            <span style={{ color: "#E8334A", flexShrink: 0 }}>$</span>
            <a href={cachedUrl || url} target="_blank" rel="noopener noreferrer"
              style={{ color: "#444", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#E8334A")}
              onMouseLeave={e => (e.currentTarget.style.color = "#444")}
            >
              {cachedUrl || url}
            </a>
            <ExternalLink size={9} style={{ color: "#333", flexShrink: 0 }}/>
          </div>
        );
      })()}

      {/* Screenshots filmstrip */}
      {shots.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ marginBottom: 24 }}
        >
          {shots.length === 1 ? (
            /* Single screenshot — standard browser frame */
            <SiteFrame imgUrl={shots[0]} siteUrl={url} />
          ) : (
            /* Multi-screenshot filmstrip */
            <div style={{ border: "2px solid #1A1A1A", boxShadow: "4px 4px 0 #111", overflow: "hidden" }}>
              {/* Fake address bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#111", borderBottom: "1px solid #1A1A1A" }}>
                {["#FF5F57","#FFBD2E","#27C93F"].map((c,i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }}/>)}
                <div style={{ flex: 1, marginLeft: 4, background: "#0A0A0A", padding: "2px 8px", fontSize: 9, color: "#333", fontFamily: "'Courier New',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {url || "uploaded"}
                </div>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 8, color: "#2A2A2A", letterSpacing: "0.05em" }}>{shots.length} CAPTURES</span>
              </div>
              {/* Horizontal filmstrip */}
              <div style={{ display: "flex", gap: 2, background: "#080808", overflowX: "auto", padding: 8 }}>
                {shots.map((s, i) => (
                  <div key={i} style={{ flexShrink: 0, position: "relative", border: i === 0 ? "2px solid #E8334A" : "1px solid #1A1A1A" }}>
                    <div style={{ position: "absolute", top: 4, left: 4, fontFamily: "'Courier New',monospace", fontSize: 8, background: "#000", color: i === 0 ? "#E8334A" : "#333", padding: "1px 5px", zIndex: 1, letterSpacing: "0.05em" }}>
                      {i === 0 ? "TOP" : i === 1 ? "FOLD" : "FULL"}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s} alt={`capture ${i+1}`} style={{ width: i === 2 ? 130 : 180, height: 120, objectFit: "cover", objectPosition: "top", display: "block" }} loading="lazy"/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Big verdict */}
      <AnimatePresence>
        {done && score !== null && <VerdictHero score={score} dims={dims} />}
      </AnimatePresence>

      {/* Live status — terminal progress bar */}
      {!done && !error && (() => {
        const MONO = "'Courier New','Lucida Console',monospace";
        const total = effectiveTier === "full" ? 9 : 3;
        const pct = shots.length > 0 ? Math.max(10, Math.round((dims.length / total) * 100)) : 5;
        const statusText = dims.length === 0 ? status : TAUNTS[taunt];
        return (
          <div style={{ marginBottom: 20, border: "1px solid #1A1A1A", background: "#080808" }}>
            {/* Progress bar */}
            <div style={{ height: 3, background: "#111", overflow: "hidden" }}>
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: "#E8334A" }}
              />
            </div>
            {/* Terminal line */}
            <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#E8334A", flexShrink: 0 }}>$</span>
              <AnimatePresence mode="wait">
                <motion.span key={statusText}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontFamily: MONO, fontSize: 11, color: "#444", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {statusText.toUpperCase()}
                </motion.span>
              </AnimatePresence>
              <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity }}
                style={{ fontFamily: MONO, fontSize: 11, color: "#E8334A", flexShrink: 0 }}>█</motion.span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#2A2A2A", flexShrink: 0 }}>{dims.length}/{total}</span>
            </div>
          </div>
        );
      })()}

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "12px 16px", marginBottom: 20, border: "2px solid #E8334A", boxShadow: "4px 4px 0 #E8334A", background: "#0D0305", fontFamily: "'Courier New',monospace", fontSize: 12, color: "#FF6B8A", lineHeight: 1.5 }}>
          <span style={{ color: "#E8334A", fontWeight: 900 }}>ERROR: </span>{error}
        </motion.div>
      )}

      {/* Roasts section label — terminal divider */}
      {(dims.length > 0 || (!done && !error)) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ height: 1, background: "#1A1A1A", flex: "0 0 20px" }}/>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#2A2A2A", whiteSpace: "nowrap" }}>
            {done ? "// FULL DAMAGE REPORT" : "// LIVE ANALYSIS"}
          </span>
          <div style={{ height: 1, background: "#1A1A1A", flex: 1 }}/>
        </div>
      )}

      {/* Cards */}
      {dims.map((d, i) => {
        const worstScore = Math.min(...dims.map(x => x.score));
        const isWorst = d.score === worstScore;
        return (
          <React.Fragment key={d.dimension}>
            <RoastCard result={d} idx={i} isWorst={isWorst} />
            <MemeSticker score={d.score} dimension={d.dimension} />
          </React.Fragment>
        );
      })}
      {!done && !error && pendingDims.map(d => <Skeleton key={d} dimKey={d} />)}

      {/* Locked + upsell — hidden for admin */}
      {done && effectiveTier !== "full" && (
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

      {done && effectiveTier === "full" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: "rgba(50,215,75,0.04)", border: "1px solid rgba(50,215,75,0.14)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{ fontSize: 13, color: "#32D74B", fontWeight: 600 }}>all 9 roasts delivered. the receipts are in. 💀</span>
        </motion.div>
      )}

      {/* PDF download — shows when audit is done */}
      {done && dims.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
          style={{ marginTop: 20 }}
        >
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "13px 20px", borderRadius: 12,
              background: "transparent", border: "1px solid #27273A",
              color: pdfLoading ? "#4A4A62" : "#8B8BA3", fontSize: 13, fontWeight: 600,
              cursor: pdfLoading ? "default" : "pointer", letterSpacing: "-0.01em",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!pdfLoading) { (e.currentTarget as HTMLElement).style.borderColor = "#E8334A44"; (e.currentTarget as HTMLElement).style.color = "#FAFAFA"; } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#27273A"; (e.currentTarget as HTMLElement).style.color = "#8B8BA3"; }}
          >
            {pdfLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }}/> : <Download size={14}/>}
            {pdfLoading ? "Generating PDF…" : "Download Report as PDF"}
          </button>
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
