import Link from "next/link";
import type { ArticlePreview } from "@/types/content";
import { ContentBadge } from "./ContentBadge";

export function ArticleCardLarge({ article }: { article: ArticlePreview }) {
  return (
    <Link
      href={`/zpravy/${article.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      {/* Image area */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-purple-950/50 via-gray-900 to-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <ContentBadge tag={article.tag} />
        </div>
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl font-bold leading-snug text-white transition-colors group-hover:text-[#84CC16] line-clamp-2">
          {article.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-2">
          {article.perex}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
          <span>{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{article.date}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{article.readingTime} min</span>
        </div>
      </div>
    </Link>
  );
}
