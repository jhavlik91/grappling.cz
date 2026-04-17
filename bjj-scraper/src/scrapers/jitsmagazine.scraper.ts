import { Page } from 'playwright';
import { ScraperModule, ArticleCandidate } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText, extractVideoEmbed } from '../utils/normalize';
import { logger } from '../utils/logger';

export const jitsmagazineScraper: ScraperModule = {
  sourceName: 'Jits Magazine',

  async getArticleUrls(page: Page): Promise<ArticleCandidate[]> {
    const candidates: ArticleCandidate[] = [];
    try {
      await page.goto('https://jitsmagazine.com/', { waitUntil: 'domcontentloaded' });
      const linkLocators = page.locator('h3 a, .entry-title a, article a');
      const count = await linkLocators.count();

      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (
          href &&
          href.includes('jitsmagazine.com/') &&
          !href.includes('/category/') &&
          !href.includes('/author/') &&
          !href.includes('/tag/') &&
          !href.includes('?') &&
          !href.includes('#') &&
          href !== 'https://jitsmagazine.com/' &&
          href !== 'https://jitsmagazine.com'
        ) {
          if (!candidates.some(c => c.url === href)) {
            candidates.push({ url: href });
          }
        }
      }
    } catch (e: any) {
      logger.error(`JitsMagazine getArticleUrls error: ${e.message}`);
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
      title = await page.locator('h1.entry-title, h1.jeg_post_title').first().innerText();
    } catch {
      title = 'Neznámý titulek';
    }

    try {
      date = await page.locator('time.published, .entry-date, .jeg_meta_date a, .jeg_meta_date time').first().getAttribute('datetime') 
          || await page.locator('time.published, .entry-date, .jeg_meta_date a, .jeg_meta_date time').first().innerText();
    } catch {
      // fallback
    }

    try {
      author = await page.locator('.author.vcard a, .fn, .jeg_meta_author a, .jeg_author_name a').first().innerText();
    } catch {
      // fallback
    }

    try {
      content = await page.locator('.entry-content, .jeg_post_content').first().innerText();
    } catch {
      content = await page.locator('article').first().innerText();
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
      author: author ? cleanText(author) : null,
      content: cleanText(content),
      image_url,
      video_embed_url
    };
  }
};
