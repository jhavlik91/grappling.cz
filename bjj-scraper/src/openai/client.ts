import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config/env';
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

export async function processArticleWithAI(
  sourceName: string,
  sourceUrl: string,
  title: string,
  date: string | null,
  author: string | null,
  text: string
): Promise<ProcessedOutput> {
  const userPrompt = buildUserPrompt(sourceName, sourceUrl, title, date, author, text);

  // Zkrácení extrémně dlouhých textů (chrání token limit, v normálních článcích nebývá problém)
  const safeText = userPrompt.slice(0, 30000);

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
  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse OpenAI JSON output: ' + content);
  }

  // Validace
  const validated = ResultSchema.parse(parsed);

  return {
    ...validated,
    source_url: sourceUrl
  };
}
