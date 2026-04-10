"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Domů", icon: "🏠" },
  { href: "/zpravy", label: "Zprávy", icon: "📰" },
  { href: "/videa", label: "Videa", icon: "🎬" },
  { href: "/events", label: "Turnaje", icon: "🏆" },
  { href: "/rankings", label: "Žebříčky", icon: "📊" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0D0D0D]/95 backdrop-blur-xl sm:hidden">
      <div className="mx-auto flex max-w-lg items-stretch">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-[#84CC16]" : "text-gray-500"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
