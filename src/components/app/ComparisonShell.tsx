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
 * /comparison: la calculadora. Gobierna el wizard de onboarding y el dashboard
 * en vivo. Quien llega nuevo arranca en el wizard; `?ejemplo=1` (el CTA "ver un
 * ejemplo") y quien ya completó el wizard abren el dashboard. Cancelar/reiniciar
 * vuelve al home ("/").
 */
export function ComparisonShell() {
  const router = useRouter();
  const example = useSearchParams().get("ejemplo") === "1";
  const { input, patch, reset, loaded } = useScenario();
  const [manualPhase, setManualPhase] = useState<Phase | null>(null);
  const [step, setStep] = useState(0);

  const fx = useFxRate(input.billingCurrency);

  // Conversión a moneda local (PEN) ANTES del motor; computeScenario es puro.
  const inputPEN = useMemo(
    () => ({ ...input, amount: Math.round(input.amount * fx.rate) }),
    [input, fx.rate],
  );
  const { yours, equivalent } = useMemo(() => computeScenario(inputPEN), [inputPEN]);

  // Evita parpadeo de fase mientras el escenario hidrata desde el cache.
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
