import Link from "next/link";
import type { ArticlePreview } from "@/types/content";

export function TrendingWidget({ articles }: { articles: ArticlePreview[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-display text-xs font-bold uppercase tracking-widest text-gray-400">
        Právě se čte
      </h3>
      <div className="mt-4 space-y-0">
        {articles.map((article, i) => (
          <Link
            key={article.slug}
            href={`/zpravy/${article.slug}`}
            className="group flex items-start gap-3 border-b border-white/[0.04] py-3 last:border-b-0 transition-colors"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-gray-400 font-display">
              {i + 1}
            </span>
            <h4 className="text-sm font-medium leading-snug text-gray-300 transition-colors group-hover:text-white line-clamp-2">
              {article.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
