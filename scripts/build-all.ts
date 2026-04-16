import fs from "node:fs/promises";
import path from "node:path";
import { normalizeEvent } from "@/lib/smoothcomp/normalizeEvent";
import { buildRankings } from "@/lib/smoothcomp/buildRankings";
import type { SmoothcompResultsResponse, NormalizedEvent } from "@/types/smoothcomp";

type EventConfig = {
  eventId: number;
  slug: string;
  name: string;
  country: string;
  enabled: boolean;
  baseUrl: string;
};

/**
 * Discover Czech grappling events from the current year that have finished.
 * Scrapes Smoothcomp past-events pages and stops once events from a previous
 * year start appearing (list is newest-first globally).
 * Returns any event IDs not already present in the manual config.
 */
async function discoverPastCzechEvents(
  knownIds: Set<number>,
  year: number
): Promise<EventConfig[]> {
  const discovered: EventConfig[] = [];
  // Past events are listed newest-first. We stop once we've seen enough
  // events from a year before our target (meaning we've passed the boundary).
  let prevYearCount = 0;
  const PREV_YEAR_STOP_THRESHOLD = 20; // stop after seeing 20 pre-target-year events

  for (let page = 1; page <= 50; page++) {
    const url =
      page === 1
        ? "https://smoothcomp.com/en/events/past"
        : `https://smoothcomp.com/en/events/past?page=${page}`;

    let html: string;
    try {
      const res = await fetch(url);
      html = await res.text();
    } catch {
      break;
    }

    // Use a larger chunk per block — cover_image URLs can be 200+ chars
    const blocks = html.split('{"id":');

    for (const block of blocks.slice(1)) {
      const chunk = block.slice(0, 3000);

      const idMatch = chunk.match(/^(\d+)/);
      const titleMatch = chunk.match(/"title":"((?:[^"\\]|\\.)*)"/);
      const countryMatch = chunk.match(/"location_country":"([^"]+)"/);
      const humanMatch = chunk.match(/"location_country_human":"([^"]+)"/);
      const dateMatch = chunk.match(/"startdate":"(\d{4}-\d{2}-\d{2})"/);
      const endedMatch = chunk.match(/"eventEnded":(true|false)/);

      const eventId = idMatch ? parseInt(idMatch[1]) : 0;
      if (!eventId) continue;

      const startdate = dateMatch?.[1] ?? "";
      const eventYear = startdate ? parseInt(startdate.slice(0, 4)) : 0;

      // Track how many pre-target-year events we've seen to know when to stop
      if (eventYear && eventYear < year) {
        prevYearCount++;
        if (prevYearCount >= PREV_YEAR_STOP_THRESHOLD) return discovered;
        continue;
      }

      const ended = endedMatch?.[1] === "true";
      if (!ended) continue;
      // Only process events from the target year
      if (eventYear !== year) continue;

      const country = countryMatch?.[1] ?? "";
      const human = humanMatch?.[1] ?? "";
      const isCzech = country === "CZ" || human.includes("Czech");
      if (!isCzech) continue;
      if (knownIds.has(eventId)) continue;

      const rawTitle = titleMatch?.[1] ?? `Event ${eventId}`;
      const name = rawTitle.replace(/\\u[\dA-Fa-f]{4}/g, (m) =>
        String.fromCharCode(parseInt(m.slice(2), 16))
      );

      discovered.push({
        eventId,
        slug: `event-${eventId}`,
        name,
        country: "CZ",
        enabled: true,
        baseUrl: "https://smoothcomp.com",
      });
      knownIds.add(eventId);
    }
  }

  return discovered;
}

