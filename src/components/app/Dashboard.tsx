"use client";

import { getStrategy, type Result, type ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { EquivalenceBanner } from "@/components/app/dashboard/EquivalenceBanner";
import { ModalityCard } from "@/components/app/dashboard/ModalityCard";
import { WaterfallPanel } from "@/components/app/dashboard/WaterfallPanel";
import { RadarPanel } from "@/components/app/dashboard/RadarPanel";
import { DetailTable } from "@/components/app/dashboard/DetailTable";
import { MonthlyTable } from "@/components/app/dashboard/MonthlyTable";

/**
 * Right-hand component: a single 12-column grid where each card is an
 * independent panel (based on the shared `Card`). Heights are natural and each
 * row fits its content; no forced match with the sidebar.
 */
export function Dashboard({
  yours,
  equivalent,
  input,
  fx,
}: {
  yours: Result;
  equivalent: Result;
  input: ScenarioInput;
  fx: FxState;
}) {
  const money = getStrategy(input.country).money;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 3xl:grid-cols-15">
      <EquivalenceBanner
        yours={yours}
        equivalent={equivalent}
        input={input}
        fx={fx}
        className="lg:col-span-12 3xl:col-span-15"
      />

      <ModalityCard res={yours} color="var(--c1)" label="Tú" active money={money} className="lg:col-span-3" />
      <WaterfallPanel res={yours} money={money} className="lg:col-span-9 3xl:col-span-12" />

      <ModalityCard
        res={equivalent}
        color="var(--c2)"
        label="Equivalente"
        active={false}
        money={money}
        className="lg:col-span-3"
      />
      <WaterfallPanel res={equivalent} money={money} className="lg:col-span-9 3xl:col-span-12" />

      <MonthlyTable
        yours={yours}
        equivalent={equivalent}
        country={input.country}
        className="lg:col-span-12 3xl:col-span-15"
      />

      {/* Radar (square, side = table height) + table taking the rest */}
      <div className="flex flex-col gap-4 lg:col-span-12 3xl:col-span-15 lg:flex-row lg:items-stretch">
        <RadarPanel
          modalities={[yours, equivalent]}
          money={money}
          className="lg:aspect-square lg:shrink-0"
        />
        <DetailTable yours={yours} equivalent={equivalent} country={input.country} className="lg:min-w-0 lg:flex-1" />
      </div>
    </div>
  );
}
