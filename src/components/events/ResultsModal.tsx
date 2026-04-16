"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { NormalizedEvent } from "@/types/smoothcomp";

const PLACEMENT_LABELS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

interface Props {
  eventId: string;
  internalLink: string;
}

export function ResultsModal({ eventId, internalLink }: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NormalizedEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleOpen() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    try {
      const res = await fetch(`/data/events/event-${eventId}.json`);
      if (!res.ok) throw new Error("not found");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) setOpen(false);
  }

  return (
    <>
      {/* On mobile navigate; on desktop open modal */}
      <Link
        href={internalLink}
        className="btn-neon rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold md:hidden"
      >
        VÝSLEDKY
      </Link>
      <button
        onClick={handleOpen}
        className="btn-neon rounded-lg px-4 py-2 text-sm flex-1 text-center font-bold hidden md:block"
      >
        VÝSLEDKY
      </button>

      {open && createPortal(
        <div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[#111113] border border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
              <h2 className="font-display text-xl font-bold text-white truncate pr-4">
                {data?.name ?? "Výsledky"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Zavřít"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              {loading && (
                <p className="text-gray-500 text-sm py-8 text-center">Načítám výsledky…</p>
              )}
              {!loading && !data && (
                <p className="text-gray-500 text-sm py-8 text-center">Výsledky se nepodařilo načíst.</p>
              )}
              {!loading && data && (
                <>
                  {data.date && (
                    <p className="text-sm text-gray-500 -mt-1 mb-2">{data.date} · {data.country}</p>
                  )}
                  {data.categories.map((category, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-white">
                        {category.name}
                      </h3>
                      <div className="space-y-1.5">
                        {category.athletes.map((athlete, j) => (
                          <div
                            key={j}
                            className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 text-sm"
                          >
                            <span className="shrink-0">
                              {PLACEMENT_LABELS[athlete.placement] ?? (
                                <span className="text-gray-600">{athlete.placement}</span>
                              )}
                            </span>
                            <span className="flex-1 min-w-0 font-medium text-white truncate">
                              {athlete.name}
                              {athlete.club && (
                                <span className="ml-1.5 text-gray-600 font-normal">({athlete.club})</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-600 shrink-0">{athlete.country}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
