import { Page } from 'playwright';
import { ScraperModule } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText } from '../utils/normalize';
import { logger } from '../utils/logger';

export const jitsmagazineScraper: ScraperModule = {
  sourceName: 'Jits Magazine',

  async getArticleUrls(page: Page): Promise<string[]> {
    const urls: string[] = [];
    try {
      await page.goto('https://jitsmagazine.com/', { waitUntil: 'domcontentloaded' });
      // Odchytáváme odkazy v hlavním feedu článků
      const linkLocators = page.locator('h3 a, .entry-title a, article a');
      const count = await linkLocators.count();
      
      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href && href.includes('jitsmagazine.com/')) {
          if (!urls.includes(href)) {
            urls.push(href);
          }
        }
      }
    } catch (e: any) {
      logger.error(`JitsMagazine getArticleUrls error: ${e.message}`);
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
      title = await page.locator('h1.entry-title').first().innerText();
    } catch {
      title = 'Neznámý titulek';
    }

    try {
      date = await page.locator('time.published, .entry-date').first().getAttribute('datetime') 
          || await page.locator('.entry-date').first().innerText();
    } catch {
      // fallback
    }

    try {
      author = await page.locator('.author.vcard a, .fn').first().innerText();
    } catch {
      // fallback
    }

    try {
      content = await page.locator('.entry-content').first().innerText();
    } catch {
      content = await page.locator('article').first().innerText();
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
