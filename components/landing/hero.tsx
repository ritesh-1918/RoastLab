"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Globe, Upload, ArrowRight, Flame } from "lucide-react";

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
      className="relative flex flex-col items-center justify-center min-h-[88vh] px-5 py-20 text-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background radial glow — ember at top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(255,77,28,0.11) 0%, transparent 65%)",
        }}
      />

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Live badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 px-4 py-1.5 rounded-full border"
          style={{
            background: "rgba(255,77,28,0.07)",
            borderColor: "rgba(255,77,28,0.22)",
            color: "#FF6B35",
          }}
        >
          <Flame size={11} aria-hidden="true" />
          AI Landing Page Roaster — Free
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04] text-balance mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}
      >
        We roast{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #FF3000 0%, #FF6B35 55%, #FFB380 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          landing pages.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="text-base sm:text-lg max-w-[460px] leading-relaxed mb-10"
        style={{ color: "var(--text-secondary)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        Vision AI tears yours apart across 9 dimensions — design, copy, CTAs,
        UX, SEO, and more. Brutally honest. No signup.
      </motion.p>

      {/* Input card */}
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-2xl border p-1.5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-emph)",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,77,28,0.04) inset",
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-1.5 gap-1"
            style={{ background: "var(--bg-1)" }}
            role="tablist"
            aria-label="Input method"
          >
            {[
              { key: "url" as const, label: "Paste URL", Icon: Globe },
              { key: "screenshot" as const, label: "Screenshot", Icon: Upload },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg transition-all"
                style={{
                  background: tab === key ? "var(--bg-card)" : "transparent",
                  color: tab === key ? "var(--text-primary)" : "var(--text-dim)",
                  boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.35)" : "none",
                }}
              >
                <Icon size={13} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {/* URL input */}
          {tab === "url" && (
            <div className="flex items-center gap-2 px-1">
              <Globe
                size={13}
                aria-hidden="true"
                className="shrink-0 ml-2"
                style={{ color: "var(--text-dim)" }}
              />
              <input
                type="url"
                id="hero-input"
                placeholder="https://yoursite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRoast()}
                aria-label="Website URL to audit"
                className="flex-1 bg-transparent border-none outline-none text-sm py-3 placeholder:text-[var(--text-dim)]"
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleRoast}
                disabled={!url.trim()}
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
                style={{
                  background: "var(--ember)",
                  color: "#fff",
                  minHeight: "44px",
                  letterSpacing: "-0.01em",
                  boxShadow: url.trim() ? "0 2px 12px rgba(255,77,28,0.35)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!url.trim()) return;
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.background = "var(--ember-2)";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement;
                  btn.style.background = "var(--ember)";
                }}
              >
                Roast it <ArrowRight size={13} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Screenshot drop zone */}
          {tab === "screenshot" && (
            <label
              className="flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-all"
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
                    const reader = new FileReader();
                    reader.onload = () => {
                      const dataUrl = reader.result as string;
                      const base64 = dataUrl.split(",")[1];
                      sessionStorage.setItem(
                        "roastlab_upload",
                        JSON.stringify({ base64, mimeType: f.type, name: f.name })
                      );
                      router.push("/analyze?upload=1");
                    };
                    reader.readAsDataURL(f);
                  }
                }}
              />
              <Upload size={20} aria-hidden="true" style={{ color: file ? "var(--ember)" : undefined }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {file ? file.name : (
                  <>
                    Drop a screenshot or{" "}
                    <span style={{ color: "var(--ember)" }}>browse</span>
                  </>
                )}
              </p>
              <p className="text-xs">Figma mocks, live pages, competitor audits</p>
            </label>
          )}
        </div>
      </motion.div>

      {/* Social proof chips */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.28 }}
      >
        {[
          "3 free dimensions",
          "No signup required",
          "~60s results",
          "1,200+ pages roasted",
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
