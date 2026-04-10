import type {
  ArticlePreview,
  VideoPreview,
  TournamentPreview,
  RankingEntryMini,
  ArticleDetail,
} from "@/types/content";

// ── Hero article ──
export const heroArticle: ArticlePreview = {
  slug: "gordon-ryan-adcc-2025-analyza",
  title: "Gordon Ryan a budoucnost ADCC: Kompletní analýza před turnajem roku",
  perex:
    "Největší grapplingový turnaj světa se blíží. Podívali jsme se na favority, tmavé koně a taktiky, které mohou rozhodnout o titulech v každé váhové kategorii.",
  imageUrl: "/images/hero-grappling.jpg",
  tag: "ANALÝZA",
  author: "Jan Novák",
  date: "10. dubna 2026",
  readingTime: 8,
};

// ── Feed articles ──
export const feedArticles: ArticlePreview[] = [
  {
    slug: "cesky-grappling-2026-roste",
    title: "Český grappling roste: Rekordní počet závodníků na národním šampionátu",
    perex:
      "Letošní mistrovství ČR v grapplingových sportech zaznamenalo historicky nejvyšší účast. Co za tím stojí?",
    imageUrl: "/images/feed-1.jpg",
    tag: "ZPRÁVY",
    author: "Petra Dvořáková",
    date: "9. dubna 2026",
    readingTime: 5,
  },
  {
    slug: "rozhovor-michal-pesek",
    title: 'Michal Pešek: „BJJ mě naučilo pokoru i disciplínu"',
    perex:
      "Rozhovor s jedním z nejúspěšnějších českých BJJ závodníků o jeho cestě od white beltu po černý pás.",
    imageUrl: "/images/feed-2.jpg",
    tag: "ROZHOVOR",
    author: "Jan Novák",
    date: "8. dubna 2026",
    readingTime: 12,
  },
  {
    slug: "guard-passing-tipy",
    title: "5 tipů pro efektivní guard passing, které okamžitě zlepší vaši hru",
    perex:
      "Tyto osvědčené techniky a drill vám pomohou překonat i tu nejlepší guardu.",
    imageUrl: "/images/feed-3.jpg",
    tag: "TIPY A TRIKY",
    author: "Tomáš Král",
    date: "7. dubna 2026",
    readingTime: 6,
  },
  {
    slug: "turnaj-brno-open-vysledky",
    title: "Brno Open 2026: Kompletní výsledky a to nejlepší z turnaje",
    perex:
      "Turnaj přinesl skvělé zápasy a několik překvapivých výsledků. Přinášíme kompletní přehled.",
    imageUrl: "/images/feed-4.jpg",
    tag: "TURNAJ",
    author: "Petra Dvořáková",
    date: "6. dubna 2026",
    readingTime: 4,
  },
  {
    slug: "heel-hook-pravidla-ibjjf",
    title: "Heel hook v IBJJF: Nová pravidla mění hru od základů",
    perex:
      "IBJJF uvolnilo pravidla pro heel hooky na hnědých a černých pásech. Jak to změní turnajovou strategii?",
    imageUrl: "/images/feed-5.jpg",
    tag: "ANALÝZA",
    author: "Jan Novák",
    date: "5. dubna 2026",
    readingTime: 7,
  },
  {
    slug: "jak-zacit-s-bjj",
    title: "Průvodce pro začátečníky: Jak začít s BJJ a na co se připravit",
    perex:
      "Vše co potřebujete vědět před prvním tréninkem — vybavení, etiketa, co očekávat.",
    imageUrl: "/images/feed-6.jpg",
    tag: "TIPY A TRIKY",
    author: "Tomáš Král",
    date: "4. dubna 2026",
    readingTime: 9,
  },
  {
    slug: "dagestan-wrestlers-bjj",
    title: "Proč zápasnící z Dagestánu dominují i v BJJ?",
    perex:
      "Analyzujeme fenomén, který přetváří moderní grappling: zápasnický background jako klíč k úspěchu.",
    imageUrl: "/images/feed-7.jpg",
    tag: "ANALÝZA",
    author: "Petra Dvořáková",
    date: "3. dubna 2026",
    readingTime: 10,
  },
  {
    slug: "predturnajova-priprava",
    title: "Předturnajová příprava: 4 týdny do soutěže",
    perex:
      "Optimální tréninková struktura, výživa a regenerace pro závodníky všech úrovní.",
    imageUrl: "/images/feed-8.jpg",
    tag: "TECHNIKA",
    author: "Tomáš Král",
    date: "2. dubna 2026",
    readingTime: 8,
  },
];

