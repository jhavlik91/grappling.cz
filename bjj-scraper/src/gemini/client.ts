import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { systemPrompt, buildUserPrompt } from './prompts';

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

// Gemini emits the five content fields; `status` and `source_url` are added by us.
const ResultSchema = z.object({
  cz_title: z.string(),
  summary: z.string(),
  article_markdown: z.string(),
  slug: z.string(),
  tags: z.array(z.string()),
});

// Structured-output contract handed to Gemini (responseSchema).
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    cz_title: { type: Type.STRING },
    summary: { type: Type.STRING },
    article_markdown: { type: Type.STRING },
    slug: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['cz_title', 'summary', 'article_markdown', 'slug', 'tags'],
  propertyOrdering: ['cz_title', 'summary', 'article_markdown', 'slug', 'tags'],
};

type ProcessedOutput = z.infer<typeof ResultSchema> & {
  status: 'processed';
  source_url: string;
};

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
    const response = await ai.models.generateContent({
      model: config.GEMINI_MODEL,
      contents: safeText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const content = response.text;
    if (!content) throw new Error('No content returned from Gemini');

    const validated = ResultSchema.parse(JSON.parse(content));
    return { ...validated, status: 'processed', source_url: sourceUrl };
  } catch (e: any) {
    logger.error(`Gemini processing failed, using English fallback: ${e.message}`);
    return buildFallback(sourceUrl, title, text);
  }
}
