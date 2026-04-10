import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import type { NormalizedEvent } from "@/types/smoothcomp";

const PLACEMENT_LABELS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function generateStaticParams() {
  const dir = path.join(process.cwd(), "public", "data", "events");
  try {
    const files = readdirSync(dir);
    return files
      .filter((f) => f.endsWith(".json") && f !== "index.json")
      .map((f) => ({ slug: f.replace(/\.json$/, "") }));
  } catch {
    return [];
  }
}

async function getEvent(slug: string): Promise<NormalizedEvent | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "events",
      `${slug}.json`
    );
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as NormalizedEvent;
  } catch {
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black text-white sm:text-5xl">
        {event.name}
      </h1>
      <p className="mt-2 mb-10 text-sm text-gray-500">
        {event.date} · {event.country}
      </p>

      <div className="space-y-6">
        {event.categories.map((category, index) => (
          <div key={index} className="glass rounded-2xl p-6">
            <h2 className="mb-5 font-display text-base font-bold uppercase tracking-wider text-white">
              {category.name}
            </h2>
            <div className="space-y-2">
              {category.athletes.map((athlete, j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="text-lg shrink-0">
                    {PLACEMENT_LABELS[athlete.placement] ?? (
                      <span className="text-sm text-gray-600">
                        {athlete.placement}
                      </span>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white">
                      {athlete.name}
                    </span>
                    {athlete.club && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({athlete.club})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 shrink-0">
                    {athlete.country}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
