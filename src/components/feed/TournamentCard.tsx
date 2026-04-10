import Link from "next/link";
import type { TournamentPreview } from "@/types/content";

const STATUS_LABELS: Record<TournamentPreview["status"], { label: string; className: string }> = {
  upcoming: { label: "Připravuje se", className: "bg-blue-500/20 text-blue-400" },
  live: { label: "Probíhá", className: "bg-green-500/20 text-green-400" },
  completed: { label: "Ukončeno", className: "bg-gray-500/20 text-gray-400" },
};

export function TournamentCard({ tournament }: { tournament: TournamentPreview }) {
  const status = STATUS_LABELS[tournament.status];

  return (
    <Link
      href={`/turnaje/${tournament.slug}`}
      className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-amber-900/40 via-gray-900 to-gray-800 flex items-center justify-center">
        <span className="text-2xl">🏆</span>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <span className={`self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
          {status.label}
        </span>
        <h3 className="mt-1.5 font-display text-sm font-bold text-white transition-colors group-hover:text-[#84CC16] sm:text-base">
          {tournament.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
          <span>{tournament.date}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{tournament.location}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{tournament.competitorCount} závodníků</span>
        </div>
      </div>
    </Link>
  );
}
