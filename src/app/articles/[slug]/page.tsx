import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import matter from "gray-matter";

export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  try {
    const files = await fs.readdir(articlesDir);
    return files
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
      .map((f) => ({ slug: f.replace(/\.(mdx|md)$/, "") }));
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

  const articlesDir = path.join(process.cwd(), "content", "articles");
  let title = slug;
  let date = "";
  let content = "";

  try {
    // Try .mdx first, then .md
    let filePath = path.join(articlesDir, `${slug}.mdx`);
    try {
      await fs.access(filePath);
    } catch {
      filePath = path.join(articlesDir, `${slug}.md`);
    }

    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);
    title = (parsed.data.title as string) ?? slug;
    date = (parsed.data.date as string) ?? "";
    content = parsed.content;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <article>
        <header className="mb-8">
          <div className="mb-2 text-sm text-gray-500">{date}</div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </header>
        <div className="prose prose-invert prose-gray max-w-none">
          {/* Simple markdown rendering — for full MDX support, import the .mdx dynamically */}
          {content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed text-gray-300">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
