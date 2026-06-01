import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/common/Wordmark";

/** Slim global footer: brand lockup + disclaimer. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="flex flex-col items-start justify-between gap-3 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Wordmark size="sm" />
        <p className="text-xs text-subtle">
          {BRAND.tagline}. Cifras referenciales, no asesoría tributaria. © 2026 {BRAND.name}.
        </p>
      </div>
    </footer>
  );
}
