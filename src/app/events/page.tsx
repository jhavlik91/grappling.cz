import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { readFileSync } from "node:fs";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { ResultsModal } from "@/components/events/ResultsModal";

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
function EventCard({ event, isPast, isPinned, eventsWithResults }: { event: Tournament; isPast?: boolean; isPinned?: boolean; eventsWithResults: Set<string> }) {
  // Extract event ID from the URL for the external link
  const eventIdMatch = event.url.match(/\/event\/(\d+)/);
  const eventId = eventIdMatch ? eventIdMatch[1] : "";

  // Internal results check — dynamic, based on what's in public/data/events/
  const isInternalRankings = isPast && eventsWithResults.has(eventId);
  const internalLink = `/events/event-${eventId}`;

  // Register URL for upcoming events
  const registerUrl = !isPast && eventId ? `${event.url}/register` : null;

  // Wrapper tag. If they have internal results, the whole card title/image acts as an internal link.
  const Wrapper = isInternalRankings ? ({ children, className }: any) => <Link href={internalLink} className={className}>{children}</Link> : "div";
  const wrapperProps = isInternalRankings ? { className: "group/title block" } : {};

  return (
    <div className={`glass glass-hover card-3d group rounded-2xl p-6 transition-all relative flex flex-col h-full border bg-[#111113] ${isPinned ? "border-[#A855F7]/40 shadow-[0_0_20px_rgba(168,85,247,0.12)]" : "border-white/[0.04]"}`}>

      {isPinned && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A855F7]">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Topované
        </div>
      )}

      <div className="flex relative z-10 gap-4 items-center mb-4">
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

      <div className="mt-auto relative z-10 flex flex-col gap-4 border-t border-white/[0.04] pt-4">
        {(event.dateStr || event.location) && (
          <div className="flex flex-col gap-2 text-base text-gray-400">
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

        <div className="flex flex-wrap gap-3 items-center relative z-10">
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold"
        >
          SMOOTHCOMP INFO
        </a>
        {registerUrl && (
          <a
            href={registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold"
          >
            REGISTRACE
          </a>
        )}
        {isInternalRankings && (
          <ResultsModal eventId={eventId} internalLink={internalLink} />
        )}
        </div>
      </div>
    </div>
  );
}

interface TournamentWithPin extends Tournament {
  isPast: boolean;
  isPinned: boolean;
}

export default async function EventsPage() {
  let pastEvents: TournamentWithPin[] = [];
  let futureEvents: TournamentWithPin[] = [];
  let eventsWithResults: Set<string> = new Set();

  // Load pinned event URLs (up to 6)
  let pinnedUrls: string[] = [];
  try {
    const pinnedPath = path.join(process.cwd(), "data", "pinned-events.json");
    const pinnedRaw = readFileSync(pinnedPath, "utf8");
    const pinnedConfig = JSON.parse(pinnedRaw);
    pinnedUrls = ((pinnedConfig.pinned as string[]) || []).slice(0, 6);
  } catch {
    // No pinned config — continue without pinning
  }

  // Load event IDs that have internal results pages
  try {
    const indexPath = path.join(process.cwd(), "public", "data", "events", "index.json");
    const indexRaw = readFileSync(indexPath, "utf8");
    const index: { slug: string }[] = JSON.parse(indexRaw);
    eventsWithResults = new Set(index.map((e) => e.slug.replace("event-", "")));
  } catch {
    // fallback: empty set — no VÝSLEDKY buttons shown
  }

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

      // Normalize URL for comparison (strip trailing slash)
      const normalizedUrl = s.url.replace(/\/$/, "");
      const isPinned = pinnedUrls.some(p => p.replace(/\/$/, "") === normalizedUrl);

      return {
         url: s.url,
         name: s.name,
         dateStr: s.parsedDate,
         location: s.location,
         logoUrl: s.logoUrl,
         isPast,
         isPinned,
      };
    });

    // Pinned future events in pin order, then the rest sorted by date
    const pinnedFuture = pinnedUrls
      .map(url => formattedEvents.find(e => !e.isPast && e.url.replace(/\/$/, "") === url.replace(/\/$/, "")))
      .filter((e): e is NonNullable<typeof e> => e !== undefined);

    const unpinnedFuture = formattedEvents.filter(e => !e.isPast && !e.isPinned);
    unpinnedFuture.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
    futureEvents = [...pinnedFuture, ...unpinnedFuture];

    pastEvents = formattedEvents.filter(e => e.isPast);
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
              <EventCard key={`future-${i}`} event={event} eventsWithResults={eventsWithResults} />
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
              <EventCard key={`past-${i}`} event={event} isPast={true} eventsWithResults={eventsWithResults} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Zatím neevidujeme žádné proběhlé turnaje.</p>
        )}
      </CollapsibleSection>
    </div>
  );
}
