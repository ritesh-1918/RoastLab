"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Globe, Upload, ArrowRight } from "lucide-react";

export function Hero() {
  const [tab, setTab] = useState<"url" | "screenshot">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  function handleRoast() {
    if (tab === "url") {
      const trimmed = url.trim();
      if (!trimmed) return;
      const target = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      router.push(`/analyze?url=${encodeURIComponent(target)}`);
    }
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 py-24 text-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,77,28,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-8 px-4 py-1.5 rounded-full border"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-emph)",
            color: "var(--text-dim)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--ember)" }}
            aria-hidden="true"
          />
          AI-Powered Landing Page Audit
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-balance mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ color: "var(--text-primary)" }}
      >
        Get your page{" "}
        <span
          className="inline-block"
          style={{
            background: "linear-gradient(135deg, #FF4D1C 0%, #FF8A50 60%, #FFBB80 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          roasted
        </span>
        <br />
        in 60 seconds.
      </motion.h1>

      {/* Subheading */}
      <motion.p
        className="text-lg sm:text-xl max-w-[480px] leading-relaxed mb-10"
        style={{ color: "var(--text-secondary)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        AI reviews your landing page like a senior designer, copywriter, and
        CRO expert — across 9 dimensions.
      </motion.p>

      {/* Input card */}
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-2xl border p-1.5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-emph)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(255,77,28,0.05)",
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-1.5 gap-1"
            style={{ background: "var(--bg-1)" }}
            role="tablist"
            aria-label="Input method"
          >
            <button
              role="tab"
              aria-selected={tab === "url"}
              onClick={() => setTab("url")}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg transition-all"
              style={{
                background: tab === "url" ? "var(--bg-card)" : "transparent",
                color: tab === "url" ? "var(--text-primary)" : "var(--text-dim)",
                boxShadow: tab === "url" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              <Globe size={14} aria-hidden="true" />
              Paste URL
            </button>
            <button
              role="tab"
              aria-selected={tab === "screenshot"}
              onClick={() => setTab("screenshot")}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg transition-all"
              style={{
                background: tab === "screenshot" ? "var(--bg-card)" : "transparent",
                color:
                  tab === "screenshot" ? "var(--text-primary)" : "var(--text-dim)",
                boxShadow: tab === "screenshot" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              }}
            >
              <Upload size={14} aria-hidden="true" />
              Screenshot
            </button>
          </div>

          {/* URL input */}
          {tab === "url" && (
            <div className="flex items-center gap-2 px-1">
              <Globe
                size={14}
                aria-hidden="true"
                className="shrink-0 ml-2"
                style={{ color: "var(--text-dim)" }}
              />
              <input
                type="url"
                placeholder="https://yoursite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRoast()}
                aria-label="Website URL to audit"
                className="flex-1 bg-transparent border-none outline-none text-sm py-2.5 placeholder:text-[var(--text-dim)]"
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleRoast}
                disabled={!url.trim()}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "var(--ember)",
                  color: "#fff",
                  minHeight: "44px",
                }}
                onMouseEnter={(e) => {
                  if (!url.trim()) return;
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--ember-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--ember)";
                }}
              >
                Roast it <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Screenshot drop zone */}
          {tab === "screenshot" && (
            <label
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all"
              style={{
                borderColor: file ? "var(--ember)" : "var(--border-emph)",
                color: "var(--text-dim)",
              }}
              aria-label="Upload screenshot"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  if (f) {
                    const fd = new FormData();
                    fd.append("screenshot", f);
                    fd.append("tier", "free");
                    window.location.href = "/analyze?upload=1";
                    // store file in sessionStorage workaround — handled via URL+file upload form
                  }
                }}
              />
              <Upload size={20} aria-hidden="true" style={{ color: file ? "var(--ember)" : undefined }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {file ? file.name : (
                  <>Drop a screenshot or <span style={{ color: "var(--ember)" }}>browse</span></>
                )}
              </p>
              <p className="text-xs">
                Works for Figma mocks, pre-launch pages, competitor audits
              </p>
            </label>
          )}
        </div>
      </motion.div>

      {/* Social proof chips */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {[
          "3 free dimensions",
          "No signup required",
          "Results in ~60s",
        ].map((label) => (
          <span
            key={label}
            className="text-xs px-3 py-1 rounded-full border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-dim)",
            }}
          >
            {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
