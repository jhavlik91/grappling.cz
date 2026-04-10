export function SideBanners({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex w-full flex-col items-center">
      {/* 
        Skin / Branding Ad Placeholder 
        This sits behind the main content. On a real site, it uses a large background image (e.g. 1920x800)
        and spans the entire width. The clickable area exists only on the sides where the content doesn't cover it.
      */}
      <a 
        href="#reklama" 
        className="hidden xl:block absolute inset-x-0 top-0 h-[800px] -z-20 bg-[#151515] border-b border-white/5"
        aria-label="Reklamní banner"
        style={{
          // For a real banner, you would use:
          // backgroundImage: "url('/placeholder-skin.jpg')",
          // backgroundPosition: "top center",
          backgroundSize: "cover"
        }}
      >
        <div className="mx-auto relative h-full w-full max-w-[1920px]">
          {/* Left Side Label */}
          <div className="absolute left-[8%] top-[150px] flex flex-col items-center text-gray-700">
             <span className="text-2xl font-black uppercase tracking-widest">Brand</span>
             <span className="text-sm">Skin Banner</span>
          </div>
          {/* Right Side Label */}
          <div className="absolute right-[8%] top-[150px] flex flex-col items-center text-gray-700">
             <span className="text-2xl font-black uppercase tracking-widest">Brand</span>
             <span className="text-sm">Skin Banner</span>
          </div>
        </div>
      </a>

      {/* Main content wrapper - ensures solid background over the banner */}
      {/* 1280px matches max-w-7xl. The shadow makes it pop against the skin banner. */}
      <div className="w-full max-w-7xl bg-[#0D0D0D] shadow-[0_0_80px_rgba(0,0,0,0.8)] z-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
