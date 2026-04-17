import fs from "node:fs/promises";
import path from "node:path";

interface Seminar {
  name: string;
  date: string;
  time?: string;
  location: string;
  instructor: string;
  url?: string;
  logoUrl?: string;
  registrationFee?: string;
  description?: string;
}

async function main() {
  const scriptUrl = process.env.APPS_SCRIPT_URL ?? process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ?? "";
  if (!scriptUrl) {
    console.error("Missing APPS_SCRIPT_URL env var");
    process.exit(1);
  }

  console.log("Fetching seminars from Apps Script...");
  const res = await fetch(`${scriptUrl}?action=list`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: Seminar[] = await res.json();

  const outDir = path.join(process.cwd(), "public", "data");
  await fs.mkdir(outDir, { recursive: true });

  const outPath = path.join(outDir, "seminare.json");
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`✓ Saved ${data.length} seminars to ${outPath}`);
}

main().catch(console.error);
