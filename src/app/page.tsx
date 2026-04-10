import Link from "next/link";



const FEATURES = [
  {
    icon: "🏆",
    title: "ŽEBŘÍČKY",
    text: "Žebříčky, pásek rozděleny. Dynamická rozpoložená jsou poté sledovány a jejich sledované výsledky agregací závodníků.",
  },
  {
    icon: "📊",
    title: "STATISTIKY",
    text: "Statistiky a shrnutí Českých závodníků mohou být sledovány do poslední signifikace.",
  },
  {
    icon: "🔄",
    title: "AUTOMATICKÉ AKTUALIZACE",
    text: "Automatická aktualizace dat automatickým systémem ottometříky udržuje vše aktuální.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO: The Arena ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-[#0D0D0D] to-[#0D0D0D]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-purple-600/10 blur-[128px] glow-pulse" />
        <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-[#84CC16]/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-7xl">
              Sleduj výsledky
              <br />
              <span className="bg-gradient-to-r from-[#A855F7] to-[#84CC16] bg-clip-text text-transparent">
                českých zápasníků
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-gray-400 leading-relaxed">
              Přehled sledovaných turnajů zápasníků a jejich českého
              grapplingového sportu – sportovního sportu.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/rankings"
                className="btn-neon rounded-xl px-7 py-3.5 text-sm"
              >
                ZOBRAZIT ŽEBŘÍČEK
              </Link>
              <Link
                href="#armoury"
                className="btn-outline rounded-xl px-7 py-3.5 text-sm"
              >
                ARMOURY
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* ─── FEATURES ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass glass-hover rounded-2xl p-6 transition-all"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}

