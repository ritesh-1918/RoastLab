'use client';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.15)}
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 1C12 1 21 9 18 16C20 13 24 18 21 23C23 21 24 26 20 28H4C0 26 1 21 3 23C0 18 4 13 6 16C3 9 12 1 12 1Z"
        fill="#FF4D1C"
      />
      <path
        d="M12 9C12 9 16 13 14.5 18C16 16 18.5 19 17 22H7C5.5 19 8 16 9.5 18C8 13 12 9 12 9Z"
        fill="#FFB38A"
        opacity="0.75"
      />
    </svg>
  );
}

export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  const textSize = Math.round(size * 0.57);
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.29) }}>
      <LogoMark size={size} />
      <span
        style={{
          fontWeight: 800,
          fontSize: textSize,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        ROAST<span style={{ color: 'var(--ember)' }}>LAB</span>
      </span>
    </div>
  );
}
