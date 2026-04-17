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

export interface PopelinaRegistryEntry {
  source_url: string;
  content_hash: string;
  status: 'processed' | 'skipped' | 'failed';
  processed_at: string;
  reason?: string;
}