async function main() {
  console.log("=== Build All: Starting data pipeline ===\n");

  // 1. Read events config
  const configPath = path.join(process.cwd(), "data", "events-config.json");
  const raw = await fs.readFile(configPath, "utf8");
  const configEvents: EventConfig[] = JSON.parse(raw);

  // 2. Discover additional past Czech events from the current year
  const currentYear = new Date().getFullYear();
  const knownIds = new Set(configEvents.map((e) => e.eventId));

  console.log(`Discovering past Czech events from ${currentYear}...`);
  const discovered = await discoverPastCzechEvents(knownIds, currentYear);
  if (discovered.length > 0) {
    console.log(`  Found ${discovered.length} new event(s): ${discovered.map((e) => e.slug).join(", ")}`);
  } else {
    console.log("  No new events found.");
  }
  console.log();

  const events = [...configEvents, ...discovered];
  const enabledEvents = events.filter((e) => e.enabled);

  // 2. Fetch from Smoothcomp (same as fetch-smoothcomp.ts)
  const cacheDir = path.join(process.cwd(), ".cache", "smoothcomp");
  await fs.mkdir(cacheDir, { recursive: true });

  for (const event of enabledEvents) {
    const resultsPageUrl = `${event.baseUrl}/en/event/${event.eventId}/results`;
    const getResultsUrl = `${event.baseUrl}/en/event/${event.eventId}/results/getResults`;
    
    console.log(`Fetching: ${resultsPageUrl}`);
    try {
      // 1. Fetch CSRF token and cookies
      const getRes = await fetch(resultsPageUrl);
      const cookies = getRes.headers.getSetCookie ? getRes.headers.getSetCookie().join('; ') : getRes.headers.get("set-cookie");
      const html = await getRes.text();
      const tokenMatch = html.match(/<meta name="csrf-token" content="([^"]+)"/);
      const token = tokenMatch ? tokenMatch[1] : "";

      // 2. Fetch JSON using POST with the extracted tokens
      const response = await fetch(getResultsUrl, {
        method: "POST",
        headers: {
          "cookie": cookies || "",
          "x-csrf-token": token,
          "content-type": "application/json",
          "accept": "application/json"
        }
      });

      if (!response.ok) {
        console.error(`  ✗ HTTP ${response.status} for ${event.slug}`);
        continue;
      }
      const data = await response.json();
      await fs.writeFile(
        path.join(cacheDir, `${event.slug}.json`),
        JSON.stringify(data, null, 2),
        "utf8"
      );
      console.log(`  ✓ Cached ${event.slug}`);
    } catch (err) {
      console.error(`  ✗ Failed to fetch ${event.slug}:`, err);
    }
  }

  // 3. Normalize events
  console.log("\nNormalizing events...");
  const outEventsDir = path.join(process.cwd(), "public", "data", "events");
  await fs.mkdir(outEventsDir, { recursive: true });

  const allNormalized: NormalizedEvent[] = [];
  const eventIndex: { slug: string; name: string; date: string; country: string }[] = [];

  for (const event of enabledEvents) {
    const cachePath = path.join(cacheDir, `${event.slug}.json`);
    try {
      const cacheRaw = await fs.readFile(cachePath, "utf8");
      const cacheData: SmoothcompResultsResponse = JSON.parse(cacheRaw);

      const normalized = normalizeEvent(cacheData, {
        slug: event.slug,
        name: event.name,
        date: new Date().toISOString().split("T")[0],
        country: event.country,
      });

      allNormalized.push(normalized);
      eventIndex.push({
        slug: normalized.slug,
        name: normalized.name,
        date: normalized.date,
        country: normalized.country,
      });

      await fs.writeFile(
        path.join(outEventsDir, `${event.slug}.json`),
        JSON.stringify(normalized, null, 2),
        "utf8"
      );
      console.log(`  ✓ Normalized ${event.slug}`);
    } catch (err) {
      console.error(`  ✗ Failed to normalize ${event.slug}:`, err);
    }
  }

  // 4. Write events index
  await fs.writeFile(
    path.join(outEventsDir, "index.json"),
    JSON.stringify(eventIndex, null, 2),
    "utf8"
  );
  console.log("  ✓ Events index written");

  // 5. Build rankings
  console.log("\nBuilding rankings...");
  const rankings = buildRankings(allNormalized);
  await fs.writeFile(
    path.join(process.cwd(), "public", "data", "rankings.json"),
    JSON.stringify(rankings, null, 2),
    "utf8"
  );
  console.log("  ✓ Rankings written");

  console.log("\n=== Build All: Done ===");
}

main().catch(console.error);
