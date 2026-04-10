import type { ArticleDetail } from "@/types/content";
import { ContentBadge } from "@/components/feed/ContentBadge";

export function ArticleHero({ article }: { article: ArticleDetail }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/50 to-transparent" />

      <div className="relative px-6 pt-16 pb-12 sm:px-10 sm:pt-24 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <ContentBadge tag={article.tag} />
          <h1 className="mt-4 font-display text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-3 text-lg text-gray-300 sm:text-xl">
              {article.subtitle}
            </p>
          )}
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-400">
            {article.perex}
          </p>
        </div>
      </div>
    </section>
  );
}
