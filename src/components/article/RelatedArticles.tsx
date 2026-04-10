import Link from "next/link";
import type { ArticlePreview } from "@/types/content";
import { ContentBadge } from "@/components/feed/ContentBadge";

export function RelatedArticles({ articles }: { articles: ArticlePreview[] }) {
  return (
    <section className="mt-16 border-t border-white/[0.06] pt-10">
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
        Další z Grappling.cz
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/zpravy/${article.slug}`}
            className="group overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div className="h-36 bg-gradient-to-br from-purple-950/40 via-gray-900 to-gray-800" />
            <div className="p-4">
              <ContentBadge tag={article.tag} />
              <h3 className="mt-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#84CC16] line-clamp-2">
                {article.title}
              </h3>
              <div className="mt-2 text-[11px] text-gray-600">
                {article.date}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
