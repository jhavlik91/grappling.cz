import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden sm:block border-t border-white/[0.06] bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-extrabold text-white font-display"
            >
              <span className="text-xl">🥋</span>
              <span>Grappling.cz</span>
            </Link>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-600">
              Novinky, analýzy, rozhovory a výsledky z českého grapplingového světa.
            </p>
          </div>

          <nav className="flex gap-8 text-xs text-gray-500">
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider text-gray-400">Obsah</p>
              <Link href="/zpravy" className="block hover:text-white transition-colors">Zprávy</Link>
              <Link href="/videa" className="block hover:text-white transition-colors">Videa</Link>
              <Link href="/events" className="block hover:text-white transition-colors">Turnaje</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider text-gray-400">Více</p>
              <Link href="/rankings" className="block hover:text-white transition-colors">Žebříčky</Link>
              <Link href="/articles" className="block hover:text-white transition-colors">Články</Link>
            </div>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/[0.04] pt-4">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} Grappling.cz — Český grapplingový portál
          </p>
        </div>
      </div>
    </footer>
  );
}
