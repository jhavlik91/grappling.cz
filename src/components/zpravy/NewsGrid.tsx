"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CONTENT_TABS = [
  { key: "vše", label: "VŠECHNO" },
  { key: "z-ceska", label: "Z ČESKA" },
  { key: "tips", label: "TIPS & TRICKS" },
  { key: "zahranuci", label: "ZE ZAHRANIČÍ" },
];

const TYPE_LABELS: Record<string, string> = {
  zahranuci: "ZE ZAHRANIČÍ",
  "z-ceska": "Z ČESKA",
  tips: "TIPS",
};

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  type?: string;
  image?: string;
}

export function NewsGrid({ articles }: { articles: ArticleMeta[] }) {
  const [activeTab, setActiveTab] = useState("vše");

  const typeCounts = articles.reduce<Record<string, number>>((acc, a) => {
    const t = a.type ?? "";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  const visibleTabs = CONTENT_TABS.filter(
    (tab) => tab.key === "vše" || (typeCounts[tab.key] ?? 0) > 0
  );

  const filtered =
    activeTab === "vše"
      ? articles
      : articles.filter((a) => a.type === activeTab);

  return (
    <>
      <div className="mt-8 mb-10 flex flex-wrap gap-2 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#A855F7] text-white"
                : "glass text-gray-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-lg text-gray-500">Zatím žádné zprávy.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/zpravy/${article.slug}`}
              className="glass glass-hover card-3d group rounded-2xl overflow-hidden transition-all block"
            >
              <div className="relative h-44 bg-gradient-to-br from-purple-900/30 to-gray-900">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-5xl opacity-30">📰</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-[#A855F7]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#A855F7]">
                    {TYPE_LABELS[article.type ?? ""] ?? "ČLÁNEK"}
                  </span>
                  <span className="text-[10px] text-gray-600">{article.date}</span>
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
    </>
  );
}
