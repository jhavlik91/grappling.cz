/**
 * publish.ts — publikuje přeložené (Gemini) články z popelina/processed/*.json
 * do content/articles/*.md, který renderuje web.
 *
 * Na rozdíl od importRaw.ts (syrová angličtina) tohle bere už zpracovaný český
 * výstup a mapuje ho na frontmatter schéma webu (title, date, source,
 * original_url, excerpt, type, image, author).
 *
 * Spuštění: npm run publish
 */

import fs from 'fs/promises';
import path from 'path';
import { ProcessedRecord } from './types/article';
import { config } from './config/env';

const PROCESSED_DIR = path.join(config.POPELINA_DIR, 'processed');
const OUT_DIR = path.join(__dirname, '..', '..', 'content', 'articles');

function normalizeDate(input: string): string {
  const d = new Date(input);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  // "APR 15, 2026" a podobné
  const match = input.match(/([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) {
    const d2 = new Date(`${match[1]} ${match[2]} ${match[3]}`);
    if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

/** Jednořádkový očištěný excerpt do frontmatteru (uvozovky escapované). */
function toExcerpt(summary: string): string {
  return summary.replace(/\s+/g, ' ').trim().slice(0, 200).replace(/"/g, '\\"');
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  let processedFiles: string[];
  try {
    processedFiles = (await fs.readdir(PROCESSED_DIR)).filter(f => f.endsWith('.json'));
  } catch {
    console.log(`Nenalezen adresář ${PROCESSED_DIR} — nejdřív spusť scrape (npm run scrape).`);
    return;
  }

  console.log(`Nalezeno ${processedFiles.length} zpracovaných článků.`);

  const existing = await fs.readdir(OUT_DIR).catch(() => [] as string[]);
  const existingSlugs = new Set(existing.map(f => f.replace(/\.(mdx|md)$/, '')));

  let created = 0;
  let skipped = 0;

  for (const file of processedFiles) {
    const slug = file.replace(/\.json$/, '');
    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const record: ProcessedRecord = JSON.parse(
      await fs.readFile(path.join(PROCESSED_DIR, file), 'utf8')
    );

    const date = normalizeDate(record.date);
    const imageField = record.image_url ? `\nimage: "${record.image_url}"` : '';
    const authorField = record.author ? `\nauthor: "${record.author.replace(/"/g, '\\"')}"` : '';
    const tagsField = record.tags?.length ? `\ntags: ${JSON.stringify(record.tags)}` : '';

    const md = `---
title: "${record.cz_title.replace(/"/g, '\\"')}"
date: "${date}"
source: "${record.source}"
original_url: "${record.source_url}"
excerpt: "${toExcerpt(record.summary)}"
type: "zahranicni"${imageField}${authorField}${tagsField}
---

${record.article_markdown.trim()}
`;

    await fs.writeFile(path.join(OUT_DIR, `${slug}.md`), md, 'utf8');
    existingSlugs.add(slug);
    created++;
    console.log(`✓ ${slug}`);
  }

  console.log(`\nHotovo: ${created} publikováno, ${skipped} přeskočeno (duplicity).`);
}

main().catch(err => {
  console.error('Chyba při publikaci:', err);
  process.exit(1);
});
