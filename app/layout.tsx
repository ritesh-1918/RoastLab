import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  metadataBase: new URL("https://getroastlab.vercel.app"),
  keywords: ["website audit", "landing page roast", "AI design feedback", "UX audit", "SEO checker", "website review"],
  authors: [{ name: "Ritesh Bonthalakoti", url: "https://github.com/ritesh-1918" }],
  creator: "Ritesh Bonthalakoti",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "RoastLab — Your Landing Page Will Not Survive This",
    description: "AI roasts your landing page like a chaotic senior designer at 2am. Free. No signup.",
    type: "website",
    url: "https://getroastlab.vercel.app",
    siteName: "RoastLab",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastLab — Your Landing Page Will Not Survive This",
    description: "AI roasts your landing page like a chaotic senior designer at 2am.",
    creator: "@ritesh_builds",
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
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
