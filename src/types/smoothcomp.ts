export type SmoothcompPlacement = 1 | 2 | 3;

export type SmoothcompTarget = {
  firstname?: string;
  lastname?: string;
  fullname?: string;
  country?: string;
  country_human?: string;
  logo_image?: string;
  user_id?: number;
  hide_public_profile?: number;
};

export type SmoothcompClub = {
  id?: number;
  name?: string;
};

export type SmoothcompTopResult = {
  id: number;
  classname?: string;
  placement: SmoothcompPlacement;
  club?: SmoothcompClub;
  target: SmoothcompTarget;
  affiliation: string | null;
};

export type SmoothcompGroup = {
  name: string;
  label: string | null;
};

export type SmoothcompBracket = {
  id: number;
};

export type SmoothcompEventResult = {
  id: number;
  published: boolean;
  group: SmoothcompGroup;
  bracket: SmoothcompBracket;
  canShowBracket: number;
  placements: number;
  top3: SmoothcompTopResult[];
  after3: SmoothcompTopResult[];
  slugName: string;
};

export type SmoothcompResultsResponse = {
  eventResults: SmoothcompEventResult[];
};

// --- Normalized types for our app ---

export type NormalizedAthlete = {
  name: string;
  country: string;
  club: string;
  placement: SmoothcompPlacement;
  userId?: number;
};

export type NormalizedCategory = {
  name: string;
  gi: boolean;
  gender: string;
  ageGroup: string;
  belt: string;
  weight: string;
  athletes: NormalizedAthlete[];
};

export type NormalizedEvent = {
  slug: string;
  name: string;
  date: string;
  country: string;
  categories: NormalizedCategory[];
};

export type RankingEntry = {
  name: string;
  country: string;
  club: string;
  belt: string;
  points: number;
  gold: number;
  silver: number;
  bronze: number;
  events: string[];
  rank: number;
};

export type GenderedRankings = {
  Male: Record<string, RankingEntry[]>;
  Female: Record<string, RankingEntry[]>;
};

export type Rankings = {
  updatedAt: string;
  gi: GenderedRankings;
  nogi: GenderedRankings;
};
