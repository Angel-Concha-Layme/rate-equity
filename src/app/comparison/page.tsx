import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparisonShell } from "@/components/app/ComparisonShell";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Comparación · ${BRAND.name}`,
};

// "/comparison" es la calculadora (wizard + dashboard). Sin footer: el footer
// vive solo en el home. ComparisonShell usa useSearchParams, de ahí el Suspense.
export default function ComparisonPage() {
  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <ComparisonShell />
      </Suspense>
    </main>
  );
}
