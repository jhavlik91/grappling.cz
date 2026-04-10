import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { SideBanners } from "@/components/layout/SideBanners";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Grappling.cz — České výsledky v grapplingových sportech",
    template: "%s | Grappling.cz",
  },
  description:
    "Výsledky a žebříčky českých závodníků v BJJ, submission grapplingů a dalších grapplingových sportech.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <SideBanners>
            <main className="flex-1 pb-20 sm:pb-0">{children}</main>
          </SideBanners>
          <SiteFooter />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
