import { Page } from 'playwright';
import { ScraperModule } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText } from '../utils/normalize';
import { logger } from '../utils/logger';

export const grapplinginsiderScraper: ScraperModule = {
  sourceName: 'Grappling Insider',

  async getArticleUrls(page: Page): Promise<string[]> {
    const urls: string[] = [];
    try {
      await page.goto('https://grapplinginsider.com/', { waitUntil: 'domcontentloaded' });
      const linkLocators = page.locator('h3.entry-title a, article a.elementor-post__read-more');
      const count = await linkLocators.count();
      
      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href && href.startsWith('https://grapplinginsider.com/')) {
          if (!urls.includes(href)) {
            urls.push(href);
          }
        }
      }
    } catch (e: any) {
      logger.error(`GrapplingInsider getArticleUrls error: ${e.message}`);
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
      date = await page.locator('time').first().getAttribute('datetime') 
          || await page.locator('.elementor-post-info__item--type-date').first().innerText();
    } catch {}

    try {
      author = await page.locator('.elementor-post-info__item--type-author').first().innerText();
    } catch {}

    try {
      content = await page.locator('.elementor-widget-theme-post-content').first().innerText();
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
      author: author ? cleanText(author.replace('By', '').trim()) : null,
      content: cleanText(content)
    };
  }
};
