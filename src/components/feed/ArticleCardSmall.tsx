import Link from "next/link";
import type { ArticlePreview } from "@/types/content";

export function ArticleCardSmall({ article }: { article: ArticlePreview }) {
  return (
    <Link
      href={`/zpravy/${article.slug}`}
      className="group flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0 transition-colors"
    >
      <div className="flex-1">
        <h4 className="text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#84CC16] line-clamp-2">
          {article.title}
        </h4>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
          <span>{article.date}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{article.readingTime} min</span>
        </div>
      </div>
      <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900" />
    </Link>
  );
}
