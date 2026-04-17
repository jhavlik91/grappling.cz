import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ArticleCardLarge } from "@/components/feed/ArticleCardLarge";
import { ArticleCardMedium } from "@/components/feed/ArticleCardMedium";
import { TournamentCard } from "@/components/feed/TournamentCard";
import { TipsCard } from "@/components/feed/TipsCard";
import { TrendingWidget } from "@/components/feed/TrendingWidget";
import { RankingWidgetMini } from "@/components/feed/RankingWidgetMini";
import { AdBannerHorizontal } from "@/components/ads/AdBannerHorizontal";
import type { Rankings } from "@/types/smoothcomp";
import matter from "gray-matter";
import type { ArticlePreview, RankingEntryMini, TournamentPreview } from "@/types/content";

function formatDateCz(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("cs-CZ");
  } catch {
    return isoDate;
  }
}

export default async function HomePage() {
  let homepageRankings: RankingEntryMini[] = [];
  let feedArticles: ArticlePreview[] = [];
  let trendingArticles: ArticlePreview[] = [];
  let pinnedTournaments: (TournamentPreview & { href: string })[] = [];

  // Load real articles from content/articles
  try {
    const articlesDir = path.join(process.cwd(), "content", "articles");
    const files = await fs.readdir(articlesDir);
    const realArticles: ArticlePreview[] = [];

    for (const file of files) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      if (file === "2026-04-10-prvni-clanek.mdx") continue; // skip the intro one if preferred, or keep it

      const raw = await fs.readFile(path.join(articlesDir, file), "utf8");
      const parsed = matter(raw);
      
      const slug = file.replace(/\.(mdx|md)$/, "");
      realArticles.push({
        slug,
        title: (parsed.data.title as string) ?? slug,
        perex: (parsed.data.excerpt as string) ?? parsed.content.slice(0, 150),
        imageUrl: (parsed.data.image as string) ?? "/images/hero-grappling.jpg",
        tag: (parsed.data.tag as any) ?? "ZPRÁVY",
        author: (parsed.data.author as string) ?? "Jan Novák",
        date: (parsed.data.date as string) ?? "",
        readingTime: Math.ceil(parsed.content.length / 1000) || 5,
      });
    }

    if (realArticles.length > 0) {
      // Sort by date descending
      realArticles.sort((a, b) => (b.date > a.date ? 1 : -1));

      // Use ONLY real articles if they exist
      feedArticles = realArticles;
      trendingArticles = realArticles.slice(0, 4);
    }
  } catch (error) {
    console.error("Error loading articles for homepage:", error);
  }

  try {
    const rankingsPath = path.join(
      process.cwd(),
      "public",
      "data",
      "rankings.json"
    );
    const raw = await fs.readFile(rankingsPath, "utf8");
    const parsedRankings = JSON.parse(raw) as Rankings;

    // Get the top 5 competitors for GI Male White
    const entries = parsedRankings.gi?.Male?.["White"];
    if (entries && entries.length > 0) {
      homepageRankings = entries.slice(0, 5).map((e) => ({
        rank: e.rank,
        name: e.name,
        club: e.club || "Nezávislý",
        points: e.points,
      }));
    }
  } catch {
    // If rankings.json doesn't exist or is invalid, leave rankings empty.
  }

  // Load pinned and upcoming tournaments for the feed
  let allUpcomingTournaments: (TournamentPreview & { href: string })[] = [];
  try {
    const pinnedPath = path.join(process.cwd(), "data", "pinned-events.json");
    const metaPath = path.join(process.cwd(), "public", "data", "events-metadata.json");
    const pinnedConfig = JSON.parse(readFileSync(pinnedPath, "utf8"));
    const pinnedUrls: string[] = ((pinnedConfig.pinned as string[]) || []).slice(0, 6);
    const metadata: { url: string; name: string; logoUrl: string; parsedDate: string; location: string }[] =
      JSON.parse(readFileSync(metaPath, "utf8"));

    const now = new Date();
    const toCard = (meta: typeof metadata[number]) => {
      const eventDate = meta.parsedDate ? new Date(meta.parsedDate) : null;
      const isPast = eventDate ? eventDate < now : false;
      const eventIdMatch = meta.url.match(/\/event\/(\d+)/);
      const eventId = eventIdMatch?.[1] ?? "";
      return {
        slug: `event-${eventId}`,
        name: meta.name,
        date: meta.parsedDate ? formatDateCz(meta.parsedDate) : "",
        location: meta.location.replace(", Czechia", ""),
        imageUrl: meta.logoUrl || "/images/hero-grappling.jpg",
        status: isPast ? ("completed" as const) : ("upcoming" as const),
        href: meta.url,
      };
    };

    if (pinnedUrls.length > 0) {
      pinnedTournaments = pinnedUrls
        .map((url) => {
          const meta = metadata.find((m) => m.url.replace(/\/$/, "") === url.replace(/\/$/, ""));
          return meta ? toCard(meta) : null;
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);
    }

    const pinnedUrlSet = new Set(pinnedUrls.map((u) => u.replace(/\/$/, "")));
    allUpcomingTournaments = metadata
      .filter((m) => {
        if (pinnedUrlSet.has(m.url.replace(/\/$/, ""))) return false;
        const d = m.parsedDate ? new Date(m.parsedDate) : null;
        return d ? d >= now : false;
      })
      .sort((a, b) => new Date(a.parsedDate).getTime() - new Date(b.parsedDate).getTime())
      .map(toCard);
  } catch {
    // Fallback to mock tournaments if config or metadata is missing
  }

  const tournamentSlot1 = pinnedTournaments[0] ?? allUpcomingTournaments[0];
  const tournamentSlot2 = pinnedTournaments[1] ?? allUpcomingTournaments[1];
  const tournamentSlot3 = pinnedTournaments[2] ?? allUpcomingTournaments[2];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* ─── Feed + Sidebar shell ─── */}
      <div className="flex gap-8">
        {/* Main feed column */}
        <div className="flex-1 min-w-0">
          {/* Group 1: First tournament + two medium cards */}
          <div className="space-y-5">
            {tournamentSlot1 && (
              <TournamentCard
                tournament={tournamentSlot1}
                href={tournamentSlot1.href}
                isPinned={!!pinnedTournaments[0]}
              />
            )}
            {(feedArticles[1] || feedArticles[2]) && (
              <div className="grid gap-5 sm:grid-cols-2">
                {feedArticles[1] && <ArticleCardMedium article={feedArticles[1]} />}
                {feedArticles[2] && <ArticleCardMedium article={feedArticles[2]} />}
              </div>
            )}
          </div>

          {/* Ad slot 1 */}
          <AdBannerHorizontal />

          {/* Group 2: Tournament + article */}
          <div className="space-y-5">
            {tournamentSlot2 && (
              <TournamentCard
                tournament={tournamentSlot2}
                href={tournamentSlot2.href}
                isPinned={!!pinnedTournaments[1]}
              />
            )}
            {feedArticles[3] && <ArticleCardMedium article={feedArticles[3]} />}
          </div>

          {/* Ad slot 2 */}
          <AdBannerHorizontal />

          {/* Group 3: Tips + analysis + more */}
          {(feedArticles[2] || feedArticles[4] || feedArticles[5]) && (
            <div className="space-y-5">
              {feedArticles[2] && <TipsCard article={feedArticles[2]} />}
              {(feedArticles[4] || feedArticles[5]) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {feedArticles[4] && <ArticleCardLarge article={feedArticles[4]} />}
                  {feedArticles[5] && <ArticleCardLarge article={feedArticles[5]} />}
                </div>
              )}
            </div>
          )}

          {/* Ad slot 3 */}
          <AdBannerHorizontal />

          {/* Group 4: More content */}
          <div className="space-y-5">
            {tournamentSlot3 && (
              <TournamentCard
                tournament={tournamentSlot3}
                href={tournamentSlot3.href}
                isPinned={!!pinnedTournaments[2]}
              />
            )}
            {(feedArticles[6] || feedArticles[7]) && (
              <div className="grid gap-5 sm:grid-cols-2">
                {feedArticles[6] && <ArticleCardMedium article={feedArticles[6]} />}
                {feedArticles[7] && <ArticleCardMedium article={feedArticles[7]} />}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar — desktop only */}
        <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
          <TrendingWidget articles={trendingArticles} />
          <RankingWidgetMini entries={homepageRankings} label="Muži · GI · White" />
          {/* Sidebar ad placeholder */}
          <div className="flex items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] py-20 px-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-600">
                Reklama
              </p>
              <div className="mt-1 text-sm text-gray-700">300 × 600</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile-only widgets (below feed) */}
      <div className="mt-10 space-y-6 lg:hidden">
        <TrendingWidget articles={trendingArticles} />
        <RankingWidgetMini entries={homepageRankings} label="Muži · GI · White" />
      </div>
    </div>
  );
}
