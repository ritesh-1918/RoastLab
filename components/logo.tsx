export function LogoMark({ size = 32 }: { size?: number }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke="#E8334A" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="7" stroke="#E8334A" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="16" r="2" fill="#E8334A" />
      <line x1="16" y1="2" x2="16" y2="8" stroke="#E8334A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="24" x2="16" y2="30" stroke="#E8334A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="16" x2="8" y2="16" stroke="#E8334A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="16" x2="30" y2="16" stroke="#E8334A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(size * 0.35),
      }}
    >
      <LogoMark size={size} />
      <span
        style={{
          fontWeight: 900,
          fontSize: Math.round(size * 0.6),
          letterSpacing: "-0.04em",
          color: "#FAFAFA",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        ROAST<span style={{ color: "#E8334A" }}>LAB</span>
      </span>
    </div>
  );
}
