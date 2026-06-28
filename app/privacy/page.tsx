import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Privacy Policy — RoastLab",
  description: "How RoastLab handles your data.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      <header style={{ borderBottom: "1px solid var(--border-subtle)", padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={24} />
        </Link>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ember)", marginBottom: 12 }}>Legal</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Last updated: June 28, 2026</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40, fontSize: 14, lineHeight: 1.75, color: "var(--text-secondary)" }}>
          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>1. What We Collect</h2>
            <p>When you submit a URL for analysis, we process that URL and its publicly accessible page content (text, structure, screenshots) to generate an AI audit report. We do not collect or store personal data beyond what is necessary to deliver the audit.</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong style={{ color: "var(--text-primary)" }}>URLs submitted</strong> — processed in real-time, not permanently stored</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Screenshots</strong> — captured via third-party service (microlink.io), not retained by us</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Account data</strong> — if you sign up, Clerk handles name, email, and OAuth tokens</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Payment data</strong> — handled entirely by Stripe; we never see card details</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>2. How We Use Data</h2>
            <p>Submitted URLs and page content are sent to AI providers (OpenRouter, Groq, Google Gemini) solely to generate the roast report. We do not use your data to train AI models, sell to third parties, or serve advertising.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>3. Third-Party Services</h2>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Clerk</strong> — authentication (clerk.com/privacy)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Stripe</strong> — payment processing (stripe.com/privacy)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Vercel</strong> — hosting and edge functions</li>
              <li><strong style={{ color: "var(--text-primary)" }}>OpenRouter / Groq / Google</strong> — AI inference for generating reports</li>
              <li><strong style={{ color: "var(--text-primary)" }}>microlink.io / Jina AI</strong> — screenshot capture and page crawling</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>4. Cookies</h2>
            <p>We use session cookies set by Clerk for authentication. No advertising or tracking cookies are used.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>5. Data Retention</h2>
            <p>Audit results are ephemeral — generated on-demand and not stored server-side. Account data is retained until you delete your account. Payment records are retained by Stripe per their policy.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>6. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by emailing us. If you are in the EU/EEA, you have rights under GDPR including access, rectification, and erasure.</p>
          </section>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>7. Contact</h2>
            <p>Questions? Email <a href="mailto:ritesh@gratiantechnologies.com" style={{ color: "var(--ember)", textDecoration: "none" }}>ritesh@gratiantechnologies.com</a></p>
          </section>
        </div>

        <div style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid var(--border-subtle)" }}>
          <Link href="/" style={{ color: "var(--text-dim)", fontSize: 13, textDecoration: "none" }}>← Back to RoastLab</Link>
        </div>
      </main>
    </div>
  );
}
