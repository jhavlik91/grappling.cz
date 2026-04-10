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

async function main() {
  console.log("=== Build All: Starting data pipeline ===\n");

  // 1. Read events config
  const configPath = path.join(process.cwd(), "data", "events-config.json");
  const raw = await fs.readFile(configPath, "utf8");
  const events: EventConfig[] = JSON.parse(raw);
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
