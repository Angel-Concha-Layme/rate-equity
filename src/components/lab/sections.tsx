"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Eyebrow,
  Metric,
  Pill,
  Input,
  Field,
  SegmentedControl,
  Toggle,
  InfoDot,
  Divider,
} from "@/components/common";
import { Sparkline, WaterfallChart, RadarChart, HBars } from "@/components/lab/Charts";
import {
  MODALIDADES,
  money,
  pct,
  valorHora,
  type ModalidadKey,
  type Modalidad,
} from "@/lib/sample";
import { THEMES, type ThemeKey } from "@/components/lab/theme";
import { cn } from "@/lib/cn";

const COLORS = ["var(--c1)", "var(--c2)", "var(--c3)"];
const getModalidad = (k: ModalidadKey) => MODALIDADES.find((m) => m.key === k)!;
/** La familia "El Libro Mayor" (incl. V2) comparte diseño de tarjetas. */
const isLedger = (t: ThemeKey) => t.startsWith("ledger");

/* fila contable con puntos guía (El Libro Mayor) */
function Row({
  k,
  v,
  accent,
  loss,
  profit,
}: {
  k: string;
  v: string;
  accent?: boolean;
  loss?: boolean;
  profit?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="shrink-0 text-muted">{k}</span>
      <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-line-strong" />
      <span
        className={cn(
          "shrink-0 font-semibold tabular-nums",
          loss ? "text-loss" : profit ? "text-profit" : accent ? "text-accent" : "text-ink",
        )}
      >
        {v}
      </span>
    </div>
  );
}

/* ----- Tarjeta de modalidad: ORIGINAL (Terminal / Claro) ----- */
function OriginalModalityCard({
  m,
  color,
  active,
  onSelect,
  horas,
}: {
  m: Modalidad;
  color: string;
  active: boolean;
  onSelect: (k: ModalidadKey) => void;
  horas: number;
}) {
  const vh = valorHora(m.liquido, horas);
  return (
    <button onClick={() => onSelect(m.key)} className="text-left" aria-pressed={active}>
      <Card
        className={cn(
          "h-full p-6 transition duration-200",
          active
            ? "ring-2 ring-ring shadow-pop -translate-y-0.5"
            : "hover:-translate-y-0.5 hover:shadow-pop",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{m.nombre}</h3>
            <p className="text-sm text-muted">{m.tagline}</p>
          </div>
          <span className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: color }} />
        </div>
        <div className="mt-5">
          <p className="text-xs text-muted">Liquidez neta / mes</p>
          <Metric className="text-3xl font-bold text-ink">{money(m.liquido)}</Metric>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Pill tone={active ? "primary" : "neutral"}>{m.badge}</Pill>
          <Sparkline data={m.spark} color={color} />
        </div>
        <Divider className="my-5" />
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <Stat dt="Comp. total" dd={money(m.compTotal)} />
          <Stat dt="Costo empresa" dd={money(m.costoEmpresa)} />
          <Stat dt="Carga fiscal" dd={pct(m.cargaPct)} />
          <Stat dt="Valor / hora" dd={money(vh, { decimals: 1 })} accent />
        </dl>
      </Card>
    </button>
  );
}

