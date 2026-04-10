import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden sm:block border-t border-white/[0.06] bg-[#0D0D0D]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Grappling.cz — novinky, tipy, triky a statistiky
        </p>

      </div>
    </footer>
  );
}
