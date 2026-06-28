import Link from "next/link";
import { Logo } from "@/components/logo";

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer
      className="px-5 py-12 border-t"
      style={{ borderColor: "var(--border-subtle)" }}
      aria-label="Footer"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
          <Logo size={22} />

          <nav className="flex items-center gap-6">
            {[
              { label: "How it works", href: "/#how-it-works" },
              { label: "Pricing", href: "/#pricing" },
              ...FOOTER_LINKS,
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs transition-colors"
                style={{ color: "var(--text-dim)", textDecoration: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-dim)";
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            © {new Date().getFullYear()} RoastLab. AI-powered landing page audits.
          </p>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Built with 🔥 by{" "}
            <a
              href="https://gratiantechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ember)", textDecoration: "none" }}
            >
              Gratian Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
