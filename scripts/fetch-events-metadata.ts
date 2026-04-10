import fs from "node:fs/promises";
import path from "node:path";

async function getCzechEventUrls(): Promise<string[]> {
  const res = await fetch("https://smoothcomp.com/en/events/upcoming");
  if (!res.ok) throw new Error("Failed to fetch events");
  const html = await res.text();
  
  const urls: Set<string> = new Set();
  const blocks = html.split('{"id":');
  
  for (let i = 1; i < blocks.length; i++) {
    const chunk = blocks[i].substring(0, 2000); 
    const urlMatch = chunk.match(/"url":"([^"]+)"/);
    const countryMatch = chunk.match(/"location_country":"([^"]+)"/);
    const humanCountryMatch = chunk.match(/"location_country_human":"([^"]+)"/);
    
    if (urlMatch && (countryMatch || humanCountryMatch)) {
      const eventUrl = urlMatch[1].replace(/\\\//g, '/');
      const country = countryMatch ? countryMatch[1] : "";
      const humanCountry = humanCountryMatch ? humanCountryMatch[1] : "";
      
      if (
        country === "CZ" || 
        humanCountry === "Czech Republic" || 
        humanCountry === "Czechia"
      ) {
        urls.add(eventUrl);
      }
    }
  }
  
  // Explicitně přidáme proběhlé turnaje, které potřebujeme pro interní žebříčky
  const pastEventIds = ["27716", "30095", "28782", "28045", "28098"];
  for (const id of pastEventIds) {
    // AGf and smoothcomp URLs. To be safe, we just use smoothcomp.com base
    urls.add(`https://smoothcomp.com/en/event/${id}`);
  }
  
  return Array.from(urls);
}

async function fetchEventData(url: string) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Extract title
    const titleMatch = html.match(/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    // Extract logo
    const logoMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) 
                   || html.match(/class="event-cover-image"\s+src="([^"]+)"/i);
    let logoUrl = logoMatch ? logoMatch[1] : '';
    
    if (logoUrl.startsWith('/')) {
       const u = new URL(url);
       logoUrl = u.origin + logoUrl;
    }

    // Extract date and location
    const scriptMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    let dateStr = "";
    let location = "";

    if (scriptMatch) {
      try {
        const schema = JSON.parse(scriptMatch[1]);
        if (schema.startDate) dateStr = schema.startDate; // Keep raw ISO string if available for sorting
        if (schema.location && schema.location.address && schema.location.address.addressLocality) {
          location = schema.location.address.addressLocality;
        }
      } catch (e) {
        // ignore
      }
    }

    // Fallback if schema doesn't have it
    if (!location) {
      const locRegex = /<span\s+class="margin-xs-right[^>]*>\s*<span\s+class="icon[^>]*>\s*<\/span>\s*(.*?)\s*<\/span>/gi;
      let matches;
      while ((matches = locRegex.exec(html)) !== null) {
         const t = matches[1].replace(/<[^>]+>/g, '').trim();
         if (t.includes(',') || ['Prague', 'Brno', 'Pardubice', 'Olomouc'].includes(t)) {
             location = t;
             break;
         }
      }
    }

    // Fallback date attempt using regex (rudimentary)
    if (!dateStr) {
      const dateMatch = html.match(/<span class="icon icon-calendar pull-left"><\/span>\s*<span>(.*?)<\/span>/);
      if (dateMatch) {
         dateStr = dateMatch[1].trim(); 
      }
    }

    return { url, name: title || url, logoUrl, parsedDate: dateStr, location };
  } catch (err: any) {
    return { url, name: url, logoUrl: '', parsedDate: '', location: '', error: err.message };
  }
}

async function main() {
  console.log("=== Fetching Smoothcomp detailed metadata for UI ===\n");
  
  let dynamicUrls: string[] = [];
  try {
     dynamicUrls = await getCzechEventUrls();
     console.log(`Discovered ${dynamicUrls.length} Czech events from Smoothcomp upcoming pages.`);
  } catch(e) {
     console.error("Failed to fetch dynamic event urls:", e);
     return;
  }

  const results = [];
  for (const url of dynamicUrls) {
    console.log(`Fetching: ${url}`);
    const data = await fetchEventData(url);
    results.push(data);
    // Add small delay to avoid hitting rate limits too hard
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const outDir = path.join(process.cwd(), "public", "data");
  await fs.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, "events-metadata.json");
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\n✓ Saved ${results.length} events to ${outPath}\n`);
}

main().catch(console.error);
