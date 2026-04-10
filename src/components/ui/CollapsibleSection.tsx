"use client";

import { useState } from "react";

export function CollapsibleSection({
  title,
  defaultOpen = true,
  titleIcon,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-10">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 mb-6 transition-opacity group-hover:opacity-80">
          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
            {titleIcon}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
        <div className="mb-6 h-8 w-8 flex items-center justify-center text-gray-500 transition-colors group-hover:text-white shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