/* ----- Tarjeta de modalidad: SELLO (El Libro Mayor), color por modalidad ----- */
export function SelloModalityCard({
  m,
  color,
  active,
  onSelect,
  horas,
  valorHoraTotal,
  etiqueta,
  className,
}: {
  m: Modalidad;
  color: string;
  active: boolean;
  onSelect?: (k: ModalidadKey) => void;
  horas: number;
  valorHoraTotal?: number;
  etiqueta?: string;
  className?: string;
}) {
  const vh = valorHoraTotal ?? valorHora(m.liquido, horas);
  const content = (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition duration-200",
        onSelect && "group-hover:border-line-strong",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em]" style={{ color }}>
              {etiqueta ?? "Modalidad"}
            </p>
            <h3 className="font-display text-xl font-semibold text-ink">{m.nombre}</h3>
            <p className="text-sm text-muted">{m.tagline}</p>
          </div>
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line font-display text-sm font-bold transition"
            style={active ? { background: color, borderColor: color, color: "var(--on-primary)" } : { color }}
          >
            {m.nombre.charAt(0)}
          </span>
        </div>
        <Divider className="mt-4" />
      </div>
      <div>
        <p className="text-xs text-muted">Liquidez neta / mes</p>
        <Metric className="text-3xl font-bold text-ink">{money(m.liquido)}</Metric>
        <div className="mt-2">
          <Pill>{m.badge}</Pill>
        </div>
      </div>
      <div className="border-t border-line pt-3">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Stat dt="Comp. total" dd={money(m.compTotal)} />
          <Stat dt="Costo empresa" dd={money(m.costoEmpresa)} />
          <Stat dt="Carga fiscal" dd={pct(m.cargaPct)} />
          <Stat dt="Valor / hora" dd={money(vh, { decimals: 1 })} accent />
        </dl>
      </div>
    </div>
  );

  if (!onSelect) {
    return <div className={cn("block h-full w-full text-left", className)}>{content}</div>;
  }

  return (
    <button
      onClick={() => onSelect(m.key)}
      aria-pressed={active}
      className={cn(
        "group block h-full w-full rounded-card text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {content}
    </button>
  );
}

/* ----- Tarjeta de equivalencia: ORIGINAL (Terminal / Claro) ----- */
function OriginalHeroCard({ selected }: { selected: Modalidad }) {
  return (
    <Card ruled className="relative p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <Eyebrow>{selected.nombre}</Eyebrow>
        <Pill tone="primary">{selected.badge}</Pill>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Bruto de portada</p>
          <Metric className="text-2xl text-subtle line-through decoration-loss/60">
            {money(selected.bruto)}
          </Metric>
        </div>
        <span className="pb-1 text-2xl text-subtle">→</span>
        <div className="text-right">
          <p className="text-sm text-muted">Líquido real</p>
          <Metric className="text-4xl font-bold text-ink">{money(selected.liquido)}</Metric>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="grid grid-cols-2 gap-4">
        <KpiInline label="Comp. total" value={money(selected.compTotal)} />
        <KpiInline label="Costo empresa" value={money(selected.costoEmpresa)} tone="loss" />
      </div>
      <p className="mt-6 text-xs text-subtle">
        * Cifras de ejemplo, ilustrativas. El motor de cálculo real se conectará luego.
      </p>
    </Card>
  );
}

/* ----- Tarjeta de equivalencia: ANTES → DESPUÉS + deducciones (El Libro Mayor) ----- */
export function AntesDespuesHero({ m, nota, className }: { m: Modalidad; nota?: string; className?: string }) {
  const deducciones = m.breakdown.filter((s) => s.kind === "dec");
  return (
    <Card className={cn("p-6 sm:p-7", className)}>
      <div className="flex items-center justify-between">
        <Eyebrow>{m.nombre}</Eyebrow>
        <Pill tone="primary">{m.badge}</Pill>
      </div>
      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
        <div>
          <p className="text-sm text-muted">Bruto de portada</p>
          <Metric className="text-2xl text-subtle line-through decoration-loss/50">
            {money(m.bruto)}
          </Metric>
        </div>
        <div className="h-12 w-px bg-line-strong" />
        <div className="text-right">
          <p className="text-sm text-muted">Líquido real</p>
          <Metric className="text-4xl font-bold text-ink">{money(m.liquido)}</Metric>
        </div>
      </div>
      <Divider className="my-6" />
      <p className="mb-1 text-xs uppercase tracking-wider text-muted">En qué se va el bruto</p>
      <div className="font-mono text-sm">
        {deducciones.map((d) => (
          <Row key={d.label} k={d.label} v={money(d.amount, { sign: true })} loss />
        ))}
      </div>
      {nota && <p className="mt-5 text-xs text-subtle">{nota}</p>}
    </Card>
  );
}

/* ------------------------------- Section shell ------------------------------- */
function Section({
  id,
  index,
  eyebrow,
  title,
  desc,
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-start gap-4">
        <span className="mt-1 font-mono text-sm text-subtle tabular-nums">{index}</span>
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          {desc && <p className="mt-1.5 max-w-2xl text-muted">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ----------------------------------- Nav ----------------------------------- */
export function LabNav({
  theme,
  onTheme,
}: {
  theme: ThemeKey;
  onTheme: (t: ThemeKey) => void;
}) {
  return (
    <header className="sticky top-0 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-card bg-primary text-on-primary">
            <span className="font-display text-base font-bold">R</span>
          </div>
          <div className="leading-tight">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Rate<span className="text-accent">Equity</span>
            </span>
            <span className="ml-2 hidden text-xs text-subtle sm:inline">
              laboratorio de estilos
            </span>
          </div>
        </div>

        {/* Conmutador de tema: el control protagonista */}
        <div className="flex items-center gap-1 rounded-pill border border-line bg-surface-2 p-1">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => onTheme(t.key)}
              aria-pressed={theme === t.key}
              title={t.tagline}
              className={cn(
                "rounded-pill px-2.5 py-1.5 text-xs font-semibold transition",
                theme === t.key
                  ? "bg-primary text-on-primary shadow-glow"
                  : "text-muted hover:text-ink",
              )}
            >
              {t.short}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------- Hero ---------------------------------- */
export function Hero({ selected, theme }: { selected: Modalidad; theme: ThemeKey }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up motion-reduce:animate-none">
          <Pill tone="accent">Compensación · LATAM</Pill>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            No compares salarios.
            <br />
            Compara <span className="text-accent">valor real</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Dos ofertas con bruto parecido pueden ser realidades económicas muy
            distintas. RateEquity modela liquidez, costo empresa, impuestos,
            beneficios y valor por hora efectiva, de forma transparente y
            verificable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg">Calcular equivalencia</Button>
            <Button size="lg" variant="ghost">
              Ver cómo funciona
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            {[
              ["7", "modalidades"],
              ["8", "variables del modelo"],
              ["100%", "fórmula auditable"],
            ].map(([n, l]) => (
              <div key={l} className="flex items-baseline gap-2">
                <Metric className="text-xl font-bold text-ink">{n}</Metric>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta-prueba: bruto ≠ líquido */}
        <div className="animate-fade-up [animation-delay:120ms] motion-reduce:animate-none">
          {isLedger(theme) ? (
            <AntesDespuesHero m={selected} />
          ) : (
            <OriginalHeroCard selected={selected} />
          )}
        </div>
      </div>
    </section>
  );
}

function KpiInline({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "loss" | "profit";
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <Metric
        className={cn(
          "text-xl font-semibold text-ink",
          tone === "loss" && "text-loss",
          tone === "profit" && "text-profit",
        )}
      >
        {value}
      </Metric>
    </div>
  );
}

/* ------------------------------- Calculadora ------------------------------- */
export function CalculatorPanel({
  modalidad,
  setModalidad,
  horas,
  setHoras,
}: {
  modalidad: ModalidadKey;
  setModalidad: (m: ModalidadKey) => void;
  horas: number;
  setHoras: (h: number) => void;
}) {
  const m = getModalidad(modalidad);
  const [beneficios, setBeneficios] = useState(true);
  const [costoEmpresa, setCostoEmpresa] = useState(true);
  const vh = valorHora(m.liquido, horas);

  return (
    <Section
      id="calculadora"
      index="01"
      eyebrow="Entrada"
      title="Panel de cálculo"
      desc="El usuario describe su oferta. Inputs, control segmentado, slider y toggles, atados al resultado en vivo."
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="grid gap-5">
            <Field label="Modalidad de contratación">
              <SegmentedControl
                aria-label="Modalidad"
                value={modalidad}
                onChange={setModalidad}
                options={MODALIDADES.map((x) => ({ value: x.key, label: x.nombre }))}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bruto mensual" hint="USD">
                <Input defaultValue={m.bruto.toLocaleString("en-US")} inputMode="numeric" />
              </Field>
              <Field label="País" htmlFor="pais">
                <div className="relative">
                  <select
                    id="pais"
                    defaultValue="pe"
                    className="w-full appearance-none rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-[0.95rem] text-ink transition focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
                  >
                    <option value="pe">Perú</option>
                    <option value="mx">México</option>
                    <option value="co">Colombia</option>
                    <option value="cl">Chile</option>
                    <option value="ar">Argentina</option>
                  </select>
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Field>
            </div>

            <Field
              label="Horas efectivas por semana"
              hint={`${horas} h`}
              htmlFor="horas"
            >
              <input
                id="horas"
                type="range"
                min={10}
                max={60}
                step={1}
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
                className={cn(
                  "w-full cursor-pointer appearance-none bg-transparent",
                  // pista
                  "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-pill [&::-webkit-slider-runnable-track]:bg-line-strong",
                  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-pill [&::-moz-range-track]:bg-line-strong",
                  // pulgar (pseudo-elementos: utilidades arbitrarias, sin CSS suelto)
                  "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-primary",
                )}
              />
            </Field>

            <Divider />

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  Valorizar beneficios laborales
                  <InfoDot content="Aguinaldo, vacaciones, CTS, seguro y otros beneficios convertidos a su valor mensual equivalente." />
                </span>
                <Toggle checked={beneficios} onChange={setBeneficios} label="Valorizar beneficios" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  Mostrar costo para la empresa
                  <InfoDot content="Incluye aportes patronales y cargas que paga el empleador, además del bruto." />
                </span>
                <Toggle checked={costoEmpresa} onChange={setCostoEmpresa} label="Mostrar costo empresa" />
              </label>
            </div>

            <Button size="lg" className="mt-1 w-full">
              Calcular equivalencia
            </Button>
          </div>
        </Card>

        {/* Resultado en vivo */}
        <Card ruled className="flex flex-col justify-between gap-6 bg-surface-2 p-6">
          <div>
            <Eyebrow>Resultado en vivo</Eyebrow>
            <p className="mt-2 text-sm text-muted">
              Valor por hora efectiva de{" "}
              <span className="font-semibold text-ink">{m.nombre}</span> a {horas}{" "}
              h/semana
            </p>
            <div className="mt-4 flex items-end gap-2">
              <Metric className="text-5xl font-bold text-ink theme-terminal:text-primary theme-terminal:[text-shadow:0_0_26px_color-mix(in_oklab,currentColor_55%,transparent)]">
                {money(vh, { decimals: 1 })}
              </Metric>
              <span className="pb-1.5 text-lg text-muted">/h</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <KpiInline label="Líquido / mes" value={money(m.liquido)} tone="profit" />
            <KpiInline label="Carga fiscal" value={pct(m.cargaPct)} tone="loss" />
          </div>
          <p className="text-xs text-subtle">
            Mueve el slider de horas y cambia la modalidad: este número responde
            al instante.
          </p>
        </Card>
      </div>
    </Section>
  );
}

/* ---------------------------- Tarjetas comparación ---------------------------- */
export function ComparisonCards({
  selected,
  horas,
  onSelect,
  theme,
}: {
  selected: ModalidadKey;
  horas: number;
  onSelect: (m: ModalidadKey) => void;
  theme: ThemeKey;
}) {
  return (
    <Section
      id="comparacion"
      index="02"
      eyebrow="Resultado"
      title="Tarjetas por modalidad"
      desc="Una tarjeta por modalidad. La seleccionada se resalta; cada una resume la historia económica completa."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {MODALIDADES.map((m, i) =>
          isLedger(theme) ? (
            <SelloModalityCard
              key={m.key}
              m={m}
              color={COLORS[i]}
              active={m.key === selected}
              onSelect={onSelect}
              horas={horas}
            />
          ) : (
            <OriginalModalityCard
              key={m.key}
              m={m}
              color={COLORS[i]}
              active={m.key === selected}
              onSelect={onSelect}
              horas={horas}
            />
          ),
        )}
      </div>
    </Section>
  );
}

function Stat({ dt, dd, accent }: { dt: string; dd: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{dt}</dt>
      <dd
        className={cn(
          "font-mono text-base font-semibold tabular-nums",
          accent ? "text-accent" : "text-ink",
        )}
      >
        {dd}
      </dd>
    </div>
  );
}

/* -------------------------------- Gráficos -------------------------------- */
export function ChartsBlock({ selected }: { selected: ModalidadKey }) {
  const m = getModalidad(selected);
  const maxLiquido = Math.max(...MODALIDADES.map((x) => x.liquido));
  const maxCosto = Math.max(...MODALIDADES.map((x) => x.costoEmpresa));

  return (
    <Section
      id="graficos"
      index="03"
      eyebrow="Visualización"
      title="Gráficos del modelo"
      desc="Waterfall del bruto al neto, comparación por barras y perfil multi-atributo en radar. Todos adoptan la paleta del tema."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">
              Del bruto al líquido · {m.nombre}
            </h3>
            <Pill tone="neutral">Waterfall</Pill>
          </div>
          <WaterfallChart steps={m.breakdown} />
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">
              Comparación directa
            </h3>
            <Pill tone="neutral">Barras</Pill>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
            Liquidez neta / mes
          </p>
          <HBars
            max={maxLiquido}
            rows={MODALIDADES.map((x, i) => ({
              label: x.nombre,
              value: x.liquido,
              color: COLORS[i],
              highlight: x.key === selected,
            }))}
          />
          <Divider className="my-5" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
            Costo para la empresa
          </p>
          <HBars
            max={maxCosto}
            rows={MODALIDADES.map((x, i) => ({
              label: x.nombre,
              value: x.costoEmpresa,
              color: COLORS[i],
              highlight: x.key === selected,
            }))}
          />
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">
              Perfil por atributo
            </h3>
            <Pill tone="neutral">Radar</Pill>
          </div>
          <RadarChart />
        </Card>
      </div>
    </Section>
  );
}

/* ----------------------------- Tabla de desglose ----------------------------- */
export function BreakdownTable({ horas }: { horas: number }) {
  const rows: { label: string; get: (m: Modalidad) => string; emphasis?: boolean; tone?: "loss" | "profit" }[] = [
    { label: "Bruto mensual", get: (m) => money(m.bruto) },
    { label: "Carga tributaria", get: (m) => pct(m.cargaPct), tone: "loss" },
    { label: "Líquido (bolsillo)", get: (m) => money(m.liquido), emphasis: true, tone: "profit" },
    { label: "Beneficios valorizados", get: (m) => money(m.beneficios) },
    { label: "Compensación total", get: (m) => money(m.compTotal), emphasis: true },
    { label: "Costo para la empresa", get: (m) => money(m.costoEmpresa), tone: "loss" },
    { label: "Valor / hora efectiva", get: (m) => money(valorHora(m.liquido, horas), { decimals: 1 }) },
  ];

  return (
    <Section
      id="tabla"
      index="04"
      eyebrow="Detalle"
      title="Tabla de desglose"
      desc="Vista de libro mayor, línea por línea. Cifras tabulares alineadas y filas clave destacadas."
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  Concepto
                </th>
                {MODALIDADES.map((m, i) => (
                  <th
                    key={m.key}
                    className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider"
                  >
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ background: COLORS[i] }}
                      />
                      {m.nombre}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className={cn(
                    "border-b border-line last:border-0",
                    r.emphasis && "bg-surface-2",
                  )}
                >
                  <td
                    className={cn(
                      "px-5 py-3 text-sm text-muted",
                      r.emphasis && "font-semibold text-ink",
                    )}
                  >
                    {r.label}
                  </td>
                  {MODALIDADES.map((m) => (
                    <td
                      key={m.key}
                      className={cn(
                        "px-5 py-3 text-right font-mono text-sm tabular-nums",
                        r.emphasis ? "font-bold text-ink" : "text-ink",
                        r.tone === "loss" && "text-loss",
                        r.tone === "profit" && "text-profit",
                      )}
                    >
                      {r.get(m)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
}

/* ------------------------------ Kit de átomos ------------------------------ */
export function AtomsShowcase() {
  const [seg, setSeg] = useState<"a" | "b" | "c">("a");
  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(false);

  return (
    <Section
      id="atomos"
      index="05"
      eyebrow="Sistema"
      title="Kit de componentes"
      desc="Los átomos reutilizables, renderizados en el tema activo. Botones, badges, inputs, controles y tooltips."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <Eyebrow>Botones</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button>Primario</Button>
            <Button variant="accent">Acento</Button>
            <Button variant="ghost">Fantasma</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm">Pequeño</Button>
            <Button size="md">Mediano</Button>
            <Button size="lg">Grande</Button>
          </div>
        </Card>

        <Card className="p-6">
          <Eyebrow>Badges</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Pill>Neutral</Pill>
            <Pill tone="primary">Seleccionado</Pill>
            <Pill tone="profit">+ Liquidez</Pill>
            <Pill tone="loss">− Costo</Pill>
            <Pill tone="accent">Destacado</Pill>
          </div>
        </Card>

        <Card className="p-6">
          <Eyebrow>Campos</Eyebrow>
          <div className="mt-4 grid gap-4">
            <Field label="Bruto mensual" hint="USD">
              <Input placeholder="3,000" inputMode="numeric" />
            </Field>
            <Field label="Modalidad">
              <SegmentedControl
                aria-label="Demo segmentado"
                value={seg}
                onChange={setSeg}
                options={[
                  { value: "a", label: "Planilla" },
                  { value: "b", label: "Contractor" },
                  { value: "c", label: "Freelance" },
                ]}
              />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <Eyebrow>Controles</Eyebrow>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                Valorizar beneficios
                <InfoDot content="Convierte beneficios laborales a valor mensual." />
              </span>
              <Toggle checked={t1} onChange={setT1} />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Costo empresa</span>
              <Toggle checked={t2} onChange={setT2} />
            </label>
            <Divider />
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted">KPI</p>
                <Metric className="text-2xl font-bold text-ink">{money(2340)}</Metric>
              </div>
              <div>
                <p className="text-xs text-muted">Variación</p>
                <Metric className="text-2xl font-bold text-profit">+12%</Metric>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
