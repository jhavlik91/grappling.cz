/**
 * importRaw.ts — převede raw JSON soubory z popelina/raw/ do content/articles/
 * bez OpenAI. Použij pro rychlé naplnění webu obsahem.
 *
 * Spuštění: npx ts-node src/importRaw.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { RawArticle } from './types/article';

const RAW_DIR = path.join(__dirname, '..', 'popelina', 'raw');
const OUT_DIR = path.join(__dirname, '..', '..', 'content', 'articles');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function extractDate(raw: RawArticle): string {
  if (raw.date) {
    const d = new Date(raw.date);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    // Pokus parsovat "APR 15, 2026" a podobné formáty
    const match = raw.date.match(/([A-Z]{3})\s+(\d+),?\s+(\d{4})/i);
    if (match) {
      const d2 = new Date(`${match[1]} ${match[2]} ${match[3]}`);
      if (!isNaN(d2.getTime())) return d2.toISOString().split('T')[0];
    }
  }
  return new Date().toISOString().split('T')[0];
}

function cleanContent(content: string, title: string): string {
  // Najdi místo kde začíná skutečný artikel (za titulkem v textu)
  const titleIdx = content.indexOf(title);
  if (titleIdx !== -1) {
    content = content.slice(titleIdx + title.length).trim();
  }

  // Odstraň sekce "RELATED ARTICLES", "RECENT POSTS", navigaci
  const cutMarkers = [
    'RELATED ARTICLES',
    'RECENT POSTS',
    'CATEGORIES',
    'Share Save',
    'This website uses cookies',
    'Login ©',
    'All rights reserved',
  ];
  for (const marker of cutMarkers) {
    const idx = content.indexOf(marker);
    if (idx !== -1) {
      content = content.slice(0, idx);
    }
  }

  // Ořež bílé znaky
  return content.trim();
}

function makeExcerpt(content: string): string {
  return content.replace(/\n+/g, ' ').trim().slice(0, 160);
}

function detectSource(url: string): string {
  if (url.includes('bjjee.com')) return 'BJJ Eastern Europe';
  if (url.includes('flograppling.com')) return 'FloGrappling';
  if (url.includes('jitsmagazine.com')) return 'Jits Magazine';
  if (url.includes('grapplinginsider.com')) return 'Grappling Insider';
  if (url.includes('bjjheroes.com')) return 'BJJ Heroes';
  return 'Zahraničí';
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await fs.readdir(RAW_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  console.log(`Nalezeno ${jsonFiles.length} raw souborů.`);

  // Zjistíme existující slugy v content/articles/
  const existingFiles = await fs.readdir(OUT_DIR).catch(() => [] as string[]);
  const existingSlugs = new Set(
    existingFiles.map(f => f.replace(/\.(mdx|md)$/, ''))
  );

  let created = 0;
  let skipped = 0;

  for (const file of jsonFiles) {
    const raw: RawArticle = JSON.parse(
      await fs.readFile(path.join(RAW_DIR, file), 'utf8')
    );

    const date = extractDate(raw);
    const slugBase = slugify(raw.title);
    const slug = `${date}-${slugBase}`;

    if (existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    const cleanedContent = cleanContent(raw.content, raw.title);
    const excerpt = makeExcerpt(cleanedContent);
    const source = detectSource(raw.url);

    const imageField = raw.image_url ? `\nimage: "${raw.image_url}"` : '';
    const authorField = raw.author ? `\nauthor: "${raw.author}"` : '';

    const mdContent = `---
title: "${raw.title.replace(/"/g, '\\"')}"
date: "${date}"
source: "${source}"
original_url: "${raw.url}"
excerpt: "${excerpt.replace(/"/g, '\\"')}"
type: "zahranuci"${imageField}${authorField}
---

# ${raw.title}

${cleanedContent}
`.trim() + '\n';

    await fs.writeFile(path.join(OUT_DIR, `${slug}.md`), mdContent, 'utf8');
    existingSlugs.add(slug);
    created++;
    console.log(`✓ ${slug}`);
  }

  console.log(`\nHotovo: ${created} vytvořeno, ${skipped} přeskočeno (duplicity).`);
}

main().catch(err => {
  console.error('Chyba:', err);
  process.exit(1);
});
