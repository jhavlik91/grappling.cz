import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { systemPrompt, buildUserPrompt } from './prompts';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const ResultSchema = z.object({
  status: z.literal('processed'),
  cz_title: z.string(),
  summary: z.string(),
  article_markdown: z.string(),
  slug: z.string(),
  tags: z.array(z.string()),
});

type ProcessedOutput = z.infer<typeof ResultSchema> & { source_url: string };

function buildFallback(sourceUrl: string, title: string, text: string): ProcessedOutput {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);

  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/);
  const summary = sentences.slice(0, 3).join(' ').slice(0, 400);

  return {
    status: 'processed',
    cz_title: title,
    summary,
    article_markdown: text,
    slug,
    tags: [],
    source_url: sourceUrl,
  };
}

export async function processArticleWithAI(
  sourceName: string,
  sourceUrl: string,
  title: string,
  date: string | null,
  author: string | null,
  text: string,
  videoEmbedUrl?: string | null
): Promise<ProcessedOutput> {
  const userPrompt = buildUserPrompt(sourceName, sourceUrl, title, date, author, text, videoEmbedUrl);

  // Zkrácení extrémně dlouhých textů (chrání token limit, v normálních článcích nebývá problém)
  const safeText = userPrompt.slice(0, 30000);

  try {
    const response = await openai.chat.completions.create({
      model: config.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content returned from OpenAI');

    const validated = ResultSchema.parse(JSON.parse(content));
    return { ...validated, source_url: sourceUrl };
  } catch (e: any) {
    logger.error(`OpenAI processing failed, using English fallback: ${e.message}`);
    return buildFallback(sourceUrl, title, text);
  }
}
