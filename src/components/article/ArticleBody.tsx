import type { ArticleBodyBlock } from "@/types/content";
import { PullQuote } from "./PullQuote";
import { InlineMediaBlock } from "./InlineMediaBlock";
import { AdBannerInline } from "@/components/ads/AdBannerInline";

export function ArticleBody({ blocks }: { blocks: ArticleBodyBlock[] }) {
  return (
    <div className="article-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="mb-6 text-base leading-[1.8] text-gray-300">
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h2
                key={i}
                className="mt-10 mb-4 font-display text-2xl font-bold text-white"
              >
                {block.text}
              </h2>
            );
          case "pullquote":
            return (
              <PullQuote
                key={i}
                text={block.text}
                attribution={block.attribution}
              />
            );
          case "image":
            return (
              <InlineMediaBlock
                key={i}
                type="image"
                url={block.url}
                caption={block.caption}
              />
            );
          case "video":
            return (
              <InlineMediaBlock
                key={i}
                type="video"
                url={block.embedUrl}
                caption={block.caption}
              />
            );
          case "ad":
            return <AdBannerInline key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
