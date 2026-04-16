import fs from 'fs/promises';
import path from 'path';
import { RawArticle, ProcessedArticle, PopelinaRegistryEntry } from '../types/article';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class Popelina {
  private baseDir: string;
  private rawDir: string;
  private processedDir: string;
  private markdownDir: string;
  private registryFile: string;

  private registry: PopelinaRegistryEntry[] = [];

  constructor() {
    this.baseDir = config.POPELINA_DIR;
    this.rawDir = path.join(this.baseDir, 'raw');
    this.processedDir = path.join(this.baseDir, 'processed');
    this.markdownDir = path.join(this.baseDir, 'markdown');
    this.registryFile = path.join(this.baseDir, 'processed-articles.json');
  }

  async init() {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(this.rawDir, { recursive: true });
    await fs.mkdir(this.processedDir, { recursive: true });
    await fs.mkdir(this.markdownDir, { recursive: true });

    try {
      const data = await fs.readFile(this.registryFile, 'utf8');
      this.registry = JSON.parse(data);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await this.saveRegistry();
      } else {
        // Corrupted registry (e.g. killed mid-write) — back it up and start fresh
        // to avoid re-processing all articles as new on the next run
        logger.error('Failed to load registry, backing up and reinitializing:', e);
        try {
          await fs.rename(this.registryFile, this.registryFile + '.bak');
        } catch {}
        this.registry = [];
        await this.saveRegistry();
      }
    }
  }

  getRegistry(): PopelinaRegistryEntry[] {
    return this.registry;
  }

  isArticleProcessed(url: string, contentHash?: string): boolean {
    return this.registry.some(entry => {
      if (entry.source_url === url && entry.status === 'processed') return true;
      if (contentHash && entry.content_hash === contentHash && entry.status === 'processed') return true;
      return false;
    });
  }


  async saveRaw(article: RawArticle, contentHash: string): Promise<string> {
    const filename = `${contentHash}.json`;
    const filepath = path.join(this.rawDir, filename);
    await fs.writeFile(filepath, JSON.stringify(article, null, 2), 'utf8');
    return filepath;
  }

  async saveProcessed(rawArticle: RawArticle, processedArticle: ProcessedArticle, contentHash: string, sourceName: string) {
    const today = new Date().toISOString().split('T')[0];
    const filenameBase = `${today}-${processedArticle.slug}`;

    // 1. Save JSON
    const jsonPath = path.join(this.processedDir, `${filenameBase}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(processedArticle, null, 2), 'utf8');

    // 2. Save Markdown
    const mdPath = path.join(this.markdownDir, `${filenameBase}.md`);
    const dateStr = rawArticle.date || today;
    const authorStr = rawArticle.author ? ` (Author: ${rawArticle.author})` : '';

    const imageStr = rawArticle.image_url ? `\nimage: "${rawArticle.image_url}"` : '';
    const videoStr = rawArticle.video_embed_url ? `\nvideo_embed_url: "${rawArticle.video_embed_url}"` : '';
    const mdContent = `---
title: "${processedArticle.cz_title.replace(/"/g, '\\"')}"
date: "${dateStr}"
source: "${sourceName}"
source_url: "${processedArticle.source_url}"
tags: ${JSON.stringify(processedArticle.tags)}
slug: "${processedArticle.slug}"${imageStr}${videoStr}
---

Shrnutí

${processedArticle.summary}

Článek

${processedArticle.article_markdown}

Zdroj

Zpracováno podle zahraničního zdroje: ${sourceName}${authorStr}
`;
    await fs.writeFile(mdPath, mdContent.trim() + '\n', 'utf8');

    // 3. Update Registry
    this.registry.push({
      source_url: processedArticle.source_url,
      content_hash: contentHash,
      status: 'processed',
      processed_at: new Date().toISOString()
    });
    await this.saveRegistry();
  }

  async recordSkipped(url: string, reason: string) {
    logger.info(`Article skipped [${reason}]: ${url}`);
    this.registry.push({
      source_url: url,
      content_hash: '',
      status: 'skipped',
      processed_at: new Date().toISOString()
    });
    await this.saveRegistry();
  }

  private async saveRegistry() {
    await fs.writeFile(this.registryFile, JSON.stringify(this.registry, null, 2), 'utf8');
  }
}
