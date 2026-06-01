"use client";

import type { Result, ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { Sidebar } from "@/components/app/Sidebar";
import { Dashboard } from "@/components/app/Dashboard";

/**
 * Main view: composes the side panel and the dashboard content in a two-column
 * grid. The content track uses minmax(0,1fr) and min-w-0 so nothing pushes the
 * layout width (no horizontal overflow).
 */
export function DashboardView({
  input,
  patch,
  fx,
  yours,
  equivalent,
  suggestedInsurance,
  onReopenWizard,
  onReset,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  fx: FxState;
  yours: Result;
  equivalent: Result;
  suggestedInsurance: number;
  onReopenWizard: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:py-0">
      <Sidebar
        input={input}
        patch={patch}
        fx={fx}
        suggestedInsurance={suggestedInsurance}
        onReopenWizard={onReopenWizard}
        onReset={onReset}
      />
      <div className="min-w-0 lg:py-5">
        <Dashboard yours={yours} equivalent={equivalent} input={input} fx={fx} />
      </div>
    </div>
  );
}
