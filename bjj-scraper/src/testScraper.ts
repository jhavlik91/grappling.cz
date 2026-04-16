import { chromium } from 'playwright';
import { bjjeeScraper } from './scrapers/bjjee.scraper';
import { jitsmagazineScraper } from './scrapers/jitsmagazine.scraper';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- Testing BJJEE ---');
  const urlBjjee = 'https://www.bjjee.com/articles/nicholas-meregali-john-danaher-is-the-greatest-jiu-jitsu-coach-in-history-even-beyond-helio-gracie/';
  try {
    const detailsBjjee = await bjjeeScraper.getArticleDetails(page, urlBjjee);
    console.log('BJJEE Result:', JSON.stringify(detailsBjjee, null, 2));
  } catch (e: any) {
    console.error('BJJEE Error:', e.message);
  }

  console.log('\n--- Testing Jits Magazine ---');
  const urlJits = 'https://jitsmagazine.com/dante-leon-seals-win-over-kenta-iwamoto-in-last-seconds-at-one-fight-night-42/';
  try {
    const detailsJits = await jitsmagazineScraper.getArticleDetails(page, urlJits);
    console.log('Jits Result:', JSON.stringify(detailsJits, null, 2));
  } catch (e: any) {
    console.error('Jits Error:', e.message);
  }

  await browser.close();
}

test();
