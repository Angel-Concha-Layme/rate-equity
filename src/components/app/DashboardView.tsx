"use client";

import { useState } from "react";
import type { Result, ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { Sidebar } from "@/components/app/Sidebar";
import { Dashboard } from "@/components/app/Dashboard";
import { cn } from "@/lib/cn";

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
  onReopenWizard,
  onReset,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  fx: FxState;
  yours: Result;
  equivalent: Result;
  onReopenWizard: () => void;
  onReset: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "grid gap-6 py-5 lg:py-0 lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out",
        collapsed ? "lg:grid-cols-[56px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]",
      )}
    >
      <Sidebar
        input={input}
        patch={patch}
        fx={fx}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onReopenWizard={onReopenWizard}
        onReset={onReset}
      />
      <div className="min-w-0 lg:py-5">
        <Dashboard yours={yours} equivalent={equivalent} input={input} fx={fx} />
      </div>
    </div>
  );
}
