"use client";

import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer
      className="px-5 py-12 border-t"
      style={{ borderColor: "var(--border-subtle)" }}
      aria-label="Footer"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <Logo size={22} />

        <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
          AI-powered landing page audits. Not affiliated with any roast establishment.
        </p>

        <div className="flex items-center gap-4">
          {["Privacy", "Terms"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs transition-colors"
              style={{ color: "var(--text-dim)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)";
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
