import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

const SITE_URL = "https://cultural-redline.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "CULTURAL REDLINE",
  title: {
    default: "CULTURAL REDLINE",
    template: "%s · CULTURAL REDLINE"
  },
  description: "Paste the strategy. Make every cultural assumption prove itself.",
  keywords: [
    "Qloo",
    "cultural intelligence",
    "marketing strategy",
    "claim verification",
    "AI",
    "evidence"
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CULTURAL REDLINE",
    title: "CULTURAL REDLINE",
    description: "Paste the strategy. Make every cultural assumption prove itself."
  },
  twitter: {
    card: "summary",
    title: "CULTURAL REDLINE",
    description: "Paste the strategy. Make every cultural assumption prove itself."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            <span className="brandMark">CR</span>
            <span>CULTURAL REDLINE</span>
          </Link>
          <nav className="navLinks" aria-label="Primary navigation">
            <Link href="/proof">Proof</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