// ── Videos ──
export const feedVideos: VideoPreview[] = [
  {
    slug: "breakdown-meregali-vs-diniz",
    title: "Match Breakdown: Meregali vs. Diniz – krok za krokem",
    thumbnailUrl: "/images/video-1.jpg",
    duration: "18:42",
    tag: "VIDEO",
    date: "9. dubna 2026",
  },
  {
    slug: "top-5-submissions-brno-open",
    title: "Top 5 submissions z Brno Open 2026",
    thumbnailUrl: "/images/video-2.jpg",
    duration: "8:15",
    tag: "VIDEO",
    date: "7. dubna 2026",
  },
  {
    slug: "rozhovor-podcast-peszek",
    title: "Podcast #14: Michal Pešek o ADCC přípravě",
    thumbnailUrl: "/images/video-3.jpg",
    duration: "52:30",
    tag: "ROZHOVOR",
    date: "5. dubna 2026",
  },
];

// ── Tournaments ──
export const feedTournaments: TournamentPreview[] = [
  {
    slug: "czech-open-2026",
    name: "Czech Open 2026",
    date: "15. května 2026",
    location: "Praha, Česko",
    imageUrl: "/images/tournament-1.jpg",
    competitorCount: 340,
    status: "upcoming",
  },
  {
    slug: "brno-open-2026",
    name: "Brno Open 2026",
    date: "6. dubna 2026",
    location: "Brno, Česko",
    imageUrl: "/images/tournament-2.jpg",
    competitorCount: 185,
    status: "completed",
  },
];

// ── Mini rankings ──
export const miniRankings: RankingEntryMini[] = [
  { rank: 1, name: "Michal Pešek", club: "Prague BJJ", points: 1420 },
  { rank: 2, name: "Jakub Krejčí", club: "Brno Fight Club", points: 1280 },
  { rank: 3, name: "Tomáš Malý", club: "Ostrava Grappling", points: 1150 },
  { rank: 4, name: "David Horák", club: "Liberec MMA", points: 980 },
  { rank: 5, name: "Martin Šimek", club: "Prague BJJ", points: 920 },
];

// ── Trending ──
export const trendingArticles: ArticlePreview[] = [
  feedArticles[1],
  feedArticles[4],
  feedArticles[6],
  feedArticles[3],
];

