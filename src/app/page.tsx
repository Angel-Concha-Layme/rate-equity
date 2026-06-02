import { LandingHero } from "@/components/app/LandingHero";
import { SiteFooter } from "@/components/app/SiteFooter";

// "/" es el home: la landing. La calculadora vive en "/comparison".
export default function Home() {
  return (
    <>
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <LandingHero />
      </main>
      <SiteFooter />
    </>
  );
}
