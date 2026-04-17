import type { ArticleDetail } from "@/types/content";

export function ArticleMeta({ article }: { article: ArticleDetail }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-white/[0.06] pb-6 mb-8">
      {/* Author avatar placeholder */}
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-600 to-gray-700" />
      <div>
        <p className="text-sm font-semibold text-white">{article.author}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{article.date}</span>
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <span>{article.readingTime} min čtení</span>
        </div>
      </div>
    </div>
  );
}
