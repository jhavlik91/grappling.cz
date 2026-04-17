import type {
  SmoothcompResultsResponse,
  SmoothcompEventResult,
  NormalizedEvent,
  NormalizedCategory,
  NormalizedAthlete,
} from "@/types/smoothcomp";

/**
 * Non-grappling sport discipline names (whole-word match).
 * Used for global keyword scan.
 */
const NON_GRAPPLING_PATTERN =
  /\b(judo|box(ing)?|karate|taekwondo|sambo|muay\s*thai|kickbox(ing)?|kicklight|lightcontact|k1|mma)\b/i;

/**
 * Czech multi-sport events (CFS, etc.) put the discipline as the first segment
 * before " / ". These are never grappling — filter the entire category.
 */
const NON_GRAPPLING_FIRST_SEGMENTS = new Set([
  "fighting",
  "gala k1",
  "gala mma",
  "mma light",
  "rumble - stužkovaná",
  "kids run",
  "hard kata",
  "self defense creativ",
  "self defense realistic",
  "self defense",
]);

function isNonGrappling(name: string): boolean {
  if (NON_GRAPPLING_PATTERN.test(name)) return true;
  const firstSegment = name.split("/")[0].trim().toLowerCase();
  return NON_GRAPPLING_FIRST_SEGMENTS.has(firstSegment);
}

/**
 * Returns true if this category belongs to a child athlete (under ~18 yrs).
 * Detection order matters: explicit adult markers win first, then kid markers.
 */
function isKidCategory(norm: string): boolean {
  // Explicit adult age indicators — not a kid
  if (/adult\s*\(18\+\)/.test(norm)) return false;
  if (/\bmaster/.test(norm)) return false;
  if (/\bseniors?\b/.test(norm)) return false;
  if (/\bexecutives?\b/.test(norm)) return false;
  if (/\bdospěl/.test(norm)) return false;  // Czech "dospělí" = adults
  if (/\bveteráni?\b/.test(norm)) return false;
  if (/\+18\b/.test(norm)) return false;
  if (/\+40\b/.test(norm)) return false;

  // Czech kid indicators
  if (/\bděti\b/.test(norm)) return true;       // "Děti" = children (U12)
  if (/\bjunioři?\b/.test(norm)) return true;   // "Junioři" = juniors (U15) — NOT BJJ "Juniors" which already matched
  if (/\bkadeti?\b/.test(norm)) return true;    // "Kadeti" = cadets (U18)
  if (/\bu12\b/.test(norm)) return true;
  if (/\bu15\b/.test(norm)) return true;
  if (/\bu18\b/.test(norm)) return true;

  // English kid indicators
  if (/\bkids?\b/.test(norm)) return true;
  if (/\bpre[\s-]?teen\b/.test(norm)) return true;
  if (/\bjuniors?\b/.test(norm)) return true;
  if (/\bteen\b/.test(norm)) return true;
  if (/\bjuvenile\b/.test(norm)) return true;
  if (/\blittle\b/.test(norm)) return true;

  // Numeric age ranges — kid if max age < 18
  const ageMatch = norm.match(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years?|yrs)\b/);
  if (ageMatch && parseInt(ageMatch[2]) < 18) return true;

  // Czech age ranges like "7-8 let", "9-12 let"
  const czAgeMatch = norm.match(/\b(\d{1,2})-(\d{1,2})\s*let\b/);
  if (czAgeMatch && parseInt(czAgeMatch[2]) < 18) return true;

  return false;
}

/**
 * Parse the Smoothcomp group name to extract category metadata using robust keyword scanning.
 *
 * Supports both English BJJ formats and Czech multi-sport event formats:
 *   English: "Gi Juveniles - Adults / Male / Adult (18+) / Blue / Feather (Up to 72.60 kg)"
 *   Czech:   "Grappling Gi / U12 Děti chlapci / -25 kg"
 *            "Grappling NoGi / +18 Dospělí muži / -75 kg"
 */
