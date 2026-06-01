"use client";

import { useMemo, useState } from "react";
import { useScenario } from "@/lib/useScenario";
import { useFxRate } from "@/lib/useFxRate";
import { computeScenario, suggestedPrivateInsurance } from "@/lib/calc";
import { LandingHero } from "@/components/app/LandingHero";
import { Wizard } from "@/components/app/Wizard";
import { DashboardView } from "@/components/app/DashboardView";

type Phase = "landing" | "wizard" | "dashboard";

export function AppShell() {
  const { input, patch, reset, loaded } = useScenario();
  // `null` = no manual navigation: the phase is derived from the loaded state,
  // so returning users (wizardDone in cache) land on the dashboard.
  const [manualPhase, setManualPhase] = useState<Phase | null>(null);
  const [step, setStep] = useState(0);

  const fx = useFxRate(input.billingCurrency);

  const phase: Phase = manualPhase ?? (loaded && input.wizardDone ? "dashboard" : "landing");
  const setPhase = setManualPhase;

  // Conversion to local currency (PEN) BEFORE the engine; computeScenario stays pure.
  const inputPEN = useMemo(
    () => ({ ...input, amount: Math.round(input.amount * fx.rate) }),
    [input, fx.rate],
  );
  const { yours, equivalent } = useMemo(() => computeScenario(inputPEN), [inputPEN]);

  // Suggested insurance tier based on liquidity WITHOUT insurance (in soles).
  // Stable against the toggle state; used to autofill the amount when enabling it.
  const suggestedInsurance = useMemo(() => {
    if (inputPEN.category !== "informal") return 0;
    const base = computeScenario({ ...inputPEN, privateInsurance: false }).yours.net;
    return suggestedPrivateInsurance(inputPEN.country, base);
  }, [inputPEN]);

  if (phase === "landing") {
    return (
      <LandingHero
        onStart={() => {
          patch({ mode: "gross" });
          setStep(0);
          setPhase("wizard");
        }}
        onExample={() => setPhase("dashboard")}
      />
    );
  }

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
          setPhase("dashboard");
        }}
        onCancel={() => setPhase("landing")}
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
      suggestedInsurance={suggestedInsurance}
      onReopenWizard={() => {
        setStep(0);
        setPhase("wizard");
      }}
      onReset={() => {
        reset();
        setStep(0);
        setPhase("landing");
      }}
    />
  );
}
