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
};
