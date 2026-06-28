export const SITE_URL = "https://getroastlab.vercel.app";
export const SITE_NAME = "RoastLab";
export const SITE_DESCRIPTION = "AI roasts your website across 9 dimensions — zero mercy, pure receipts";
export const SUPPORT_EMAIL = "ritesh@gratiantechnologies.com";

export const FREE_AUDIT_LIMIT = 1;
export const MAX_URL_LENGTH = 2000;

export const SCORE_TIERS = {
  ELITE: 85,
  GOOD: 75,
  DECENT: 65,
  AVERAGE: 50,
  BAD: 35,
  DISASTER: 20,
} as const;

export const PLANS = {
  FREE: { name: "Free", dims: 3, label: "3 dimensions" },
  PRO: { name: "Pro", dims: 9, label: "9 dimensions" },
  FULL: { name: "Full", dims: 9, label: "9 dimensions + deep crawl" },
} as const;

export const ADMIN_EMAILS_LIST = [
  "bonthalamadhavi1@gmail.com",
  "ritesh@gratiantechnologies.com",
] as const;
