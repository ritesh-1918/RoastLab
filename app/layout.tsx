import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoastLab — AI Landing Page Audit",
  description:
    "Get a senior designer's verdict on your landing page in 60 seconds. AI audit across 9 dimensions: Visual Design, UX, Copywriting, Accessibility, Trust, CTA, Mobile, Performance, SEO.",
  openGraph: {
    title: "RoastLab — AI Landing Page Audit",
    description: "AI reviews your landing page like a senior designer, copywriter, and CRO expert.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: "var(--bg)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
