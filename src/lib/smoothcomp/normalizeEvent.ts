import type {
  SmoothcompResultsResponse,
  SmoothcompEventResult,
  NormalizedEvent,
  NormalizedCategory,
  NormalizedAthlete,
} from "@/types/smoothcomp";

/**
 * Parse the Smoothcomp group name to extract category metadata using robust keyword scanning.
 * Example old: "Gi Juveniles / Adults / Male / Adult (18+) / Blue / Feather (Up to 72.60 kg)"
 * Example new: "Men No-GI / Beginner / -66 kg"
 * Example new: "Girls Junior GI / -55 kg / 13-14 years / Professional"
 */
function parseGroupName(name: string) {
  const norm = name.toLowerCase();

  // GI or No-GI
  const gi = !(norm.includes("no gi") || norm.includes("nogi") || norm.includes("no-gi"));

  // Skill / Belt
  const beltsAndSkills = ["white", "blue", "purple", "brown", "black", "beginner", "intermediate", "advanced", "professional", "amateur", "elite"];
  let belt = "Unknown";
  for (const b of beltsAndSkills) {
    // Look for exact word match
    if (new RegExp(`\\b${b}\\b`).test(norm)) {
      const matchedBelt = b.charAt(0).toUpperCase() + b.slice(1);
      
      if (matchedBelt === "Intermediate" || matchedBelt === "Advanced") {
        belt = "Advanced";
      } else if (matchedBelt === "Professional" || matchedBelt === "Elite") {
        belt = "Elite";
      } else if (matchedBelt === "Purple" || matchedBelt === "Brown" || matchedBelt === "Black") {
        belt = "Purple / Brown / Black";
      } else {
        belt = matchedBelt;
      }
      
      break;
    }
  }

  // Weight
  const weightMatch = norm.match(/(?:up to |-)?\d{2,3}(?:\.\d+)?\s*k?g/i);
  const weight = weightMatch ? weightMatch[0] : "Unknown";

  // Gender
  let gender = "Unknown";
  if (norm.match(/\b(male|men|mens|boys)\b/)) gender = "Male";
  if (norm.match(/\b(female|women|womens|girls)\b/)) gender = "Female";

  // Age Group
  let ageGroup = "Unknown";
  if (norm.match(/\badults?\b/)) ageGroup = "Adult";
  if (norm.match(/\bmasters?\b/)) ageGroup = "Master";
  if (norm.match(/\bjuveniles?\b/)) ageGroup = "Juvenile";
  const ageMatch = norm.match(/\b\d{1,2}-\d{1,2}\syears?\b/);
  if (ageMatch) ageGroup = ageMatch[0];

  return { gi, gender, ageGroup, belt, weight };
}

function normalizeAthlete(
  top: { placement: number; target: { fullname?: string; country?: string; user_id?: number }; club?: { name?: string } }
): NormalizedAthlete {
  return {
    name: top.target.fullname ?? "Unknown",
    country: top.target.country ?? "",
    club: top.club?.name ?? "",
    placement: top.placement as 1 | 2 | 3,
    userId: top.target.user_id,
  };
}

export function normalizeEvent(
  raw: SmoothcompResultsResponse,
  meta: { slug: string; name: string; date: string; country: string }
): NormalizedEvent {
  const categories: NormalizedCategory[] = (raw.eventResults ?? [])
    .filter((r: SmoothcompEventResult) => r.published && r.top3?.length > 0)
    .filter((r: SmoothcompEventResult) => !r.group.name.toLowerCase().includes("kid"))
    .map((r: SmoothcompEventResult) => {
      const parsed = parseGroupName(r.group.name);
      return {
        name: r.group.name,
        ...parsed,
        athletes: r.top3.map(normalizeAthlete),
      };
    });

  return {
    slug: meta.slug,
    name: meta.name,
    date: meta.date,
    country: meta.country,
    categories,
  };
}
