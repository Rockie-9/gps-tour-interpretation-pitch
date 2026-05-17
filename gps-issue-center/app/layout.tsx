import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "GPS Issue & Management Center",
  description: "OSINT-driven issue detection and case management for TSMC GPS team (spec v0.4)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="brand">
            <Link href="/">GPS Issue & Management Center</Link>
            <span className="phase">phase 0 / v0.4</span>
          </div>
          <nav className="nav">
            <Link href="/issues">Issues</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/sources">Sources</Link>
            <Link href="/health">Health</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
