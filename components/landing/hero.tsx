"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Globe, Upload, ArrowRight, Target, X } from "lucide-react";

export function Hero() {
  const [tab, setTab] = useState<"url" | "screenshot">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const router = useRouter();

  function handleRoast() {
    if (tab === "url") {
      const trimmed = url.trim();
      if (!trimmed) return;
      const target = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
      router.push(`/analyze?url=${encodeURIComponent(target)}`);
    }
  }

  function handleStartRoasting() {
    if (!uploadData) return;
    sessionStorage.setItem("roastlab_upload", JSON.stringify(uploadData));
    router.push("/analyze?upload=1");
  }

  function clearFile() {
    setFile(null);
    setPreviewUrl(null);
    setUploadData(null);
  }

  return (
    <section
      className="relative flex flex-col items-center justify-center px-5 overflow-hidden"
      style={{ minHeight: "92vh", paddingTop: 80, paddingBottom: 80 }}
      aria-label="Hero"
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* Red center glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(232,51,74,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 860,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 32 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#E8334A",
              padding: "5px 14px",
              borderRadius: 99,
              border: "1px solid rgba(232,51,74,0.25)",
              background: "rgba(232,51,74,0.06)",
            }}
          >
            <Target size={10} />
            AI Landing Page Analyzer
          </div>
        </motion.div>

        {/* ROASTLAB wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 8 }}
        >
          <h1
            style={{
              fontSize: "clamp(56px, 12vw, 120px)",
              fontWeight: 900,
              letterSpacing: "-0.05em",
              lineHeight: 0.92,
              color: "#FAFAFA",
              margin: 0,
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            }}
          >
            ROAST<span style={{ color: "#E8334A" }}>LAB</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "#8B8BA3",
            maxWidth: 480,
            lineHeight: 1.55,
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          Your landing page doesn&apos;t have a chance. We analyze 9 dimensions —
          brutally honest, in 60 seconds.
        </motion.p>

        {/* Input card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", maxWidth: 520 }}
        >
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #27273A",
              background: "#111117",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,51,74,0.06) inset",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #1E1E28" }} role="tablist">
              {[
                { key: "url" as const, label: "URL", Icon: Globe },
                { key: "screenshot" as const, label: "Screenshot", Icon: Upload },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => { setTab(key); clearFile(); }}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "13px 16px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 150ms, color 150ms",
                    borderBottom: tab === key ? "2px solid #E8334A" : "2px solid transparent",
                    background: tab === key ? "rgba(232,51,74,0.04)" : "transparent",
                    color: tab === key ? "#FAFAFA" : "#52526A",
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* URL input */}
            {tab === "url" && (
              <div style={{ display: "flex", alignItems: "center", padding: "6px 6px 6px 16px", gap: 8 }}>
                <Globe size={14} style={{ color: "#52526A", flexShrink: 0 }} />
                <input
                  type="url"
                  id="hero-input"
                  placeholder="https://yoursite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRoast()}
                  aria-label="Website URL to audit"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    padding: "10px 0",
                    color: "#FAFAFA",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                />
                <button
                  onClick={handleRoast}
                  disabled={!url.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    cursor: url.trim() ? "pointer" : "not-allowed",
                    background: url.trim() ? "#E8334A" : "#27273A",
                    color: url.trim() ? "#fff" : "#52526A",
                    transition: "background 150ms",
                    minHeight: 40,
                    flexShrink: 0,
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) => {
                    if (!url.trim()) return;
                    (e.currentTarget as HTMLButtonElement).style.background = "#C92B3E";
                  }}
                  onMouseLeave={(e) => {
                    if (!url.trim()) return;
                    (e.currentTarget as HTMLButtonElement).style.background = "#E8334A";
                  }}
                >
                  Analyze <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* Screenshot drop zone */}
            {tab === "screenshot" && (
              previewUrl ? (
                /* Preview state */
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 24px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      borderRadius: 8,
                      objectFit: "contain",
                      border: "1px solid #27273A",
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#8B8BA3", margin: 0, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file?.name}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                      onClick={handleStartRoasting}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        fontSize: 13, fontWeight: 700, padding: "10px 22px",
                        borderRadius: 10, border: "none", cursor: "pointer",
                        background: "#E8334A", color: "#fff", letterSpacing: "-0.01em",
                      }}
                    >
                      Start Roasting <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={clearFile}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 12, color: "#52526A", background: "#1E1E28",
                        border: "1px solid #27273A", borderRadius: 8,
                        padding: "9px 12px", cursor: "pointer",
                      }}
                    >
                      <X size={12} /> Change
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload state */
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "36px 24px",
                    cursor: "pointer",
                  }}
                  aria-label="Upload screenshot"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          const base64 = dataUrl.split(",")[1];
                          setPreviewUrl(dataUrl);
                          setUploadData({ base64, mimeType: f.type, name: f.name });
                        };
                        reader.readAsDataURL(f);
                      }
                    }}
                  />
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "#1E1E28",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Upload size={18} style={{ color: "#52526A" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#FAFAFA", margin: 0 }}>
                      Drop a screenshot or click to browse
                    </p>
                    <p style={{ fontSize: 12, color: "#52526A", margin: "4px 0 0" }}>
                      Figma mocks, live pages, competitor audits — JPG, PNG, WebP
                    </p>
                  </div>
                </label>
              )
            )}
          </div>

          {/* Trust pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 20 }}
          >
            {["3 free dimensions", "No signup required", "~60s results"].map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#4A4A62",
                  padding: "4px 12px",
                  borderRadius: 99,
                  border: "1px solid #1E1E28",
                }}
              >
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
