import { Page } from 'playwright';
import { ScraperModule, ArticleCandidate } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText, extractVideoEmbed } from '../utils/normalize';
import { logger } from '../utils/logger';

export const flograpplingScraper: ScraperModule = {
  sourceName: 'FloGrappling',

  async getArticleUrls(page: Page): Promise<ArticleCandidate[]> {
    const candidates: ArticleCandidate[] = [];
    try {
      await page.goto('https://www.flograppling.com/articles', { waitUntil: 'domcontentloaded' });
      const linkLocators = page.locator('a[href*="/articles/"]');
      const count = await linkLocators.count();

      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `https://www.flograppling.com${href}`;
          if (!candidates.some(c => c.url === fullUrl)) {
            candidates.push({ url: fullUrl });
          }
        }
      }
    } catch (e: any) {
      logger.error(`FloGrappling getArticleUrls error: ${e.message}`);
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
      const dateLocators = page.locator('time, [class*="date"], .published, div.text-sm:has-text("202")');
      if (await dateLocators.count() > 0) {
        date = await dateLocators.first().getAttribute('datetime') || await dateLocators.first().innerText();
      }
    } catch {}

    try {
      const authorLocators = page.locator('.author-name, .article-author, [rel="author"], [class*="author"]');
      if (await authorLocators.count() > 0) {
        author = await authorLocators.first().innerText();
      }
    } catch {}

    try {
      content = await page.locator('article, .article-content, .content, main').first().innerText();
    } catch {
      content = await page.locator('body').innerText();
    }

    // Fallback regex for "Apr 8, 2026 by Joe Gilpin" that appears in the first lines of content
    if (!date || !author) {
      const match = content.match(/([A-Z][a-z]{2,8}\s\d{1,2},\s\d{4})\s+by\s+([A-Za-z.\s]+)/i);
      if (match) {
        if (!date) date = match[1].trim();
        if (!author) {
          // Omezíme to na max 3-4 slova, aby to nevzalo úvod další věty (např. "Carlos Arthur Jr. Neste mês")
          author = match[2].trim().split(' ').slice(0, 3).join(' ').replace(/( \w[a-z]{4,}.*)/, '').replace(/[^a-zA-Z.\s-]/g, '').trim();
        }
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
      author: author ? cleanText(author) : null,
      content: cleanText(content),
      image_url,
      video_embed_url
    };
  }
};
