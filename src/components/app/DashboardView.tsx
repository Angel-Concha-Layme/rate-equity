"use client";

import type { Resultado, ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { Sidebar } from "@/components/app/Sidebar";
import { Dashboard } from "@/components/app/Dashboard";

/**
 * Vista principal: compone el panel lateral y el contenido del dashboard en un
 * grid de dos columnas. El track de contenido usa minmax(0,1fr) y min-w-0 para
 * que nada empuje el ancho del layout (sin desbordes horizontales).
 */
export function DashboardView({
  input,
  patch,
  fx,
  tuyo,
  equivalente,
  seguroSugerido,
  onReabrirWizard,
  onReset,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  fx: FxState;
  tuyo: Resultado;
  equivalente: Resultado;
  seguroSugerido: number;
  onReabrirWizard: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-0">
      <Sidebar
        input={input}
        patch={patch}
        fx={fx}
        seguroSugerido={seguroSugerido}
        onReabrirWizard={onReabrirWizard}
        onReset={onReset}
      />
      <div className="min-w-0 lg:py-5">
        <Dashboard tuyo={tuyo} equivalente={equivalente} input={input} fx={fx} />
      </div>
    </div>
  );
}
