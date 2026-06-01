"use client";

import { useMemo, useState } from "react";
import { useScenario } from "@/lib/useScenario";
import { useFxRate } from "@/lib/useFxRate";
import { computeScenario, seguroPrivadoSugerido } from "@/lib/calc";
import { LandingHero } from "@/components/app/LandingHero";
import { Wizard } from "@/components/app/Wizard";
import { DashboardView } from "@/components/app/DashboardView";

type Fase = "landing" | "wizard" | "dashboard";

export function AppShell() {
  const { input, patch, reset, loaded } = useScenario();
  // `null` = sin navegación manual: la fase se deriva del estado cargado, de modo
  // que los usuarios recurrentes (wizardDone en cache) aterrizan en el dashboard.
  const [faseManual, setFaseManual] = useState<Fase | null>(null);
  const [paso, setPaso] = useState(0);

  const fx = useFxRate(input.monedaCobro);

  const fase: Fase = faseManual ?? (loaded && input.wizardDone ? "dashboard" : "landing");
  const setFase = setFaseManual;

  // conversión a moneda local (PEN) ANTES del motor; computeScenario sigue puro.
  const inputPEN = useMemo(
    () => ({ ...input, monto: Math.round(input.monto * fx.rate) }),
    [input, fx.rate],
  );
  const { tuyo, equivalente } = useMemo(() => computeScenario(inputPEN), [inputPEN]);

  // Tramo de seguro sugerido según la liquidez SIN seguro (en soles). Estable
  // frente al estado del toggle; se usa para autollenar el monto al activarlo.
  const seguroSugerido = useMemo(() => {
    if (inputPEN.categoria !== "independiente") return 0;
    const base = computeScenario({ ...inputPEN, seguroPrivado: false }).tuyo.liquido;
    return seguroPrivadoSugerido(inputPEN.pais, base);
  }, [inputPEN]);

  if (fase === "landing") {
    return (
      <LandingHero
        onStart={() => {
          patch({ modo: "bruto" });
          setPaso(0);
          setFase("wizard");
        }}
        onExample={() => setFase("dashboard")}
      />
    );
  }

  if (fase === "wizard") {
    return (
      <Wizard
        input={input}
        patch={patch}
        paso={paso}
        setPaso={setPaso}
        fx={fx}
        onDone={() => {
          patch({ wizardDone: true });
          setFase("dashboard");
        }}
        onCancel={() => setFase("landing")}
      />
    );
  }

  return (
    <DashboardView
      input={input}
      patch={patch}
      fx={fx}
      tuyo={tuyo}
      equivalente={equivalente}
      seguroSugerido={seguroSugerido}
      onReabrirWizard={() => {
        setPaso(0);
        setFase("wizard");
      }}
      onReset={() => {
        reset();
        setPaso(0);
        setFase("landing");
      }}
    />
  );
}
