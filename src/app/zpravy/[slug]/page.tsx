import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ArticleBody } from "@/components/article/ArticleBody";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { SidebarRecommended } from "@/components/article/SidebarRecommended";
import { SidebarAd } from "@/components/ads/SidebarAd";
import { trendingArticles } from "@/lib/mockData";
import type { ArticleDetail, ArticleBodyBlock } from "@/types/content";

// For static export: pre-generate known slugs
export async function generateStaticParams() {
  try {
    const articlesDir = path.join(process.cwd(), "content", "articles");
    const files = await fs.readdir(articlesDir);
    const mdxSlugs = files
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => f.replace(/\.(mdx|md)$/, ""));
    return mdxSlugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article: ArticleDetail | null = null;

  try {
    const articlesDir = path.join(process.cwd(), "content", "articles");
    let filePath = path.join(articlesDir, `${slug}.mdx`);

    try {
      await fs.access(filePath);
    } catch {
      filePath = path.join(articlesDir, `${slug}.md`);
    }

    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);

    const body: ArticleBodyBlock[] = parsed.content
      .split("\n\n")
      .filter(p => p.trim().length > 0)
      .map(text => ({ type: "paragraph", text: text.trim() }));

    article = {
      slug,
      title: (parsed.data.title as string) ?? slug,
      subtitle: "",
      perex: (parsed.data.excerpt as string) ?? parsed.content.slice(0, 150),
      imageUrl: (parsed.data.image as string) ?? "/images/hero-grappling.jpg",
      tag: (parsed.data.tag as any) ?? "ZPRÁVY",
      author: (parsed.data.author as string) ?? "Jan Novák",
      authorImageUrl: "/images/author.jpg",
      date: (parsed.data.date as string) ?? "",
      readingTime: Math.ceil(parsed.content.length / 1000) || 5,
      body,
      relatedArticles: [],
    };
  } catch {
    // Not found
  }

  if (!article) {
    notFound();
  }

  return (
    <>
      {/* Full-width hero */}
      <ArticleHero article={article} />

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-10">
          {/* Main article content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <ArticleMeta article={article} />
            <ArticleBody blocks={article.body} />
            <RelatedArticles articles={article.relatedArticles} />
          </article>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6 pt-4">
            <SidebarRecommended articles={trendingArticles} />
            <SidebarAd />
          </aside>
        </div>
      </div>
    </>
  );
}
