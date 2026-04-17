import { runScrapingJob } from './core/orchestrator';

async function main() {
  const arg = process.argv[2];
  await runScrapingJob(arg);
}

main().catch(err => {
  console.error('Unhandled error in runDaily script:', err);
  process.exit(1);
});
