# BJJ Daily Scraper

Jednoduchý "dělňas" projekt v TypeScriptu pro automatizované každodenní stahování BJJ a grappling článků ze zahraničních zdrojů, jejich překlad a strukturování pomocí OpenAI API a uložení do vnitřní filesystémové storage s názvem **Popelína**.

## Předpoklady
- Node.js (v20+)
- npm \`npm install\`

## Instalace

1. Naklonujte / vlezte do repozitáře
2. Nainstalujte závislosti:
   \`\`\`bash
   npm install
   \`\`\`
   *(Playwright se možná bude instalovat automaticky přes npx playwright install chromium - pokud ne, spusťte příkaz manuálně).*
3. Zkopírujte \`.env.example\` do \`.env\` a doplňte klíče:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Doplňte především \`OPENAI_API_KEY\`.

## Popelína struktura

Popelína je interní výstupní prostor pro data v \`./popelina\`:
- \`/raw\` - syrová JSON data rovnou ze scraperu s původním textem (filtrováno od duplicit).
- \`/processed\` - JSON data zpracovaná modelem.
- \`/markdown\` - články v \`.md\` formátu ideální pro následnou publikaci do CMS (s frontmatterem).
- \`processed-articles.json\` - registr, který obsahuje URL a hashe už zpracovaných článků, aby se ty staré nepřekládaly znovu.

## Běh

Projekt má dva hlavní entrypointy:

1. **Daemon s Cronem:** poběží na pozadí jako služba a bude automaticky vyvolávat scrape podle \`SCRAPE_SCHEDULE\` v .env (výchozí \`0 6 * * *\`, tedy každý den v 6 ráno).
   \`\`\`bash
   npm start
   \`\`\`

2. **Jednorázový manuální běh všech webů:**
   \`\`\`bash
   npm run scrape
   \`\`\`

3. **Spuštění pouze konkrétního scraperu:**
   (možnosti: \`flograppling\`, \`jitsmagazine\`, \`grapplinginsider\`, \`bjjee\`, \`bjjheroes\`)
   \`\`\`bash
   npm run scrape -- flograppling
   \`\`\`

## Podporované zdroje

Scraper momentálně podporuje:
- FloGrappling
- Jits Magazine
- Grappling Insider
- BJJ Eastern Europe
- BJJ Heroes
