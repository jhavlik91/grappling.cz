import { Page } from 'playwright';
import { ScraperModule, ArticleCandidate } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText, extractVideoEmbed } from '../utils/normalize';
import { logger } from '../utils/logger';

export const grapplinginsiderScraper: ScraperModule = {
  sourceName: 'Grappling Insider',

  async getArticleUrls(page: Page): Promise<ArticleCandidate[]> {
    const candidates: ArticleCandidate[] = [];
    try {
      await page.goto('https://grapplinginsider.com/', { waitUntil: 'domcontentloaded' });
      const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h2 a')).map(a => {
          const article = (a as HTMLElement).closest('article') || (a as HTMLElement).parentElement?.parentElement;
          const time = article?.querySelector('time');
          return {
            url: (a as HTMLAnchorElement).href,
            date: time?.getAttribute('datetime') ?? null,
          };
        });
      });
      for (const { url, date } of results) {
        if (url.startsWith('https://grapplinginsider.com/') && !candidates.some(c => c.url === url)) {
          candidates.push({ url, date });
        }
      }
    } catch (e: any) {
      logger.error(`GrapplingInsider getArticleUrls error: ${e.message}`);
    }
    return candidates;
  },

  async getArticleDetails(page: Page, url: string): Promise<RawArticle> {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    let title = '';
    let author = null;
    let date = null;
    let content = '';
    let image_url: string | null = null;

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

    image_url = await page.evaluate(() => {
      const el = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      return el?.content ?? null;
    });

    const video_embed_url = await extractVideoEmbed(page);

    return {
      title: cleanText(title),
      url,
      date: date ? date.trim() : null,
      author: author ? cleanText(author.replace('By', '').trim()) : null,
      content: cleanText(content),
      image_url,
      video_embed_url
    };
  }
};
