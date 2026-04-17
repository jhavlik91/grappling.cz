"use client";

import { useState, useEffect } from "react";
import type { Rankings, RankingEntry } from "@/types/smoothcomp";

// Belt display order — adults
const NOGI_ADULT_ORDER = ["Beginner", "Advanced", "Elite"];
const GI_ADULT_ORDER = ["White", "Blue", "Purple / Brown / Black"];

// Belt display order — kids
const GI_KIDS_ORDER = ["Beginner", "Advanced"];
const NOGI_KIDS_ORDER = ["Beginner", "Advanced"];

const BELT_STYLES: Record<string, string> = {
  // Adults
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

type AgeGroup = "adults" | "kids";
type GiType = "gi" | "nogi";
type Gender = "Male" | "Female" | "Mixed";

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Rankings | null>(null);
  const [activeType, setActiveType] = useState<GiType>("nogi");
  const [activeAge, setActiveAge] = useState<AgeGroup>("adults");
  const [activeGender, setActiveGender] = useState<Gender>("Male");
  const [activeBelt, setActiveBelt] = useState("Beginner");
  const [topOnly, setTopOnly] = useState(false);

  useEffect(() => {
    fetch("/data/rankings.json")
      .then((res) => res.json())
      .then((data: Rankings) => {
        setRankings(data);
      })
      .catch(console.error);
  }, []);

  // Derive the section key based on active selections
  const sectionKey = activeAge === "kids"
    ? (`${activeType}_kids` as keyof Rankings)
    : (activeType as keyof Rankings);

  // Belt list for current context
  const beltOrder = activeAge === "kids"
    ? (activeType === "gi" ? GI_KIDS_ORDER : NOGI_KIDS_ORDER)
    : (activeType === "gi" ? GI_ADULT_ORDER : NOGI_ADULT_ORDER);

  // When context changes, auto-select first available belt
  useEffect(() => {
    if (!rankings) return;
    const section = rankings[sectionKey] as Record<string, Record<string, RankingEntry[]>> | undefined;
    const available = beltOrder.filter((b) => section?.[activeGender]?.[b]?.length);
    if (!available.includes(activeBelt)) {
      setActiveBelt(available[0] ?? beltOrder[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeAge, activeGender, rankings]);

  const section = rankings?.[sectionKey] as Record<string, Record<string, RankingEntry[]>> | undefined;
  const allEntries: RankingEntry[] = section?.[activeGender]?.[activeBelt] ?? [];
  const entries = topOnly ? allEntries.slice(0, 10) : allEntries;

  // Available genders for kids (may include Mixed)
  const genderButtons: { key: Gender; label: string }[] = activeAge === "kids"
    ? [
        { key: "Male", label: "Kluci" },
        { key: "Female", label: "Holky" },
        { key: "Mixed", label: "Mix" },
      ]
    : [
        { key: "Male", label: "Muži" },
        { key: "Female", label: "Ženy" },
      ];

  const accentClass = activeType === "gi" ? "bg-electric text-white" : "bg-acid text-black";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
        ŽEBŘÍČEK ZÁVODNÍKŮ
      </h1>

      <div className="mt-8 mb-6 flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: discipline + age group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* GI / NO-GI */}
          <button
            onClick={() => setActiveType("nogi")}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeType === "nogi" ? "bg-acid text-black" : "text-gray-400 hover:bg-white/[0.06]"
            }`}
          >
            NO-GI
          </button>
          <button
            onClick={() => setActiveType("gi")}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeType === "gi" ? "bg-electric text-white" : "text-gray-400 hover:bg-white/[0.06]"
            }`}
          >
            GI
          </button>

          <span className="mx-1 h-6 w-px bg-white/10" />

          {/* Adults / Kids */}
          <button
            onClick={() => setActiveAge("adults")}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeAge === "adults" ? accentClass : "text-gray-400 hover:bg-white/[0.06]"
            }`}
          >
            Dospělí
          </button>
          <button
            onClick={() => setActiveAge("kids")}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              activeAge === "kids" ? accentClass : "text-gray-400 hover:bg-white/[0.06]"
            }`}
          >
            Děti
          </button>
        </div>

        {/* Right: gender + top10 */}
        <div className="flex items-center gap-2 flex-wrap">
          {genderButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveGender(key)}
              className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeGender === key ? "bg-white text-gray-900" : "text-gray-400 hover:bg-white/[0.06]"
              }`}
            >
              {label}
            </button>
          ))}

          <span className="mx-1 h-6 w-px bg-white/10" />

          <button
            onClick={() => setTopOnly((v) => !v)}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              topOnly ? accentClass : "text-gray-400 hover:bg-white/[0.06]"
            }`}
          >
            {topOnly ? "Vše" : "Top 10"}
          </button>
        </div>
      </div>

      {/* Belt tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {beltOrder.map((belt) => {
          const count = section?.[activeGender]?.[belt]?.length ?? 0;
          if (count === 0) return null;
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
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
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
          <table className="w-full table-fixed text-left text-base text-gray-300 border-separate border-spacing-y-3">
            <thead className="text-sm font-semibold uppercase text-gray-500">
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
                      <span className="text-lg sm:text-xl font-bold text-white truncate">{entry.name}</span>
                      <span className="text-sm uppercase text-gray-500 font-semibold tracking-wider">{entry.country.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-base font-medium line-clamp-1">{entry.club}</span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="gold" />
                      <span className="font-bold text-lg text-gray-300">{entry.gold}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="silver" />
                      <span className="font-bold text-lg text-gray-300">{entry.silver}</span>
                    </div>
                  </td>
                  <td className="pr-6 pl-2 py-3">
                    <div className="flex items-center gap-1.5 justify-center">
                      <MedalBadge type="bronze" />
                      <span className="font-bold text-lg text-gray-300">{entry.bronze}</span>
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
