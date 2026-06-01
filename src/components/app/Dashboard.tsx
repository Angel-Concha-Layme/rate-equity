"use client";

import { getStrategy, type Resultado, type ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { EquivalenceBanner } from "@/components/app/dashboard/EquivalenceBanner";
import { ModalityCard } from "@/components/app/dashboard/ModalityCard";
import { WaterfallPanel } from "@/components/app/dashboard/WaterfallPanel";
import { RadarPanel } from "@/components/app/dashboard/RadarPanel";
import { DetailTable } from "@/components/app/dashboard/DetailTable";
import { MonthlyTable } from "@/components/app/dashboard/MonthlyTable";

/**
 * Componente de la derecha: un único grid de 12 columnas donde cada tarjeta es
 * un panel independiente (basado en el `Card` común). Las alturas son naturales
 * y cada fila encaja según su contenido; no se fuerza coincidencia con la sidebar.
 */
export function Dashboard({
  tuyo,
  equivalente,
  input,
  fx,
}: {
  tuyo: Resultado;
  equivalente: Resultado;
  input: ScenarioInput;
  fx: FxState;
}) {
  const money = getStrategy(input.pais).money;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <EquivalenceBanner
        tuyo={tuyo}
        equivalente={equivalente}
        input={input}
        fx={fx}
        className="lg:col-span-12"
      />

      <ModalityCard res={tuyo} color="var(--c1)" etiqueta="Tú" active money={money} className="lg:col-span-4" />
      <WaterfallPanel res={tuyo} money={money} className="lg:col-span-8" />

      <ModalityCard
        res={equivalente}
        color="var(--c2)"
        etiqueta="Equivalente"
        active={false}
        money={money}
        className="lg:col-span-4"
      />
      <WaterfallPanel res={equivalente} money={money} className="lg:col-span-8" />

      <MonthlyTable tuyo={tuyo} equivalente={equivalente} pais={input.pais} className="lg:col-span-12" />

      {/* Radar (cuadrado, lado = alto de la tabla) + tabla que ocupa el resto */}
      <div className="flex flex-col gap-4 lg:col-span-12 lg:flex-row lg:items-stretch">
        <RadarPanel
          modalidades={[tuyo, equivalente]}
          money={money}
          className="lg:aspect-square lg:shrink-0"
        />
        <DetailTable tuyo={tuyo} equivalente={equivalente} pais={input.pais} className="lg:min-w-0 lg:flex-1" />
      </div>
    </div>
  );
}
