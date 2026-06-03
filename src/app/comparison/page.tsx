import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparisonShell } from "@/components/app/ComparisonShell";

export const metadata: Metadata = {
  title: "Comparación",
  description:
    "Tu comparación de valor económico real entre empleo en planilla e independiente: liquidez, beneficios, costo para la empresa, impuestos y valor por hora.",
  alternates: { canonical: "/comparison" },
};

// ComparisonShell reads useSearchParams, so it needs a Suspense boundary.
export default function ComparisonPage() {
  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <ComparisonShell />
      </Suspense>
    </main>
  );
}
