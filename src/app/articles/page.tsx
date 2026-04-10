import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";

const CONTENT_TABS = [
  { key: "vše", label: "VŠECHNO" },
  { key: "yt", label: "YT ROZHOVORY" },
  { key: "recenze", label: "RECENZE TURNAJŮ" },
  { key: "tips", label: "TIPS & TRICKS" },
  { key: "zahranuci", label: "ZE ZAHRANIČÍ" },
];

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  type?: string;
}

export default async function ArticlesPage() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  const articles: ArticleMeta[] = [];

  try {
    const files = await fs.readdir(articlesDir);
    for (const file of files) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      const raw = await fs.readFile(path.join(articlesDir, file), "utf8");
      const parsed = matter(raw);
      articles.push({
        slug: file.replace(/\.(mdx|md)$/, ""),
        title: (parsed.data.title as string) ?? file,
        date: (parsed.data.date as string) ?? "",
        excerpt: (parsed.data.excerpt as string) ?? parsed.content.slice(0, 120),
        type: (parsed.data.type as string) ?? "article",
      });
    }
  } catch {
    /* no articles yet */
  }

  articles.sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        CONTENT HUB
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Novinky, rozhovory a průvodci ze světa grapplingových sportů.
      </p>

      {/* Content tabs */}
      <div className="mt-8 mb-10 flex flex-wrap gap-2 overflow-x-auto">
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`rounded-lg px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
              tab.key === "vše"
                ? "bg-[#A855F7] text-white"
                : "glass text-gray-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-lg text-gray-500">
            Zatím žádné články.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="glass glass-hover card-3d group rounded-2xl overflow-hidden transition-all block"
            >
              {/* Image placeholder */}
              <div className="h-44 bg-gradient-to-br from-purple-900/30 to-gray-900 flex items-center justify-center">
                <span className="text-5xl opacity-30">📰</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-[#A855F7]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#A855F7]">
                    {article.type === "video" ? "YT" : "ČLÁNEK"}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {article.date}
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-white group-hover:text-[#84CC16] transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-3">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
