import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ArticleBody } from "@/components/article/ArticleBody";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { SidebarRecommended } from "@/components/article/SidebarRecommended";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { getArticleBySlug, trendingArticles } from "@/lib/mockData";

// For static export: pre-generate known slugs
export function generateStaticParams() {
  const slugs = [
    "gordon-ryan-adcc-2025-analyza",
    "cesky-grappling-2026-roste",
    "rozhovor-michal-pesek",
    "guard-passing-tipy",
    "turnaj-brno-open-vysledky",
    "heel-hook-pravidla-ibjjf",
    "jak-zacit-s-bjj",
    "dagestan-wrestlers-bjj",
    "predturnajova-priprava",
  ];
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      {/* Full-width hero */}
      <ArticleHero article={article} />

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-10">
          {/* Main article content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <ArticleMeta article={article} />
            <ArticleBody blocks={article.body} />
            <RelatedArticles articles={article.relatedArticles} />
          </article>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6 pt-4">
            <SidebarRecommended articles={trendingArticles} />
            <SidebarAd />
          </aside>
        </div>
      </div>
    </>
  );
}
