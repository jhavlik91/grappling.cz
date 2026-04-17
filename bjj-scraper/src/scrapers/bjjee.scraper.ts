import { Page } from 'playwright';
import { ScraperModule, ArticleCandidate } from './base.types';
import { RawArticle } from '../types/article';
import { cleanText, extractVideoEmbed } from '../utils/normalize';
import { logger } from '../utils/logger';

export const bjjeeScraper: ScraperModule = {
  sourceName: 'BJJ Eastern Europe',

  async getArticleUrls(page: Page): Promise<ArticleCandidate[]> {
    const candidates: ArticleCandidate[] = [];
    try {
      await page.goto('https://www.bjjee.com/', { waitUntil: 'domcontentloaded' });
      const linkLocators = page.locator('h3 a, h2 a, .td-module-title a');
      const count = await linkLocators.count();

      for (let i = 0; i < count; i++) {
        const href = await linkLocators.nth(i).getAttribute('href');
        if (href && href.startsWith('https://www.bjjee.com/')) {
          if (!candidates.some(c => c.url === href)) {
            candidates.push({ url: href });
          }
        }
      }
    } catch (e: any) {
      logger.error(`BJJEE getArticleUrls error: ${e.message}`);
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
      title = await page.locator('h1.entry-title, h1.tdb-title-text, h1.post-title, .post-title').first().innerText();
    } catch {
      title = 'Neznámý titulek';
    }

    try {
      date = await page.evaluate(() => {
        const meta = document.querySelector<HTMLMetaElement>('meta[property="article:published_time"]');
        if (meta?.content) return meta.content;
        const time = document.querySelector<HTMLTimeElement>('time[datetime]');
        if (time?.dateTime) return time.dateTime;
        return null;
      });
    } catch {}

    try {
      author = await page.locator('.td-post-author-name a, .author-name a, .vcard a, span.meta-author a').first().innerText();
    } catch {}

    // Strip known noise from DOM before extracting content
    await page.evaluate(() => {
      const noiseSelectors = [
        'header', 'nav', 'footer', 'aside',
        '.td-sidebar', '.td-sidebar-content',
        '.td-post-sharing-row', '.td-post-sharing-top',
        '.td-related-posts', '.td-block-title-wrap',
        '.td-next-prev-wrap', '.td-tags-and-cats',
        '.td-crumb-container',
        '.tdb-pagination',
        // Inline ad/promo widgets (e-book banners etc.)
        '.tdb-ads', '.wp-ad-camp', '.ezoic-ad',
        '[class*="ezoic"]', '[id*="ezoic"]',
        '.td_block_related_posts', '.td_block_15',
        // "Recent Posts" / "Categories" sidebars injected into article area
        '.td-pb-row:has(.td-block-title)',
      ];
      noiseSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    });

    try {
      content = await page.locator('.td-post-content, .tdb_single_content .tdb-block-inner, .post-content, .entry-content').first().innerText();
    } catch {
      try {
        content = await page.locator('article').first().innerText();
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
      author: author ? cleanText(author) : null,
      content: cleanText(content),
      image_url,
      video_embed_url
    };
  }
};
