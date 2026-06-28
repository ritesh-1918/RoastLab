import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #1E1E28",
        padding: "48px 24px",
        background: "#09090B",
      }}
      aria-label="Footer"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 40,
          }}
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Logo size={22} />
            </Link>
            <p style={{ fontSize: 13, color: "#4A4A62", marginTop: 12, maxWidth: 260, lineHeight: 1.6 }}>
              AI-powered landing page audits. Brutal. Honest. Fast.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A4A62", marginBottom: 12 }}>
                Product
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "How it works", href: "/#how-it-works" },
                  { label: "Pricing", href: "/#pricing" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 13, color: "#8B8BA3", textDecoration: "none", transition: "color 150ms" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FAFAFA"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8B8BA3"; }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A4A62", marginBottom: 12 }}>
                Legal
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    style={{ fontSize: 13, color: "#8B8BA3", textDecoration: "none", transition: "color 150ms" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#FAFAFA"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8B8BA3"; }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #1E1E28",
            paddingTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 12, color: "#4A4A62", margin: 0 }}>
            © {new Date().getFullYear()} RoastLab. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: "#4A4A62", margin: 0 }}>
            Built by{" "}
            <span style={{ color: "#8B8BA3", fontWeight: 600 }}>Ritesh Pontalakoti</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
