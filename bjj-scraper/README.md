# BJJ Daily Scraper

Jednoduchý "dělňas" projekt v TypeScriptu pro automatizované každodenní stahování BJJ a grappling článků ze zahraničních zdrojů, jejich překlad a strukturování pomocí **Gemini API** (model `gemini-2.5-flash-lite`) a uložení do vnitřní filesystémové storage s názvem **Popelína**.

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
   Doplňte především \`GEMINI_API_KEY\` (klíč získáte zdarma v [Google AI Studio](https://aistudio.google.com/apikey)). Model lze přepnout přes \`GEMINI_MODEL\` (výchozí \`gemini-2.5-flash-lite\` na free-tier).

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

## Publikace na web

Scrape uloží přeložené články do `popelina/processed/`. Publikační krok je přenese do `../content/articles/*.md` ve formátu, který renderuje web (frontmatter `title`, `date`, `source`, `original_url`, `excerpt`, `type`, `image`, `author`):

```bash
npm run publish
```

Krok je idempotentní (už existující slugy přeskakuje). Markdown nadpisy (`##`) a token `[VIDEO:url]` v těle se na webu vykreslí jako nadpis / vložené video.

> Pozn.: `npm run import-raw` dělá totéž ze syrových (nepřeložených) dat v `popelina/raw/` — slouží jen pro rychlé naplnění webu bez Gemini.

## Podporované zdroje

Scraper momentálně podporuje:
- FloGrappling
- Jits Magazine
- Grappling Insider
- BJJ Eastern Europe
- BJJ Heroes
