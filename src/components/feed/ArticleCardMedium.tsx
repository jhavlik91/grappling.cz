import Image from "next/image";
import Link from "next/link";
import type { ArticlePreview } from "@/types/content";
import { ContentBadge } from "./ContentBadge";

export function ArticleCardMedium({ article }: { article: ArticlePreview }) {
  return (
    <Link
      href={`/zpravy/${article.slug}`}
      className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      {/* Thumbnail */}
      <div className="relative h-24 w-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-950/50 via-gray-900 to-gray-800 overflow-hidden sm:h-28 sm:w-32">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <ContentBadge tag={article.tag} />
        <h3 className="mt-2 font-display text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#84CC16] line-clamp-2 sm:text-base">
          {article.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
          <span>{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-gray-700" />
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  );
}
