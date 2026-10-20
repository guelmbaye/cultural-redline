import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CULTURAL REDLINE",
  description: "Paste the strategy. Make every cultural assumption prove itself."
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
          <nav className="navLinks">
            <Link href="/proof">Proof</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
