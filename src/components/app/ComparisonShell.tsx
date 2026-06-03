"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useScenario } from "@/lib/useScenario";
import { useFxRate } from "@/lib/useFxRate";
import { computeScenario } from "@/lib/calc";
import { Wizard } from "@/components/app/Wizard";
import { DashboardView } from "@/components/app/DashboardView";

type Phase = "wizard" | "dashboard";

/**
 * /comparison: the calculator. Drives the onboarding wizard and the live
 * dashboard. New visitors start in the wizard; `?ejemplo=1` (the "see an
 * example" CTA) and users who already completed the wizard open the dashboard.
 * Cancel/reset returns to the home page ("/").
 */
export function ComparisonShell() {
  const router = useRouter();
  const example = useSearchParams().get("ejemplo") === "1";
  const { input, patch, reset, loaded } = useScenario();
  const [manualPhase, setManualPhase] = useState<Phase | null>(null);
  const [step, setStep] = useState(0);

  const fx = useFxRate(input.billingCurrency);

  // Convert to local currency (PEN) BEFORE the engine; computeScenario is pure.
  const inputPEN = useMemo(
    () => ({ ...input, amount: Math.round(input.amount * fx.rate) }),
    [input, fx.rate],
  );
  const { yours, equivalent } = useMemo(() => computeScenario(inputPEN), [inputPEN]);

  // Avoid phase flicker while the scenario hydrates from the cache.
  if (!loaded) return null;

  const phase: Phase = manualPhase ?? (input.wizardDone || example ? "dashboard" : "wizard");

  if (phase === "wizard") {
    return (
      <Wizard
        input={input}
        patch={patch}
        step={step}
        setStep={setStep}
        fx={fx}
        onDone={() => {
          patch({ wizardDone: true });
          setManualPhase("dashboard");
        }}
        onCancel={() => router.push("/")}
      />
    );
  }

  return (
    <DashboardView
      input={input}
      patch={patch}
      fx={fx}
      yours={yours}
      equivalent={equivalent}
      onReopenWizard={() => {
        setStep(0);
        setManualPhase("wizard");
      }}
      onReset={() => {
        reset();
        router.push("/");
      }}
    />
  );
}
