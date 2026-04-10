import Link from "next/link";
import type { RankingEntryMini } from "@/types/content";

export function RankingWidgetMini({
  entries,
  label = "Muži · NO-GI · Beginner",
}: {
  entries: RankingEntryMini[];
  label?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-gray-400">
          Žebříčky
        </h3>
        <Link
          href="/rankings"
          className="text-[11px] font-medium text-[#84CC16] hover:underline"
        >
          Zobrazit vše →
        </Link>
      </div>
      <p className="mt-1 text-[11px] font-medium text-gray-500">{label}</p>
      <div className="mt-4 space-y-0">
        {entries.map((entry, i) => (
          <div
            key={`ranking-mini-${i}`}
            className="flex items-center gap-3 border-b border-white/[0.04] py-2.5 last:border-b-0"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#84CC16]/10 text-sm font-bold text-[#84CC16] font-display">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-white truncate">
                {entry.name}
              </p>
              <p className="text-sm text-gray-500 truncate">{entry.club}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
