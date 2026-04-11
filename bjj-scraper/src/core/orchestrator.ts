import { chromium, Browser, BrowserContext } from 'playwright';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { generateHash } from '../utils/hash';
import { Popelina } from '../storage/popelina';
import { processArticleWithAI } from '../openai/client';

import { flograpplingScraper } from '../scrapers/flograppling.scraper';
import { jitsmagazineScraper } from '../scrapers/jitsmagazine.scraper';
import { grapplinginsiderScraper } from '../scrapers/grapplinginsider.scraper';
import { bjjeeScraper } from '../scrapers/bjjee.scraper';
import { bjjheroesScraper } from '../scrapers/bjjheroes.scraper';

const SCRAPERS = [
  flograpplingScraper,
  jitsmagazineScraper,
  grapplinginsiderScraper,
  bjjeeScraper,
  bjjheroesScraper
];

export async function runScrapingJob(sourceFilter?: string) {
  logger.info(`Starting daily scraping job...${sourceFilter ? ` (Filtering for: ${sourceFilter})` : ''}`);
  
  const popelina = new Popelina();
  await popelina.init();

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  const stats = {
    found: 0,
    new: 0,
    duplicate: 0,
    failed: 0
  };

  try {
    browser = await chromium.launch({ headless: config.HEADLESS });
    context = await browser.newContext();

    for (const scraper of SCRAPERS) {
      if (sourceFilter && sourceFilter.toLowerCase() !== scraper.sourceName.toLowerCase().replace(/\s+/g, '')) {
        continue;
      }
      logger.info(`Running scraper for ${scraper.sourceName}`);
      let page = await context.newPage();
      let urls: string[] = [];
      
      try {
        urls = await scraper.getArticleUrls(page);
      } catch (e: any) {
        logger.error(`Failed to get URLs from ${scraper.sourceName}: ${e.message}`);
        await page.close();
        continue;
      }

      stats.found += urls.length;
      logger.info(`Found ${urls.length} candidate URLs on ${scraper.sourceName}`);

      for (const url of urls) {
        if (popelina.isArticleProcessed(url)) {
          logger.info(`Skipping duplicate URL: ${url}`);
          stats.duplicate++;
          continue;
        }

        try {
          const rawArticle = await scraper.getArticleDetails(page, url);
          const rawContentForHash = `${rawArticle.title}\n${rawArticle.content}`;
          const contentHash = generateHash(rawContentForHash);

          if (popelina.isArticleProcessed(url, contentHash)) {
            logger.info(`Skipping duplicate content by hash: ${url}`);
            stats.duplicate++;
            continue;
          }

          logger.success(`New article found: ${rawArticle.title}`);
          const rawPath = await popelina.saveRaw(rawArticle, contentHash);
          logger.info(`Saved raw to ${rawPath}`);

          if (!config.OPENAI_API_KEY) {
            logger.info('Skipping OpenAI transformation (OPENAI_API_KEY is not set). Article saved as raw only.');
            stats.new++;
            continue;
          }

          logger.info('Calling OpenAI API...');
          const processed = await processArticleWithAI(
            scraper.sourceName,
            rawArticle.url,
            rawArticle.title,
            rawArticle.date,
            rawArticle.author,
            rawArticle.content
          );

          await popelina.saveProcessed(rawArticle, processed, contentHash, scraper.sourceName);
          logger.success('Article processed and saved to Popelina successfully');
          stats.new++;
        } catch (e: any) {
          logger.error(`Error processing article ${url}: ${e.message}`);
          await popelina.recordSkipped(url, e.message);
          stats.failed++;
        }
      }
      
      // Zavřít page pro daný scraper, aby se ušetřila paměť
      await page.close();
    }
  } catch (err: any) {
    logger.error('Critical error in scraping job:', err);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }

  logger.info('=== SCRAPING JOB SUMMARY ===');
  logger.info(`Total candidates found: ${stats.found}`);
  logger.info(`New processed:        ${stats.new}`);
  logger.info(`Duplicates skipped:   ${stats.duplicate}`);
  logger.info(`Failed/Errors:        ${stats.failed}`);
  logger.info('============================');
}
