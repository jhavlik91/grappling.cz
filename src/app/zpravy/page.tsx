import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { NewsGrid, type ArticleMeta } from "@/components/zpravy/NewsGrid";

export default async function NewsPage() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  const articles: ArticleMeta[] = [];

  try {
    const files = await fs.readdir(articlesDir);
    for (const file of files) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      if (file === "2026-04-10-prvni-clanek.mdx") continue;

      const raw = await fs.readFile(path.join(articlesDir, file), "utf8");
      const parsed = matter(raw);
      articles.push({
        slug: file.replace(/\.(mdx|md)$/, ""),
        title: (parsed.data.title as string) ?? file,
        date: (parsed.data.date as string) ?? "",
        excerpt: (parsed.data.excerpt as string) ?? parsed.content.slice(0, 120),
        type: (parsed.data.type as string) ?? "article",
        image: (parsed.data.image as string) ?? undefined,
      });
    }
  } catch {
    /* no articles yet */
  }

  articles.sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        ZPRÁVY
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Novinky, rozhovory a průvodci ze světa grapplingových sportů.
      </p>

      <NewsGrid articles={articles} />
    </div>
  );
}
