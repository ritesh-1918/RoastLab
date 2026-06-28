import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#FAFAFA",
      textAlign: "center",
      padding: "0 24px",
    }}>
      <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, color: "#E8334A", marginBottom: 8 }}>404</div>
      <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        page not found
      </p>
      <p style={{ fontSize: 14, color: "#8B8BA3", margin: "0 0 32px", maxWidth: 360 }}>
        whoever built this URL was cooked. let&apos;s get you back somewhere that exists.
      </p>
      <Link href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 24px",
        background: "#E8334A",
        color: "#fff",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none",
        letterSpacing: "-0.02em",
      }}>
        🔥 go roast something instead
      </Link>
    </div>
  );
}
