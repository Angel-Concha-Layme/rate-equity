import type { Metadata } from "next";
import { LandingHero } from "@/components/app/LandingHero";
import { Faq } from "@/components/app/Faq";
import { SiteFooter } from "@/components/app/SiteFooter";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// "/" is the home page: the landing. The calculator lives at "/comparison".
export default function Home() {
  return (
    <>
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <LandingHero />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
