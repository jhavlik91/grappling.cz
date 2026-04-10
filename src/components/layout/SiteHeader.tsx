"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Domů" },
  { href: "/rankings", label: "Žebříček" },
  { href: "/events", label: "Turnaje" },
  { href: "/articles", label: "Články" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0D0D0D]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white font-display"
        >
          <span className="text-2xl">🥋</span>
          <span>Grappling.cz</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="#armoury"
            className="btn-neon ml-3 rounded-lg px-4 py-2 text-xs"
          >
            ARMOURY
          </Link>
        </nav>
      </div>
    </header>
  );
}
