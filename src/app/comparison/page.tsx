import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparisonShell } from "@/components/app/ComparisonShell";

export const metadata: Metadata = {
  title: "Comparación",
  description:
    "Tu comparación de valor económico real entre empleo en planilla e independiente: liquidez, beneficios, costo para la empresa, impuestos y valor por hora.",
  // canonical sin el query param ?ejemplo para no duplicar contenido.
  alternates: { canonical: "/comparison" },
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
