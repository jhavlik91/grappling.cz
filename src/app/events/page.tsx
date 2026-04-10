import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

interface EventSummary {
  slug: string;
  name: string;
  date: string;
  country: string;
}

export default async function EventsPage() {
  let events: EventSummary[] = [];

  try {
    const indexPath = path.join(
      process.cwd(),
      "public",
      "data",
      "events",
      "index.json"
    );
    const raw = await fs.readFile(indexPath, "utf8");
    events = JSON.parse(raw);
  } catch {
    /* no data yet */
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        Turnaje
      </h1>
      <p className="mt-2 mb-10 text-sm text-gray-500">
        Přehled sledovaných turnajů a jejich výsledků.
      </p>

      {events.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-lg text-gray-500">Zatím žádné turnaje.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className="glass glass-hover card-3d group rounded-2xl p-6 transition-all block"
            >
              {/* Logo placeholder */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.05] text-2xl">
                🥋
              </div>

              <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                {event.date}
              </div>
              <h2 className="font-display text-lg font-bold text-white group-hover:text-[#84CC16] transition-colors">
                {event.name}
              </h2>
              <div className="mt-1 text-xs text-gray-500">
                {event.country}
              </div>

              <div className="mt-5 flex gap-3">
                <span className="btn-neon rounded-lg px-4 py-1.5 text-[10px]">
                  VÝSLEDKY
                </span>
                <span className="btn-outline rounded-lg px-4 py-1.5 text-[10px]">
                  RECENZE
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
