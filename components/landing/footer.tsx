"use client";

export function Footer() {
  return (
    <footer
      className="px-4 py-12 border-t"
      style={{ borderColor: "var(--border-subtle)" }}
      aria-label="Footer"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div
          className="flex items-center gap-2 font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{ background: "var(--ember)" }}
            aria-hidden="true"
          >
            🔥
          </span>
          RoastLab
        </div>

        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
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
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "var(--text-dim)";
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
