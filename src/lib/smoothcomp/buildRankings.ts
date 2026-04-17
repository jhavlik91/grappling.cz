import type { NormalizedEvent, RankingEntry, Rankings, GenderedRankings } from "@/types/smoothcomp";

const MEDAL_POINTS: Record<number, number> = {
  1: 9, // Gold
  2: 3, // Silver
  3: 1, // Bronze
};

type GenderBeltMap = Map<string, Map<string, Map<string, RankingEntry>>>;

function makeGenderBeltMap(): GenderBeltMap {
  const m: GenderBeltMap = new Map();
  m.set("Male", new Map());
  m.set("Female", new Map());
  m.set("Mixed", new Map());
  return m;
}

function accumulateCategory(
  genderBeltMap: GenderBeltMap,
  gender: string,
  belt: string,
  eventSlug: string,
  athletes: NormalizedEvent["categories"][number]["athletes"]
) {
  if (!belt || belt === "Unknown") return;
  if (gender !== "Male" && gender !== "Female" && gender !== "Mixed") return;

  const genderMap = genderBeltMap.get(gender)!;
  if (!genderMap.has(belt)) {
    genderMap.set(belt, new Map());
  }
  const athleteMap = genderMap.get(belt)!;

  for (const athlete of athletes) {
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
    if (!entry.events.includes(eventSlug)) entry.events.push(eventSlug);
    if (athlete.club) entry.club = athlete.club;
    if (athlete.country) entry.country = athlete.country;
  }
}

function sortAndRank(entries: RankingEntry[]): RankingEntry[] {
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return a.name.localeCompare(b.name);
  });

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
  return entries;
}

function genderBeltMapToRankings(map: GenderBeltMap): GenderedRankings {
  const result: GenderedRankings = { Male: {}, Female: {} };

  for (const gender of ["Male", "Female", "Mixed"] as const) {
    const gMap = map.get(gender);
    if (!gMap || gMap.size === 0) continue;

    const beltResult: Record<string, RankingEntry[]> = {};
    for (const [belt, athleteMap] of gMap.entries()) {
      const entries = Array.from(athleteMap.values());
      beltResult[belt] = sortAndRank(entries);
    }

    if (gender === "Mixed") {
      result.Mixed = beltResult;
    } else {
      result[gender] = beltResult;
    }
  }

  return result;
}

/**
 * Build aggregated rankings from a list of normalized events.
 * Produces four separate ranking tables: gi/nogi × adults/kids.
 */
export function buildRankings(events: NormalizedEvent[]): Rankings {
  const giAdults = makeGenderBeltMap();
  const nogiAdults = makeGenderBeltMap();
  const giKids = makeGenderBeltMap();
  const nogiKids = makeGenderBeltMap();

  for (const event of events) {
    for (const category of event.categories) {
      const targetMap = category.isKid
        ? (category.gi ? giKids : nogiKids)
        : (category.gi ? giAdults : nogiAdults);

      accumulateCategory(targetMap, category.gender, category.belt, event.slug, category.athletes);
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    gi: genderBeltMapToRankings(giAdults),
    nogi: genderBeltMapToRankings(nogiAdults),
    gi_kids: genderBeltMapToRankings(giKids),
    nogi_kids: genderBeltMapToRankings(nogiKids),
  };
}
