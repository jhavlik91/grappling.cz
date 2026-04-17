import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  SCRAPE_SCHEDULE: z.string().default('0 6 * * *'),
  HEADLESS: z.enum(['true', 'false']).default('true'),
  POPELINA_DIR: z.string().default('./popelina'),
  // Only process articles published within the last N days (0 = no limit)
  DAYS_BACK: z.coerce.number().int().min(0).default(1),
  // Max candidates to visit per source (newest-first listing pages — no point loading 50+ old articles)
  MAX_CANDIDATES: z.coerce.number().int().min(1).default(10),
  // Delay between article requests in ms
  SCRAPE_DELAY_MS: z.coerce.number().int().min(0).default(500),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const config = {
  ..._env.data,
  HEADLESS: _env.data.HEADLESS === 'true',
  POPELINA_DIR: path.resolve(process.cwd(), _env.data.POPELINA_DIR),
  DAYS_BACK: _env.data.DAYS_BACK,
};
