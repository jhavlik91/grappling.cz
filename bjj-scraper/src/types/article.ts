export interface RawArticle {
  title: string;
  url: string;
  date: string | null;
  author: string | null;
  content: string;
  image_url: string | null;
  video_embed_url: string | null;
}

export interface ProcessedArticle {
  status: 'processed';
  cz_title: string;
  summary: string;
  article_markdown: string;
  slug: string;
  tags: string[];
  source_url: string;
}

/**
 * A processed article enriched with the publishing metadata carried over from
 * the raw article. This is what gets written to popelina/processed/*.json and
 * consumed by src/publish.ts to render the site article.
 */
export interface ProcessedRecord extends ProcessedArticle {
  source: string;
  date: string;
  author: string | null;
  image_url: string | null;
  video_embed_url: string | null;
}

export interface PopelinaRegistryEntry {
  source_url: string;
  content_hash: string;
  status: 'processed' | 'skipped' | 'failed';
  processed_at: string;
  reason?: string;
}
