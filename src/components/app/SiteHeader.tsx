import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/common/Wordmark";

/** Slim global brand bar shown on every phase (landing, wizard, dashboard). */
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Wordmark size="md" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-subtle">
          {BRAND.locale}
        </span>
      </div>
    </header>
  );
}
