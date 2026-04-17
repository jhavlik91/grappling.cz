import Link from "next/link";
import type { ArticlePreview } from "@/types/content";
import { ContentBadge } from "./ContentBadge";

export function TipsCard({ article }: { article: ArticlePreview }) {
  return (
    <Link
      href={`/zpravy/${article.slug}`}
      className="group block overflow-hidden rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.06]"
    >
      <div className="p-5">
        <ContentBadge tag="TIPY A TRIKY" />
        <h3 className="mt-3 font-display text-base font-bold leading-snug text-white transition-colors group-hover:text-emerald-400 line-clamp-2 sm:text-lg">
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-2">
          {article.perex}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-600">
          <span>{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{article.readingTime} min čtení</span>
        </div>
      </div>
    </Link>
  );
}
