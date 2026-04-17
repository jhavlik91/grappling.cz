import type { ContentTag } from "@/types/content";

const TAG_COLORS: Record<ContentTag, string> = {
  ROZHOVOR: "bg-purple-500/20 text-purple-400",
  ANALÝZA: "bg-blue-500/20 text-blue-400",
  TURNAJ: "bg-amber-500/20 text-amber-400",
  VIDEO: "bg-red-500/20 text-red-400",
  "TIPY A TRIKY": "bg-emerald-500/20 text-emerald-400",
  ZPRÁVY: "bg-white/10 text-gray-300",
  TECHNIKA: "bg-cyan-500/20 text-cyan-400",
};

export function ContentBadge({ tag }: { tag: ContentTag }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TAG_COLORS[tag]}`}
    >
      {tag}
    </span>
  );
}