// ── Full article detail (for /zpravy/[slug]) ──
export const sampleArticleDetail: ArticleDetail = {
  slug: "gordon-ryan-adcc-2025-analyza",
  title: "Gordon Ryan a budoucnost ADCC: Kompletní analýza před turnajem roku",
  subtitle: "Co nás čeká na největším NO-GI turnaji světa?",
  perex:
    "Největší grapplingový turnaj světa se blíží. Podívali jsme se na favority, tmavé koně a taktiky, které mohou rozhodnout o titulech v každé váhové kategorii.",
  imageUrl: "/images/hero-grappling.jpg",
  tag: "ANALÝZA",
  author: "Jan Novák",
  authorImageUrl: "/images/author.jpg",
  date: "10. dubna 2026",
  readingTime: 8,
  body: [
    {
      type: "paragraph",
      text: "ADCC je bezesporu nejvýznamnější turnaj v submission grapplingové komunitě. Od svého založení v roce 1998 představuje vrchol No-Gi soutěžení a přitahuje nejlepší závodníky z celého světa — od pure grapplerů přes zápasníky po judisty a MMA bojovníky.",
    },
    {
      type: "heading",
      text: "Formát turnaje a pravidla",
    },
    {
      type: "paragraph",
      text: "ADCC se od ostatních turnajů liší unikátním pravidlovým setetm. V prvních minutách zápasu nejsou body za pozice — soutěžící musí hledat submission. Teprve v druhé polovině zápasu se začínají počítat body, což vytváří fascinující dynamiku mezi agresivním útokem a strategickým vyčkáváním.",
    },
    {
      type: "pullquote",
      text: "ADCC je jediný turnaj, kde můžete vidět, jak se střetnou nejrůznější grapplingové styly na jedné podložce.",
      attribution: "André Galvão, vícenásobný šampion ADCC",
    },
    {
      type: "paragraph",
      text: "Gordon Ryan vstoupí do turnaje jako absolutní favorit v superváze i absolutní kategorii. Jeho dominance v posledních letech je bezprecedentní — od ADCC 2022 neprohrál jediný zápas a jeho kontrola pozic je na úrovni, kterou dosud žádný závodník nepředvedl.",
    },
    {
      type: "image",
      url: "/images/article-inline.jpg",
      caption: "Gordon Ryan během tréninku v B-Team (foto: FloGrappling)",
    },
    {
      type: "heading",
      text: "Analýza váhových kategorií",
    },
    {
      type: "paragraph",
      text: "V lehké váze se očekává napínavý souboj mezi Mikey Musumecim a Diogo Reisem. Musumeci přechází z Gi, kde byl absolutní dominantní silou, do No-Gi scény s ambicí dokázat, že jeho berimbolo a back attack systém funguje i bez kimona.",
    },
    { type: "ad" },
    {
      type: "paragraph",
      text: "Střední váha tradičně přináší nejkvalitnější zápasy. Letos zde uvidíme řadu závodníků, kteří mají reálnou šanci na titul — od zkušených veteránů po mladé talenty, kteří se probojovali přes trials.",
    },
    {
      type: "heading",
      text: "Čeští závodníci na ADCC",
    },
    {
      type: "paragraph",
      text: "Česká republika má v kvalifikacích stále silnější zastoupení. Několik českých závodníků se dostalo do evropských trials a jejich výkony ukazují, že česká grapplingová scéna roste obrovským tempem. Očekáváme, že v příštích ročnících uvidíme českého závodníka přímo v hlavním turnaji.",
    },
    {
      type: "pullquote",
      text: "Za poslední tři roky se úroveň českého grapplingů posunula o celou generaci dopředu.",
      attribution: "Michal Pešek, český BJJ reprezentant",
    },
    {
      type: "paragraph",
      text: "Závěrem lze říci, že letošní ADCC slibuje být jedním z nejnapínavějších ročníků v historii. Rivalita mezi Ryanem a jeho vyzyvateli, návrat legend i nástup nové generace — to vše vytváří ingredience pro nezapomenutelný turnaj.",
    },
  ],
  relatedArticles: feedArticles.slice(0, 4),
};

// Helper to find article detail by slug — in production this would be CMS/DB
export function getArticleBySlug(slug: string): ArticleDetail | null {
  if (slug === sampleArticleDetail.slug) return sampleArticleDetail;
  // For other slugs, generate a synthetic article from feedArticles
  const preview = feedArticles.find((a) => a.slug === slug);
  if (!preview) return null;
  return {
    ...preview,
    subtitle: "",
    authorImageUrl: "/images/author.jpg",
    body: [
      { type: "paragraph", text: preview.perex },
      {
        type: "paragraph",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      },
      {
        type: "heading",
        text: "Hlavní body",
      },
      {
        type: "paragraph",
        text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
      { type: "ad" },
      {
        type: "paragraph",
        text: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit.",
      },
    ],
    relatedArticles: feedArticles.filter((a) => a.slug !== slug).slice(0, 4),
  };
}
