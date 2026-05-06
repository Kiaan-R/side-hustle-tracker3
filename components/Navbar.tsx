"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/Navbar.tsx
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",         label: "Dashboard", emoji: "⚡" },
  { href: "/insights", label: "Insights",  emoji: "📊" },
];

interface Props {
  onAddHustle:  () => void;
  onLogSession: () => void;
}

export default function Navbar({ onAddHustle, onLogSession }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-900">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="mr-5 flex items-center gap-2 no-underline">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white shadow">
            H
          </div>
          <span
            className="text-[17px] font-extrabold tracking-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Hustle<span className="text-brand-400">IQ</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map(({ href, label, emoji }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-all duration-150 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <span className="text-xs leading-none">{emoji}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogSession}
            className="hidden rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/15 hover:text-white sm:flex"
          >
            ⏱ Log Session
          </button>
          <button
            onClick={onAddHustle}
            className="hiq-btn text-xs px-4 py-2"
          >
            + Add Hustle
          </button>
        </div>
      </div>
    </header>
  );
}
