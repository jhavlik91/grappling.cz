import Link from "next/link";
import type { ArticlePreview } from "@/types/content";

export function SidebarRecommended({ articles }: { articles: ArticlePreview[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-display text-xs font-bold uppercase tracking-widest text-gray-400">
        Doporučené
      </h3>
      <div className="mt-4 space-y-0">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/zpravy/${article.slug}`}
            className="group flex gap-3 border-b border-white/[0.04] py-3 last:border-b-0"
          >
            <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900" />
            <div className="flex-1">
              <h4 className="text-sm font-medium leading-snug text-gray-300 transition-colors group-hover:text-white line-clamp-2">
                {article.title}
              </h4>
              <p className="mt-1 text-[11px] text-gray-600">
                {article.readingTime} min čtení
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
