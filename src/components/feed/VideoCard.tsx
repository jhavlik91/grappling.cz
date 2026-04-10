import Link from "next/link";
import type { VideoPreview } from "@/types/content";
import { ContentBadge } from "./ContentBadge";

export function VideoCard({ video }: { video: VideoPreview }) {
  return (
    <Link
      href={`/videa/${video.slug}`}
      className="group block overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      {/* Video thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-red-950/30 via-gray-900 to-gray-800 overflow-hidden">
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
            <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {video.duration}
        </div>
      </div>
      <div className="p-4">
        <ContentBadge tag={video.tag} />
        <h3 className="mt-2 font-display text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#84CC16] line-clamp-2">
          {video.title}
        </h3>
        <div className="mt-2 text-[11px] text-gray-600">{video.date}</div>
      </div>
    </Link>
  );
}
