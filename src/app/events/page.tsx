import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

interface Tournament {
  url: string;
  name: string;
  dateStr: string;
  location: string;
  logoUrl?: string; 
}

interface ScrapedMetadata {
  url: string;
  name: string;
  logoUrl: string;
  parsedDate: string;
  location: string;
}

// Helper to determine formatting
function formatEventDate(rawDate: string) {
  if (!rawDate) return "";
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate; // Fallback to raw string if not a valid Date
    return d.toLocaleDateString('cs-CZ');
  } catch {
    return rawDate;
  }
}

// Reusable card for tournaments
function EventCard({ event, isPast }: { event: Tournament; isPast?: boolean }) {
  // Extract event ID from the URL for the external link
  const eventIdMatch = event.url.match(/\/event\/(\d+)/);
  const eventId = eventIdMatch ? eventIdMatch[1] : "";
  
  // Internal ranking check
  const isInternalRankings = isPast && ["27716", "30095", "28782", "28045", "28098"].includes(eventId);
  const internalLink = `/events/event-${eventId}`; 

  // Wrapper tag. If they have internal results, the whole card title/image acts as an internal link.
  const Wrapper = isInternalRankings ? ({ children, className }: any) => <Link href={internalLink} className={className}>{children}</Link> : "div";
  const wrapperProps = isInternalRankings ? { className: "group/title block" } : {};

  return (
    <div className="glass glass-hover card-3d group rounded-2xl p-6 transition-all relative flex flex-col h-full border border-white/[0.04] bg-[#111113]">

      <div className="flex border-b border-white/[0.04] pb-4 mb-4 relative z-10 gap-4 items-center">
        <Wrapper {...wrapperProps as any} className={"shrink-0 cursor-pointer " + (wrapperProps.className || "")}>
           <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-900 border border-white/10 shrink-0 shadow-lg relative flex items-center justify-center">
             {event.logoUrl ? (
               <img 
                 src={event.logoUrl} 
                 alt={event.name} 
                 className="h-full w-full object-cover transition-transform group-hover:scale-105"
                 loading="lazy"
               />
             ) : (
               <span className="text-2xl">🥋</span>
             )}
           </div>
        </Wrapper>

        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="text-sm text-[#A855F7] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            {isPast ? "Ukončeno" : "Připravuje se"}
          </div>
          <Wrapper {...wrapperProps as any} className={"cursor-pointer block " + (wrapperProps.className || "")}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover/title:text-[#84CC16] transition-colors leading-tight">
              {event.name}
            </h2>
          </Wrapper>
        </div>
      </div>

      {(event.dateStr || event.location) && (
        <div className="mb-5 flex flex-col gap-2 text-base text-gray-400">
          {event.dateStr && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>{formatEventDate(event.dateStr)}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>{event.location.replace(', Czechia', '')}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-3 items-center relative z-10 pt-4 border-t border-white/[0.04]">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold"
        >
          SMOOTHCOMP INFO
        </a>
        {isInternalRankings && (
          <Link
            href={internalLink}
            className="btn-neon rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold"
          >
            VÝSLEDKY
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function EventsPage() {
  let pastEvents: Tournament[] = [];
  let futureEvents: Tournament[] = [];

  try {
    const dataPath = path.join(process.cwd(), "public", "data", "events-metadata.json");
    const raw = readFileSync(dataPath, "utf8");
    const scraped: ScrapedMetadata[] = JSON.parse(raw);

    const now = new Date();

    const formattedEvents = scraped.map((s) => {
      let isPast = false;
      if (s.parsedDate && !isNaN(new Date(s.parsedDate).getTime())) {
        isPast = new Date(s.parsedDate) < now;
      } else {
        // Fallback for heuristic check if date parsing fails entirely
        // Some of our explicitly scraped past events have specific URLs
        isPast = ["27716", "30095", "28782", "28045", "28098"].some(id => s.url.includes(id));
      }

      return {
         url: s.url,
         name: s.name,
         dateStr: s.parsedDate,
         location: s.location,
         logoUrl: s.logoUrl,
         isPast
      };
    });

    pastEvents = formattedEvents.filter(e => e.isPast);
    futureEvents = formattedEvents.filter(e => !e.isPast);

    // Optional sorting: sort future events ascending, past events descending
    futureEvents.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
    pastEvents.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  } catch (err) {
    // Return empty state if file missing
    console.error("Failed to read events metadata", err);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        Turnaje
      </h1>
      <p className="mt-4 mb-12 text-sm text-gray-400 max-w-2xl leading-relaxed">
        Přehled plánovaných a proběhlých turnajů v České republice z platformy Smoothcomp. 
        Sledujeme události lokální i mezinárodní úrovně s výsledky klíčových závodníků.
      </p>

      {/* FUTURE EVENTS */}
      <CollapsibleSection
        title="Plánované turnaje v ČR"
        defaultOpen={true}
        titleIcon={<span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse"></span>}
      >
        {futureEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {futureEvents.map((event, i) => (
              <EventCard key={`future-${i}`} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Žádné plánované turnaje nejsou momentálně evidovány.</p>
        )}
      </CollapsibleSection>

      {/* PAST EVENTS */}
      <CollapsibleSection
        title="Proběhlé turnaje a výsledky"
        defaultOpen={true}
        titleIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><polyline points="20 6 9 17 4 12"></polyline></svg>}
      >
        {pastEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event, i) => (
              <EventCard key={`past-${i}`} event={event} isPast={true} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Zatím neevidujeme žádné proběhlé turnaje.</p>
        )}
      </CollapsibleSection>
    </div>
  );
}
