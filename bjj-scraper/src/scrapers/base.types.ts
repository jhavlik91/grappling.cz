import { Page } from 'playwright';
import { RawArticle } from '../types/article';

export interface ArticleCandidate {
  url: string;
  /** ISO date string or human-readable date from listing page, if available */
  date?: string | null;
}

export interface ScraperModule {
  sourceName: string;

  /**
   * Získá seznam kandidátních URL (a volitelně datumů) pro daný web
   */
  getArticleUrls(page: Page): Promise<ArticleCandidate[]>;

  /**
   * Získá detail článku z dané URL
   */
  getArticleDetails(page: Page, url: string): Promise<RawArticle>;
}
