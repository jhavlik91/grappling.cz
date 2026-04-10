import type { NormalizedEvent, RankingEntry, Rankings } from "@/types/smoothcomp";

const MEDAL_POINTS: Record<number, number> = {
  1: 9, // Gold
  2: 3, // Silver
  3: 1, // Bronze
};

/**
 * Build aggregated rankings from a list of normalized events.
 * Groups athletes by belt and sorts by points with tie-breaking logic.
 */
export function buildRankings(events: NormalizedEvent[]): Rankings {
  // Map: gender -> belt -> athlete name -> ranking entry
  const giMap = new Map<string, Map<string, Map<string, RankingEntry>>>();
  const nogiMap = new Map<string, Map<string, Map<string, RankingEntry>>>();

  for (const m of [giMap, nogiMap]) {
    m.set("Male", new Map());
    m.set("Female", new Map());
  }

  for (const event of events) {
    for (const category of event.categories) {
      const belt = category.belt;
      const gender = category.gender;

      if (!belt || belt === "Unknown") continue;
      if (gender !== "Male" && gender !== "Female") continue;

      const targetMap = category.gi ? giMap : nogiMap;
      const genderMap = targetMap.get(gender)!;

      if (!genderMap.has(belt)) {
        genderMap.set(belt, new Map());
      }
      const athleteMap = genderMap.get(belt)!;

      for (const athlete of category.athletes) {
        const key = athlete.name.toLowerCase();
        const points = MEDAL_POINTS[athlete.placement] ?? 0;

        if (!athleteMap.has(key)) {
          athleteMap.set(key, {
            name: athlete.name,
            country: athlete.country,
            club: athlete.club,
            belt,
            points: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
            events: [],
            rank: 0,
          });
        }

        const entry = athleteMap.get(key)!;
        entry.points += points;
        if (athlete.placement === 1) entry.gold++;
        if (athlete.placement === 2) entry.silver++;
        if (athlete.placement === 3) entry.bronze++;
        if (!entry.events.includes(event.slug)) {
          entry.events.push(event.slug);
        }
        if (athlete.club) entry.club = athlete.club;
        if (athlete.country) entry.country = athlete.country;
      }
    }
  }

  function sortGenderMap(map: Map<string, Map<string, Map<string, RankingEntry>>>) {
    const maleResult: Record<string, RankingEntry[]> = {};
    const femaleResult: Record<string, RankingEntry[]> = {};

    for (const gender of ["Male", "Female"]) {
      const gMap = map.get(gender)!;
      const resultObj = gender === "Male" ? maleResult : femaleResult;

      for (const [belt, athleteMap] of gMap.entries()) {
        const entries = Array.from(athleteMap.values());
        entries.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gold !== a.gold) return b.gold - a.gold;
          if (b.silver !== a.silver) return b.silver - a.silver;
          if (b.bronze !== a.bronze) return b.bronze - a.bronze;
          return a.name.localeCompare(b.name);
        });

        // Calculate ranks considering ties
        let prevEntry: RankingEntry | null = null;
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (
            prevEntry &&
            entry.points === prevEntry.points &&
            entry.gold === prevEntry.gold &&
            entry.silver === prevEntry.silver &&
            entry.bronze === prevEntry.bronze
          ) {
            entry.rank = prevEntry.rank;
          } else {
            entry.rank = i + 1;
          }
          prevEntry = entry;
        }

        resultObj[belt] = entries;
      }
    }

    return {
      Male: maleResult,
      Female: femaleResult
    };
  }

  return {
    updatedAt: new Date().toISOString(),
    gi: sortGenderMap(giMap),
    nogi: sortGenderMap(nogiMap),
  };
}
