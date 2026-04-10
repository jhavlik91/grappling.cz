export function PullQuote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  return (
    <blockquote className="my-10 border-l-4 border-[#A855F7] pl-6 py-2">
      <p className="font-display text-xl font-bold leading-snug text-white italic sm:text-2xl">
        &ldquo;{text}&rdquo;
      </p>
      {attribution && (
        <cite className="mt-3 block text-sm font-medium text-gray-500 not-italic">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}
