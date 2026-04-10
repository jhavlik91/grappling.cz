import * as fs from 'fs';

async function getCzechEventUrls(): Promise<string[]> {
  const res = await fetch("https://smoothcomp.com/en/events/upcoming");
  const html = await res.text();
  
  const urls: Set<string> = new Set();
  
  // Split by common prefix of event objects to process them one by one.
  const blocks = html.split('{"id":');
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Process a reasonable chunk of text to avoid cross-object matching
    const chunk = block.substring(0, 2000); 
    
    const urlMatch = chunk.match(/"url":"([^"]+)"/);
    const countryMatch = chunk.match(/"location_country":"([^"]+)"/);
    const humanCountryMatch = chunk.match(/"location_country_human":"([^"]+)"/);
    
    if (urlMatch && (countryMatch || humanCountryMatch)) {
      // Fix escaped slashes in the URL
      const url = urlMatch[1].replace(/\\\//g, '/');
      const country = countryMatch ? countryMatch[1] : "";
      const humanCountry = humanCountryMatch ? humanCountryMatch[1] : "";
      
      if (
        country === "CZ" || 
        humanCountry === "Czech Republic" || 
        humanCountry === "Czechia"
      ) {
        urls.add(url);
      }
    }
  }
  
  return Array.from(urls);
}

async function main() {
  const t0 = Date.now();
  const urls = await getCzechEventUrls();
  console.log(`Found ${urls.length} events in ${Date.now() - t0}ms:`);
  urls.forEach(u => console.log(u));
}

main().catch(console.error);
