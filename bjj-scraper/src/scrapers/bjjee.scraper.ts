import { Page } from 'playwright';
import { ScraperModule } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText } from '../utils/normalize';
import { logger } from '../utils/logger';

export const bjjeeScraper: ScraperModule = {
  sourceName: 'BJJ Eastern Europe',

  async getArticleUrls(page: Page): Promise<string[]> {
    const urls: string[] = [];
    try {
      await page.goto('https://www.bjjee.com/', { waitUntil: 'domcontentloaded' });
      // Hlavní články na BJJEE
      const linkLocators = page.locator('h3 a, h2 a, .td-module-title a');
      const count = await linkLocators.count();
      
      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href && href.startsWith('https://www.bjjee.com/')) {
          if (!urls.includes(href)) {
            urls.push(href);
          }
        }
      }
    } catch (e: any) {
      logger.error(`BJJEE getArticleUrls error: ${e.message}`);
    }
    return urls;
  },

  async getArticleDetails(page: Page, url: string): Promise<RawArticle> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    let title = '';
    let author = null;
    let date = null;
    let content = '';

    try {
      title = await page.locator('h1.entry-title, h1.tdb-title-text').first().innerText();
    } catch {
      title = 'Neznámý titulek';
    }

    try {
      date = await page.locator('time').first().getAttribute('datetime') 
          || await page.locator('.td-post-date time').first().innerText();
    } catch {}

    try {
      author = await page.locator('.td-post-author-name a').first().innerText();
    } catch {}

    try {
      content = await page.locator('.td-post-content, .tdb_single_content .tdb-block-inner').first().innerText();
    } catch {
      try {
        content = await page.locator('.entry-content, article').first().innerText();
      } catch {
        content = await page.locator('body').innerText();
      }
    }

    return {
      title: cleanText(title),
      url,
      date: date ? date.trim() : null,
      author: author ? cleanText(author) : null,
      content: cleanText(content)
    };
  }
};
