"use client";

import { useState, useEffect } from "react";
import type { Rankings, RankingEntry } from "@/types/smoothcomp";

const NOGI_ORDER = [
  "Beginner",
  "Advanced",
  "Elite",
];

const GI_ORDER = ["White", "Blue", "Purple / Brown / Black"];

const BELT_STYLES: Record<string, string> = {
  Beginner: "bg-white text-gray-900",
  Advanced: "bg-blue-600 text-white",
  Elite: "bg-gray-900 text-white ring-1 ring-white/20",
  White: "bg-white text-gray-900",
  Blue: "bg-blue-600 text-white",
  "Purple / Brown / Black": "bg-gradient-to-r from-purple-800 via-amber-900 to-gray-900 text-white ring-1 ring-white/20",
};

function MedalBadge({ type }: { type: "gold" | "silver" | "bronze" }) {
  const icons = { gold: "🥇", silver: "🥈", bronze: "🥉" };
  return <span className="text-lg">{icons[type]}</span>;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [activeType, setActiveType] = useState<"gi" | "nogi">("nogi");
  const [activeGender, setActiveGender] = useState<"Male" | "Female">("Male");
  const [activeBelt, setActiveBelt] = useState("Beginner");
  const [topOnly, setTopOnly] = useState(false);

  useEffect(() => {
    fetch("/data/rankings.json")
      .then((res) => res.json())
      .then((data: Rankings) => {
        setRankings(data);
        
        // Auto-select first available belt for activeType and activeGender
        const list = activeType === "nogi" ? NOGI_ORDER : GI_ORDER;
        const available = list.filter((b) => data[activeType]?.[activeGender]?.[b]?.length);
        if (available.length > 0 && !data[activeType]?.[activeGender]?.[activeBelt]?.length) {
          setActiveBelt(available[0]);
        }
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When type or gender changes, we switch the active belt automatically to a valid one
  useEffect(() => {
    if (!rankings) return;
    const list = activeType === "nogi" ? NOGI_ORDER : GI_ORDER;
    const available = list.filter((b) => rankings[activeType]?.[activeGender]?.[b]?.length);
    if (!list.includes(activeBelt) || (available.length > 0 && !rankings[activeType]?.[activeGender]?.[activeBelt]?.length)) {
      setActiveBelt(available.length > 0 ? available[0] : list[0]);
    }
  }, [activeType, activeGender, rankings, activeBelt]);

  const activeBeltsList = activeType === "nogi" ? NOGI_ORDER : GI_ORDER;
  const allEntries: RankingEntry[] = rankings?.[activeType]?.[activeGender]?.[activeBelt] ?? [];
  const entries = topOnly ? allEntries.slice(0, 10) : allEntries;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        ŽEBŘÍČEK ZÁVODNÍKŮ
      </h1>

      <div className="mt-8 mb-6 flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
        <button
          onClick={() => setActiveType("nogi")}
          className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeType === "nogi"
              ? "bg-acid text-black"
              : "text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          NO-GI
        </button>
        <button
          onClick={() => setActiveType("gi")}
          className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeType === "gi"
              ? "bg-electric text-white"
              : "text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          GI
        </button>

        <span className="mx-1 h-6 w-px bg-white/10" />

        <button
          onClick={() => setActiveGender("Male")}
          className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeGender === "Male"
              ? "bg-white text-gray-900"
              : "text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          Muži
        </button>
        <button
          onClick={() => setActiveGender("Female")}
          className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            activeGender === "Female"
              ? "bg-white text-gray-900"
              : "text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          Ženy
        </button>

        <span className="mx-1 h-6 w-px bg-white/10" />

        <button
          onClick={() => setTopOnly((v) => !v)}
          className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
            topOnly
              ? activeType === "nogi" ? "bg-acid text-black" : "bg-electric text-white"
              : "text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          {topOnly ? "All" : "Top 10"}
        </button>
      </div>

      {/* Belt tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {activeBeltsList.map((belt) => {
          const count = rankings?.[activeType]?.[activeGender]?.[belt]?.length ?? 0;
          const isActive = activeBelt === belt;
          return (
            <button
              key={belt}
              onClick={() => setActiveBelt(belt)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? BELT_STYLES[belt] || "bg-[#1E293B] text-white"
                  : "glass text-gray-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {belt}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-60">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl py-20 text-center">
          <p className="text-lg text-gray-500">
            Zatím žádná data pro tuto sekci.
          </p>
        </div>
      ) : (
        <div className={`overflow-x-auto pb-8 ${activeType === "gi" ? "rank-theme-electric" : "rank-theme-acid"}`}>
          <table className="w-full table-fixed text-left text-sm text-gray-300 border-separate border-spacing-y-3">
            <thead className="text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="w-[72px] px-4 py-2 font-display tracking-widest pl-6">Rank</th>
                <th className="w-[22%] px-4 py-2 font-display tracking-widest">Závodník</th>
                <th className="px-4 py-2 font-display tracking-widest">Klub</th>

                <th className="w-[180px] px-4 py-2 font-display tracking-widest text-center" colSpan={3}>
                  Medaile
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={i} className="rank-row">
                  <td className="pl-6 pr-4 py-3">
                    <div className="rank-badge font-display">{entry.rank}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white truncate">{entry.name}</span>
                      <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">{entry.country.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 font-medium line-clamp-1">{entry.club}</span>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="gold" />
                      <span className="font-bold text-gray-300">{entry.gold}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="silver" />
                      <span className="font-bold text-gray-300">{entry.silver}</span>
                    </div>
                  </td>
                  <td className="pr-6 pl-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="bronze" />
                      <span className="font-bold text-gray-300">{entry.bronze}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