function parseGroupName(name: string) {
  const norm = name.toLowerCase();

  // GI or No-GI
  const gi = !(norm.includes("no gi") || norm.includes("nogi") || norm.includes("no-gi"));

  // Belt / Skill level — ordered from most specific to least
  const allBelts = [
    "purple", "brown", "black",
    "orange",
    "blue",
    "green",
    "yellow",
    "gray", "grey",
    "white",
    "professional",
    "elite",
    "advanced", "intermediate",
    "beginner",
    "amateur",
  ];

  let belt = "Unknown";
  for (const b of allBelts) {
    if (new RegExp(`\\b${b}\\b`).test(norm)) {
      if (b === "intermediate" || b === "advanced") {
        belt = "Advanced";
      } else if (b === "professional" || b === "elite") {
        belt = "Elite";
      } else if (b === "purple" || b === "brown" || b === "black") {
        belt = "Purple / Brown / Black";
      } else if (b === "grey") {
        belt = "Gray";
      } else {
        belt = b.charAt(0).toUpperCase() + b.slice(1);
      }
      break;
    }
  }

  // Weight — handles "Up to 72.60 kg", "-66 kg", "+100 kg", "90+ kg", "-27,20 kg"
  const weightMatch = norm.match(/(?:up to |[+\-])?\d{2,3}(?:[.,]\d+)?\s*kg/i);
  const weight = weightMatch ? weightMatch[0] : "Unknown";

  // Gender — English and Czech keywords
  let gender = "Unknown";
  if (norm.match(/\b(male|men|mens|boys|chlapci|chlapec)\b/)) gender = "Male";
  if (norm.match(/\b(female|women|womens|girls|dívky|dívka)\b/)) gender = "Female";
  // Czech: "muži" = men, "ženy" = women
  if (/\bmuži\b|\bmuž\b/.test(norm)) gender = "Male";
  if (/\bženy\b|\bžena\b/.test(norm)) gender = "Female";
  if (norm.match(/\bmixed\b/)) gender = "Mixed";

  // Age Group — English and Czech
  let ageGroup = "Unknown";

  const masterMatch = norm.match(/masters?\s*(\d+)\+/);
  if (masterMatch) {
    ageGroup = `Master ${masterMatch[1]}+`;
  } else if (norm.match(/\bmaster\s*\d*\s*\(\d+\+\)/)) {
    ageGroup = "Master";
  } else if (norm.match(/\bseniors?\s*\(\d+\+\)/)) {
    ageGroup = "Senior";
  } else if (norm.match(/\bexecutives?\s*\(\d+\+\)/)) {
    ageGroup = "Executive";
  } else if (norm.match(/\bveteráni?\b/) || norm.match(/\+40\b/)) {
    ageGroup = "Master 40+";
  } else if (norm.match(/\badult\s*\(18\+\)/) || norm.match(/\bdospěl/) || norm.match(/\+18\b/)) {
    ageGroup = "Adult";
  } else {
    // Kids age groups
    const ageRangeMatch = norm.match(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years?|yrs)\b/);
    const czAgeMatch = norm.match(/\b(\d{1,2})-(\d{1,2})\s*let\b/);
    if (ageRangeMatch) {
      ageGroup = `${ageRangeMatch[1]}-${ageRangeMatch[2]} years`;
    } else if (czAgeMatch) {
      ageGroup = `${czAgeMatch[1]}-${czAgeMatch[2]} years`;
    } else if (norm.match(/\bpre[\s-]?teen\b/)) {
      ageGroup = "10-11 years";
    } else if (norm.match(/\blittle\s*kids?\b/)) {
      ageGroup = "8-9 years";
    } else if (norm.match(/\bteen\b/)) {
      ageGroup = "14-15 years";
    } else if (norm.match(/\bu12\b/) || norm.match(/\bděti\b/)) {
      ageGroup = "Under 12";
    } else if (norm.match(/\bu15\b/) || norm.match(/\bjunioři?\b/)) {
      ageGroup = "Under 15";
    } else if (norm.match(/\bu18\b/) || norm.match(/\bkadeti?\b/)) {
      ageGroup = "Under 18";
    } else if (norm.match(/\bjuvenile\b/) || norm.match(/\bjuniors?\b/)) {
      ageGroup = "Juvenile";
    } else if (norm.match(/\badults?\b/)) {
      ageGroup = "Adult";
    }
  }

  const isKid = isKidCategory(norm);

  // Kids with no explicit gender → Mixed
  if (isKid && gender === "Unknown") gender = "Mixed";

  // Belt mapping for kids:
  //   Color belts (Gray/White) → Beginner
  //   Color belts (Yellow/Orange/Green/Blue/Elite) → Advanced
  // For Czech age-based categories with no belt, derive from age group:
  //   U12/Děti → Beginner
  //   U15/Junioři, U18/Kadeti → Advanced
  if (isKid) {
    if (belt === "Gray" || belt === "White") {
      belt = "Beginner";
    } else if (belt === "Yellow" || belt === "Orange" || belt === "Green" || belt === "Blue" || belt === "Elite") {
      belt = "Advanced";
    } else if (belt === "Unknown") {
      if (ageGroup === "Under 12") belt = "Beginner";
      else if (ageGroup === "Under 15" || ageGroup === "Under 18" || ageGroup === "Juvenile") belt = "Advanced";
    }
  }

  return { gi, gender, ageGroup, belt, weight, isKid };
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
    .filter((r: SmoothcompEventResult) => !isNonGrappling(r.group.name))
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
