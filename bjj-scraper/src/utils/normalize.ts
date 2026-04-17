export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

export function cleanText(text: string): string {
  // Remove known common ad texts or generic strings if needed,
  // for now just basic normalization
  return normalizeWhitespace(text);
}

import { Page } from 'playwright';

/**
 * Extracts the first YouTube or Vimeo embed URL found on the page.
 * Returns null if no video embed is present.
 */
export async function extractVideoEmbed(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const iframe of iframes) {
      const src = iframe.src || iframe.getAttribute('src') || '';
      if (
        src.includes('youtube.com/embed/') ||
        src.includes('youtube-nocookie.com/embed/') ||
        src.includes('player.vimeo.com/video/')
      ) {
        return src;
      }
    }
    return null;
  });
}
