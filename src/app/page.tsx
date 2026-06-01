import { AppShell } from "@/components/app/AppShell";
import { SiteHeader } from "@/components/app/SiteHeader";
import { SiteFooter } from "@/components/app/SiteFooter";
import { Toaster } from "@/components/common/Toast";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <div
      data-theme={BRAND.theme}
      className="flex min-h-screen flex-col overflow-x-clip bg-canvas bg-[image:var(--tex)] bg-fixed [background-size:var(--tex-size,auto)] font-sans text-ink selection:bg-accent/25"
    >
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <AppShell />
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}
