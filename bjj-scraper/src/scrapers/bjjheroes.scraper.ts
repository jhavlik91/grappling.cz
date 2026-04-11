import { Page } from 'playwright';
import { ScraperModule } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText } from '../utils/normalize';
import { logger } from '../utils/logger';

export const bjjheroesScraper: ScraperModule = {
  sourceName: 'BJJ Heroes',

  async getArticleUrls(page: Page): Promise<string[]> {
    const urls: string[] = [];
    try {
      await page.goto('https://www.bjjheroes.com/bjj-news', { waitUntil: 'domcontentloaded' });
      // BJJ heroes article feed
      const linkLocators = page.locator('h3 a, .post-title a, article a');
      const count = await linkLocators.count();
      
      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href && href.includes('bjjheroes.com')) {
          const fullUrl = href.startsWith('http') ? href : `https://www.bjjheroes.com${href}`;
          if (!urls.includes(fullUrl)) {
            urls.push(fullUrl);
          }
        }
      }
    } catch (e: any) {
      logger.error(`BJJHeroes getArticleUrls error: ${e.message}`);
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
      title = await page.locator('h1').first().innerText();
    } catch {
      title = 'Neznámý titulek';
    }

    try {
      date = await page.locator('.date, time').first().innerText();
    } catch {}

    try {
      author = await page.locator('.author a, .post-author').first().innerText();
    } catch {}

    try {
      content = await page.locator('.entry-content, .post-content').first().innerText();
    } catch {
      try {
        content = await page.locator('article').first().innerText();
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
