export function InlineMediaBlock({
  type,
  url,
  caption,
}: {
  type: "image" | "video";
  url: string;
  caption?: string;
}) {
  return (
    <figure className="my-10">
      {type === "image" ? (
        <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
          <span className="text-3xl text-gray-700">📷</span>
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <svg className="ml-1 h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-gray-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
