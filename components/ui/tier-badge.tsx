const TIER_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  full:  { bg: "#BF5AF215", color: "#BF5AF2", label: "Full" },
  pro:   { bg: "#0A84FF15", color: "#0A84FF", label: "Pro" },
  free:  { bg: "#3A3A5E20", color: "#8B8BA3", label: "Free" },
};

interface TierBadgeProps {
  tier: string;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES.free;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 5,
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.color}25`,
    }}>
      {style.label}
    </span>
  );
}
