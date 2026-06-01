"use client";

import {
  Card,
  Button,
  Field,
  MoneyInput,
  SegmentedControl,
  FlagSelect,
  StepDots,
  Eyebrow,
  InfoDot,
  Pill,
} from "@/components/common";
import {
  getStrategy,
  PAIS_OPTIONS,
  MONEDA_OPTIONS,
  type ScenarioInput,
  type TipoCobro,
  type Moneda,
} from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

const PASOS = [
  { titulo: "¿Dónde trabajas?", sub: "Calculamos con las reglas tributarias de tu país." },
  { titulo: "¿Cómo trabajas hoy?", sub: "Tu categoría define impuestos y beneficios." },
  {
    titulo: "¿Cuánto y en qué moneda cobras?",
    sub: "Asumimos que es tu monto bruto; si no es Soles, convertimos al tipo de cambio del día.",
  },
];

export function Wizard({
  input,
  patch,
  paso,
  setPaso,
  fx,
  onDone,
  onCancel,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  paso: number;
  setPaso: (n: number) => void;
  fx: FxState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const strat = getStrategy(input.pais);
  const cats = [strat.modalidades.formal, strat.modalidades.informal].map((m) => ({
    value: m.rol,
    title: m.nombre,
    sub: m.wizard.sub,
    desc: m.wizard.desc,
    info: m.wizard.info,
  }));
  const usaHora = input.tipoCobro === "hora";
  const moneda = MONEDA_OPTIONS.find((m) => m.value === input.monedaCobro);
  const symbol = moneda?.symbol ?? "S/";
  const montoInvalido = paso === 2 && input.monto <= 0;

  const next = () => (paso < 2 ? setPaso(paso + 1) : onDone());

  return (
    <div className="py-12 sm:py-16">
      <Card className="mx-auto max-w-xl animate-fade-up p-6 sm:p-8">
        {/* cabecera: progreso + cancelar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <StepDots count={3} current={paso} onJump={(i) => setPaso(i)} />
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"
          >
            ← Inicio
          </button>
        </div>

        <Eyebrow>
          Paso {paso + 1} de 3
        </Eyebrow>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{PASOS[paso].titulo}</h2>
        <p className="mt-1.5 text-sm text-muted">{PASOS[paso].sub}</p>

        <div className="mt-7 min-h-[180px]">
          {/* Paso 1: país */}
          {paso === 0 && (
            <Field label="País donde trabajas" htmlFor="wiz-pais">
              <FlagSelect
                aria-label="País"
                value={input.pais}
                onChange={(v) => patch({ pais: v })}
                options={PAIS_OPTIONS.map((p) => ({
                  value: p.value,
                  label: p.label,
                  flag: p.flag,
                  sub: p.currency,
                  disabled: p.disabled,
                }))}
              />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
                {strat.copy.wizardPaisNota}
                <InfoDot content="Más países pronto. El motor está diseñado para añadir nuevas jurisdicciones." />
              </p>
            </Field>
          )}

          {/* Paso 2: categoría */}
          {paso === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {cats.map((c) => {
                const active = input.categoria === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => patch({ categoria: c.value })}
                    className="rounded-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div
                      className={cn(
                        "h-full rounded-card border border-line bg-surface p-5 transition duration-200",
                        active
                          ? "-translate-y-0.5 shadow-pop"
                          : "shadow-card hover:-translate-y-0.5 hover:shadow-pop",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
                        <InfoDot content={c.info} />
                      </div>
                      <Pill className="mt-1">{c.sub}</Pill>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{c.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Paso 3: cuánto y cómo */}
          {paso === 2 && (
            <div className="grid gap-5">
              <Field label="¿Cómo cobras?">
                <SegmentedControl
                  aria-label="Tipo de cobro"
                  value={input.tipoCobro}
                  onChange={(v: TipoCobro) => patch({ tipoCobro: v, monto: v === "hora" ? 50 : 4500 })}
                  options={[
                    { value: "mensual", label: "Sueldo mensual" },
                    { value: "hora", label: "Por hora" },
                  ]}
                />
              </Field>
              <Field label={usaHora ? "Tu tarifa por hora" : "Tu monto mensual"} htmlFor="wiz-monto">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    {symbol}
                  </span>
                  <MoneyInput
                    id="wiz-monto"
                    autoFocus
                    className="pl-9"
                    value={input.monto}
                    onChange={(monto) => patch({ monto })}
                  />
                </div>
                {montoInvalido ? (
                  <p role="alert" className="mt-2 text-xs text-loss">
                    Ingresa un monto mayor a 0.
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
                    Asumimos que es bruto (antes de descuentos).
                    <InfoDot content="¿Es tu neto (lo que te llega a la cuenta)? Lo cambias en un clic después, en la barra de ajustes." />
                  </p>
                )}
              </Field>

              <Field label="Moneda en la que te pagan" htmlFor="wiz-moneda">
                <FlagSelect
                  aria-label="Moneda"
                  value={input.monedaCobro}
                  onChange={(v: Moneda) => patch({ monedaCobro: v })}
                  options={MONEDA_OPTIONS.map((m) => ({
                    value: m.value,
                    label: m.label,
                    flag: m.flag,
                    sub: m.symbol,
                  }))}
                />
                <div className="mt-3 text-xs">
                  {input.monedaCobro === "PEN" ? (
                    <span className="text-subtle">Cobras directamente en Soles, sin conversión.</span>
                  ) : fx.loading ? (
                    <span className="text-subtle">Obteniendo tipo de cambio…</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted">
                      1 {input.monedaCobro} ≈{" "}
                      <strong className="font-mono tabular-nums text-ink">S/ {fx.rate.toFixed(2)}</strong>
                      {fx.fecha && <span className="text-subtle">· ref. {fx.fecha}</span>}
                      <InfoDot content={`Tipo de cambio referencial (open.er-api.com). El oficial puede variar. Fuente: ${fx.fuente}.`} />
                    </span>
                  )}
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* navegación */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button
            variant="ghost"
            onClick={() => setPaso(Math.max(0, paso - 1))}
            className={cn(paso === 0 && "invisible")}
          >
            ← Atrás
          </Button>
          <Button onClick={next} disabled={montoInvalido}>
            {paso < 2 ? "Siguiente →" : "Ver mi comparación →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
