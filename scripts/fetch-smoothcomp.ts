import fs from "node:fs/promises";
import path from "node:path";

type EventConfig = {
  eventId: number;
  slug: string;
  name: string;
  country: string;
  enabled: boolean;
  baseUrl: string;
};

async function main() {
  const configPath = path.join(process.cwd(), "data", "events-config.json");
  const raw = await fs.readFile(configPath, "utf8");
  const events: EventConfig[] = JSON.parse(raw);

  const enabledEvents = events.filter((event) => event.enabled);

  const outDir = path.join(process.cwd(), ".cache", "smoothcomp");
  await fs.mkdir(outDir, { recursive: true });

  for (const event of enabledEvents) {
    const url = `${event.baseUrl}/en/event/${event.eventId}/results/getResults`;
    console.log(`Fetching: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  ✗ HTTP ${response.status} for ${event.slug}`);
        continue;
      }
      const data = await response.json();
      const outPath = path.join(outDir, `${event.slug}.json`);
      await fs.writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`  ✓ Saved to ${outPath}`);
    } catch (err) {
      console.error(`  ✗ Failed to fetch ${event.slug}:`, err);
    }
  }

  console.log("Done fetching Smoothcomp data.");
}

main().catch(console.error);
