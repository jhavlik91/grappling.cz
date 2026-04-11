import cron from 'node-cron';
import { runScrapingJob } from './core/orchestrator';
import { config } from './config/env';
import { logger } from './utils/logger';

logger.info(`Starting BJJ Scraper background service...`);
logger.info(`Cron schedule configured to: ${config.SCRAPE_SCHEDULE}`);

cron.schedule(config.SCRAPE_SCHEDULE, async () => {
  logger.info('Cron job triggered: running scheduled scraping job');
  await runScrapingJob();
});

logger.info('Service is active and waiting for next schedule tick.');
