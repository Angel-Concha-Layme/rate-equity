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
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  type ScenarioInput,
  type BillingType,
  type CurrencyCode,
} from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

const STEPS = [
  { title: "¿Dónde trabajas?", sub: "Calculamos con las reglas tributarias de tu país." },
  { title: "¿Cómo trabajas hoy?", sub: "Tu categoría define impuestos y beneficios." },
  {
    title: "¿Cuánto y en qué moneda cobras?",
    sub: "Asumimos que es tu monto bruto; si no es Soles, convertimos al tipo de cambio del día.",
  },
];

export function Wizard({
  input,
  patch,
  step,
  setStep,
  fx,
  onDone,
  onCancel,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  step: number;
  setStep: (n: number) => void;
  fx: FxState;
  onDone: () => void;
  onCancel: () => void;
}) {
  const strategy = getStrategy(input.country);
  const categories = [strategy.modalities.formal, strategy.modalities.informal].map((m) => ({
    value: m.role,
    title: m.name,
    sub: m.wizard.sub,
    desc: m.wizard.desc,
    info: m.wizard.info,
  }));
  const usesHourly = input.billingType === "hourly";
  const currency = CURRENCY_OPTIONS.find((m) => m.value === input.billingCurrency);
  const symbol = currency?.symbol ?? "S/";
  const amountInvalid = step === 2 && input.amount <= 0;

  const next = () => (step < 2 ? setStep(step + 1) : onDone());

  return (
    <div className="py-12 sm:py-16">
      <Card className="mx-auto max-w-xl animate-fade-up p-6 sm:p-8">
        {/* header: progress + cancel */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <StepDots count={3} current={step} onJump={(i) => setStep(i)} />
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"
          >
            ← Inicio
          </button>
        </div>

        <Eyebrow>
          Paso {step + 1} de 3
        </Eyebrow>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{STEPS[step].title}</h2>
        <p className="mt-1.5 text-sm text-muted">{STEPS[step].sub}</p>

        <div className="mt-7 min-h-[180px]">
          {/* Step 1: country */}
          {step === 0 && (
            <Field label="País donde trabajas" htmlFor="wiz-pais">
              <FlagSelect
                aria-label="País"
                value={input.country}
                onChange={(v) => patch({ country: v })}
                options={COUNTRY_OPTIONS.map((p) => ({
                  value: p.value,
                  label: p.label,
                  flag: p.flag,
                  sub: p.currency,
                  disabled: p.disabled,
                }))}
              />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle">
                {strategy.copy.wizardCountryNote}
                <InfoDot content="Más países pronto. El motor está diseñado para añadir nuevas jurisdicciones." />
              </p>
            </Field>
          )}

          {/* Step 2: category */}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((c) => {
                const active = input.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => patch({ category: c.value })}
                    className="rounded-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div
                      className={cn(
                        "h-full rounded-card border-2 border-line bg-surface p-5 transition duration-200",
                        active
                          ? "-translate-y-0.5 border-primary shadow-pop theme-dark:border-accent"
                          : "shadow-card hover:-translate-y-0.5 hover:border-line-strong hover:shadow-pop",
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

          {/* Step 3: how much and how */}
          {step === 2 && (
            <div className="grid gap-5">
              <Field label="¿Cómo cobras?">
                <SegmentedControl
                  aria-label="Tipo de cobro"
                  value={input.billingType}
                  onChange={(v: BillingType) => patch({ billingType: v, amount: v === "hourly" ? 50 : 4500 })}
                  options={[
                    { value: "monthly", label: "Sueldo mensual" },
                    { value: "hourly", label: "Por hora" },
                  ]}
                />
              </Field>
              <Field label={usesHourly ? "Tu tarifa por hora" : "Tu monto mensual"} htmlFor="wiz-monto">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    {symbol}
                  </span>
                  <MoneyInput
                    id="wiz-monto"
                    autoFocus
                    className="pl-9"
                    value={input.amount}
                    onChange={(amount) => patch({ amount })}
                  />
                </div>
                {amountInvalid ? (
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
                  value={input.billingCurrency}
                  onChange={(v: CurrencyCode) => patch({ billingCurrency: v })}
                  options={CURRENCY_OPTIONS.map((m) => ({
                    value: m.value,
                    label: m.value,
                    flag: m.flag,
                    sub: m.label,
                  }))}
                />
                <div className="mt-3 text-xs">
                  {input.billingCurrency === "PEN" ? (
                    <span className="text-subtle">Cobras directamente en Soles, sin conversión.</span>
                  ) : fx.loading ? (
                    <span className="text-subtle">Obteniendo tipo de cambio…</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted">
                      1 {input.billingCurrency} ≈{" "}
                      <strong className="font-mono tabular-nums text-ink">S/ {fx.rate.toFixed(2)}</strong>
                      {fx.date && <span className="text-subtle">· ref. {fx.date}</span>}
                      <InfoDot content={`Tipo de cambio referencial (open.er-api.com). El oficial puede variar. Fuente: ${fx.source}.`} />
                    </span>
                  )}
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* navigation */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            className={cn(step === 0 && "invisible")}
          >
            ← Atrás
          </Button>
          <Button onClick={next} disabled={amountInvalid}>
            {step < 2 ? "Siguiente →" : "Ver mi comparación →"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
