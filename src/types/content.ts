export type ContentTag =
  | "ROZHOVOR"
  | "ANALÝZA"
  | "TURNAJ"
  | "VIDEO"
  | "TIPY A TRIKY"
  | "ZPRÁVY"
  | "TECHNIKA";

export interface ArticlePreview {
  slug: string;
  title: string;
  perex: string;
  imageUrl: string;
  tag: ContentTag;
  author: string;
  date: string;
  readingTime: number; // minutes
}

export interface VideoPreview {
  slug: string;
  title: string;
  thumbnailUrl: string;
  duration: string; // "12:34"
  tag: ContentTag;
  date: string;
}

export interface TournamentPreview {
  slug: string;
  name: string;
  date: string;
  location: string;
  imageUrl: string;
  competitorCount: number;
  status: "upcoming" | "live" | "completed";
}

export interface RankingEntryMini {
  rank: number;
  name: string;
  club: string;
  points: number;
}

export interface PromoBanner {
  id: string;
  label: string;
  href: string;
  imageUrl?: string;
  width: number;
  height: number;
}

export interface ArticleDetail {
  slug: string;
  title: string;
  subtitle: string;
  perex: string;
  imageUrl: string;
  tag: ContentTag;
  author: string;
  authorImageUrl: string;
  date: string;
  readingTime: number;
  body: ArticleBodyBlock[];
  relatedArticles: ArticlePreview[];
}

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "pullquote"; text: string; attribution?: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "video"; embedUrl: string; caption?: string }
  | { type: "ad" };
