import Image from "next/image";
import Link from "next/link";
import type { ArticlePreview } from "@/types/content";
import { ContentBadge } from "./ContentBadge";

export function HeroFeature({ article }: { article: ArticlePreview }) {
  return (
    <section className="relative overflow-hidden rounded-xl">
      {/* Background gradient fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-gray-900 to-gray-950" />
      {/* Article image */}
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="relative px-6 py-16 sm:px-10 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          <ContentBadge tag={article.tag} />
          <h1 className="mt-4 font-display text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
            {article.perex}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
            <span>{article.author}</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span>{article.readingTime} min čtení</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/zpravy/${article.slug}`}
              className="btn-neon rounded-lg px-6 py-3 text-sm"
            >
              Číst článek
            </Link>
            <button className="btn-outline rounded-lg px-6 py-3 text-sm">
              Přehrát video
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
