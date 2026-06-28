import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreColor(score: number): string {
  if (score >= 75) return "#32D74B";
  if (score >= 60) return "#FFD60A";
  if (score >= 40) return "#FF9F0A";
  if (score >= 20) return "#FF6B00";
  return "#FF2D55";
}

export function scoreGrade(score: number): string {
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export function truncateUrl(url: string, max = 40): string {
  const clean = url.replace(/^https?:\/\/(www\.)?/, "");
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

