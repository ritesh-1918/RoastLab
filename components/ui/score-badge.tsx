import { scoreColor, scoreGrade } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showGrade?: boolean;
}

export function ScoreBadge({ score, size = "md", showGrade = false }: ScoreBadgeProps) {
  const color = scoreColor(score);
  const grade = scoreGrade(score);

  const dims = {
    sm: { width: 36, height: 36, fontSize: 11, gradeSize: 8 },
    md: { width: 48, height: 48, fontSize: 14, gradeSize: 9 },
    lg: { width: 64, height: 64, fontSize: 18, gradeSize: 11 },
  }[size];

  return (
    <div style={{
      width: dims.width,
      height: dims.height,
      borderRadius: 10,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: dims.fontSize, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
      {showGrade && (
        <span style={{ fontSize: dims.gradeSize, fontWeight: 700, color: `${color}80`, marginTop: 2 }}>{grade}</span>
      )}
    </div>
  );
}
