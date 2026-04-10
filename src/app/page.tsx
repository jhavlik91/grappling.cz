import fs from "node:fs/promises";
import path from "node:path";
import { HeroFeature } from "@/components/feed/HeroFeature";
import { ArticleCardLarge } from "@/components/feed/ArticleCardLarge";
import { ArticleCardMedium } from "@/components/feed/ArticleCardMedium";
import { VideoCard } from "@/components/feed/VideoCard";
import { TournamentCard } from "@/components/feed/TournamentCard";
import { TipsCard } from "@/components/feed/TipsCard";
import { TrendingWidget } from "@/components/feed/TrendingWidget";
import { RankingWidgetMini } from "@/components/feed/RankingWidgetMini";
import { AdBannerHorizontal } from "@/components/ads/AdBannerHorizontal";
import {
  heroArticle,
  feedArticles,
  feedVideos,
  feedTournaments,
  miniRankings as fallbackRankings,
  trendingArticles,
} from "@/lib/mockData";
import type { Rankings } from "@/types/smoothcomp";

export default async function HomePage() {
  let homepageRankings = fallbackRankings;

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
    // If rankings.json doesn't exist or is invalid, just use the fallback mock data.
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* ─── Hero ─── */}
      <HeroFeature article={heroArticle} />

      {/* ─── Feed + Sidebar shell ─── */}
      <div className="mt-8 flex gap-8">
        {/* Main feed column */}
        <div className="flex-1 min-w-0">
          {/* Group 1: Lead + two medium cards */}
          <div className="space-y-5">
            <ArticleCardLarge article={feedArticles[0]} />
            <div className="grid gap-5 sm:grid-cols-2">
              <ArticleCardMedium article={feedArticles[1]} />
              <ArticleCardMedium article={feedArticles[2]} />
            </div>
          </div>

          {/* Ad slot 1 */}
          <AdBannerHorizontal />

          {/* Group 2: Video + tournament + article */}
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <VideoCard video={feedVideos[0]} />
              <VideoCard video={feedVideos[1]} />
            </div>
            <TournamentCard tournament={feedTournaments[0]} />
            <ArticleCardMedium article={feedArticles[3]} />
          </div>

          {/* Ad slot 2 */}
          <AdBannerHorizontal />

          {/* Group 3: Tips + analysis + more */}
          <div className="space-y-5">
            <TipsCard article={feedArticles[2]} />
            <div className="grid gap-5 sm:grid-cols-2">
              <ArticleCardLarge article={feedArticles[4]} />
              <ArticleCardLarge article={feedArticles[5]} />
            </div>
          </div>

          {/* Ad slot 3 */}
          <AdBannerHorizontal />

          {/* Group 4: More content */}
          <div className="space-y-5">
            <VideoCard video={feedVideos[2]} />
            <TournamentCard tournament={feedTournaments[1]} />
            <div className="grid gap-5 sm:grid-cols-2">
              <ArticleCardMedium article={feedArticles[6]} />
              <ArticleCardMedium article={feedArticles[7]} />
            </div>
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
