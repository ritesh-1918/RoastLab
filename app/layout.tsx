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
  title: "RoastLab — Your Landing Page Will Not Survive This",
  description:
    "AI roasts your landing page like a chaotic senior designer at 2am. Get brutally honest feedback across 9 dimensions in ~60s. Free. No signup.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "RoastLab — Your Landing Page Will Not Survive This",
    description: "AI roasts your landing page like a chaotic senior designer at 2am. Free. No signup.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastLab — Your Landing Page Will Not Survive This",
    description: "AI roasts your landing page like a chaotic senior designer at 2am.",
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
