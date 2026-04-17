import fs from "node:fs/promises";
import path from "node:path";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { SeminarFormButton } from "./SeminarFormButton";

interface Seminar {
  name: string;
  date: string;
  time?: string;
  location: string;
  instructor: string;
  url?: string;
  logoUrl?: string;
  registrationFee?: string;
  description?: string;
}

function formatDate(raw: string) {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("cs-CZ");
  } catch {
    return raw;
  }
}

function SeminarCard({ seminar, isPast }: { seminar: Seminar; isPast?: boolean }) {
  return (
    <div className="glass glass-hover card-3d group rounded-2xl p-6 transition-all relative flex flex-col h-full border border-white/[0.04] bg-[#111113]">
      <div className="flex gap-4 items-center mb-4 relative z-10">
        <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-900 border border-white/10 shrink-0 shadow-lg flex items-center justify-center">
          {seminar.logoUrl ? (
            <img
              src={seminar.logoUrl}
              alt={seminar.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-2xl">🎓</span>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="text-sm text-[#A855F7] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            {isPast ? "Proběhlo" : "Připravuje se"}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-[#84CC16] transition-colors leading-tight">
            {seminar.name}
          </h2>
        </div>
      </div>

      <div className="mt-auto relative z-10 flex flex-col gap-4 border-t border-white/[0.04] pt-4">
        <div className="flex flex-col gap-2 text-base text-gray-400">
          {seminar.instructor && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>{seminar.instructor}</span>
            </div>
          )}
          {seminar.date && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>
                {formatDate(seminar.date)}
                {seminar.time ? ` · ${seminar.time}` : ""}
              </span>
            </div>
          )}
          {seminar.location && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{seminar.location}</span>
            </div>
          )}
          {seminar.registrationFee && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 shrink-0"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>{seminar.registrationFee}</span>
            </div>
          )}
        </div>

        {seminar.description && (
          <p className="text-sm text-gray-400 leading-relaxed">{seminar.description}</p>
        )}

        {seminar.url && (
          <a
            href={seminar.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline rounded-lg px-4 py-2 text-sm text-center font-bold"
          >
            REGISTRACE / VÍCE INFO
          </a>
        )}
      </div>
    </div>
  );
}

async function getSeminars(): Promise<Seminar[]> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "seminare.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function SeminarePage() {
  const seminars = await getSeminars();

  const now = new Date();
  const future = seminars
    .filter((s) => new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = seminars
    .filter((s) => new Date(s.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 mb-12">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Semináře
          </h1>
          <p className="mt-4 text-sm text-gray-400 max-w-2xl leading-relaxed">
            Přehled plánovaných a proběhlých grapplingových seminářů v České republice.
          </p>
        </div>
        <SeminarFormButton />
      </div>

      {future.length > 0 && (
        <CollapsibleSection
          title="Plánované semináře"
          defaultOpen={true}
          titleIcon={<span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse"></span>}
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {future.map((s, i) => <SeminarCard key={i} seminar={s} />)}
          </div>
        </CollapsibleSection>
      )}

      {past.length > 0 && (
        <CollapsibleSection
          title="Proběhlé semináře"
          defaultOpen={true}
          titleIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((s, i) => <SeminarCard key={i} seminar={s} isPast />)}
          </div>
        </CollapsibleSection>
      )}

      {future.length === 0 && past.length === 0 && (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-lg text-gray-500">Momentálně nejsou evidovány žádné semináře.</p>
        </div>
      )}
    </div>
  );
}
