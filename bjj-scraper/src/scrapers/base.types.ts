import { Page } from 'playwright';
import { RawArticle } from '../types/article';

export interface ScraperModule {
  sourceName: string;
  
  /**
   * Získá seznam kandidátních URL pro daný web
   */
  getArticleUrls(page: Page): Promise<string[]>;
  
  /**
   * Získá detail článku z dané URL
   */
  getArticleDetails(page: Page, url: string): Promise<RawArticle>;
}
