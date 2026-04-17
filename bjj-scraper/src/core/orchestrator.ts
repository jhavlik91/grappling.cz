import { chromium, Browser, BrowserContext } from 'playwright';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { generateHash } from '../utils/hash';
import { Popelina } from '../storage/popelina';
import { processArticleWithAI } from '../openai/client';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_CANDIDATES = config.MAX_CANDIDATES;
const SCRAPE_DELAY_MS = config.SCRAPE_DELAY_MS;

function parseArticleDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

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
  const cutoffDate = config.DAYS_BACK > 0
    ? new Date(Date.now() - config.DAYS_BACK * 24 * 60 * 60 * 1000)
    : null;

  logger.info(`Starting daily scraping job...${sourceFilter ? ` (Filtering for: ${sourceFilter})` : ''}${cutoffDate ? ` (articles newer than ${cutoffDate.toISOString().split('T')[0]})` : ''}`);
  
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
      let candidates: import('../scrapers/base.types').ArticleCandidate[] = [];

      try {
        candidates = await scraper.getArticleUrls(page);
      } catch (e: any) {
        logger.error(`Failed to get URLs from ${scraper.sourceName}: ${e.message}`);
        await page.close();
        continue;
      }

      // Listing pages are newest-first — cap to avoid loading dozens of old articles
      if (candidates.length > MAX_CANDIDATES) {
        logger.info(`Capping ${candidates.length} candidates to ${MAX_CANDIDATES} for ${scraper.sourceName}`);
        candidates = candidates.slice(0, MAX_CANDIDATES);
      }

      stats.found += candidates.length;
      logger.info(`Found ${candidates.length} candidate URLs on ${scraper.sourceName}`);

      for (const candidate of candidates) {
        const url = candidate.url;

        // Early date filter — if the listing page already provided a date, skip before loading the article
        if (cutoffDate && candidate.date) {
          const earlyDate = parseArticleDate(candidate.date);
          if (earlyDate && earlyDate < cutoffDate) {
            logger.info(`Skipping old article (${candidate.date}): ${url}`);
            stats.duplicate++;
            continue;
          }
        }

        if (popelina.isArticleProcessed(url)) {
          logger.info(`Skipping duplicate URL: ${url}`);
          stats.duplicate++;
          continue;
        }

        try {
          await sleep(SCRAPE_DELAY_MS);
          const rawArticle = await scraper.getArticleDetails(page, url);
          const rawContentForHash = `${rawArticle.title}\n${rawArticle.content}`;
          const contentHash = generateHash(rawContentForHash);

          if (popelina.isArticleProcessed(url, contentHash)) {
            logger.info(`Skipping duplicate content by hash: ${url}`);
            stats.duplicate++;
            continue;
          }

          if (cutoffDate) {
            const articleDate = parseArticleDate(rawArticle.date);
            if (articleDate && articleDate < cutoffDate) {
              logger.info(`Skipping old article (${rawArticle.date}): ${url}`);
              stats.duplicate++;
              continue;
            }
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
            rawArticle.content,
            rawArticle.video_embed_url
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
