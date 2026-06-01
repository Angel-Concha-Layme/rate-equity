"use client";

import { useState } from "react";
import { MODALIDADES, money, pct, valorHora } from "@/lib/sample";
import { Pill, Metric, Divider } from "@/components/common";
import { cn } from "@/lib/cn";

/* ==================================================================
 * Variantes de tarjeta para el tema "El Libro Mayor".
 * Ejemplo: Freelance (color de identidad = verde, var(--c3)).
 * Página: /lab/libro-mayor, bloqueada en data-theme="ledger".
 * ================================================================== */

const M = MODALIDADES.find((m) => m.key === "freelance")!;
const C = "var(--c3)"; // verde: identidad de la modalidad de ejemplo
const VH = valorHora(M.liquido, 40);
const DED = M.bruto - M.liquido; // deducciones
const OFF = Math.round((DED / M.bruto) * 100); // % que se va

/* fila contable con puntos guía */
function Row({
  k,
  v,
  accent,
  loss,
}: {
  k: string;
  v: string;
  accent?: boolean;
  loss?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <span className="shrink-0 text-muted">{k}</span>
      <span aria-hidden className="mb-1 flex-1 border-b border-dotted border-line-strong" />
      <span
        className={cn(
          "shrink-0 font-semibold tabular-nums",
          loss ? "text-loss" : accent ? "text-accent" : "text-ink",
        )}
      >
        {v}
      </span>
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("font-mono text-base font-semibold tabular-nums", accent ? "text-accent" : "text-ink")}>
        {value}
      </dd>
    </div>
  );
}

function Stats() {
  return (
    <dl className="grid grid-cols-2 gap-y-3 text-sm">
      <StatCell label="Comp. total" value={money(M.compTotal)} />
      <StatCell label="Costo empresa" value={money(M.costoEmpresa)} />
      <StatCell label="Carga fiscal" value={pct(M.cargaPct)} />
      <StatCell label="Valor / hora" value={money(VH, { decimals: 1 })} accent />
    </dl>
  );
}

/** Botón contenedor para variantes seleccionables. */
function Pick({
  sel,
  setSel,
  children,
}: {
  sel: boolean;
  setSel: (b: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => setSel(!sel)}
      aria-pressed={sel}
      className="group block w-full rounded-card text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </button>
  );
}

/* ================================================================== *
 * TARJETA DE MODALIDAD: 5 variantes
 * ================================================================== */

/** V1 · Folio: folio contable con doble filete y número de folio. */
export function FolioCard() {
  const [sel, setSel] = useState(false);
  return (
    <Pick sel={sel} setSel={setSel}>
      <div
        className={cn(
          "rounded-card bg-surface p-6 shadow-card transition",
          sel ? "border-2 border-primary shadow-pop" : "border border-line group-hover:shadow-pop",
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-ink">{M.nombre}</h3>
          <span className={cn("font-mono text-[0.7rem] uppercase tracking-[0.18em]", sel ? "text-primary" : "text-subtle")}>
            {sel ? "✓ Elegida" : "Fol. 03"}
          </span>
        </div>
        <p className="text-sm text-muted">{M.tagline}</p>
        <div className={cn("mt-3 border-t-[3px] border-double", sel ? "border-primary" : "border-line-strong")} />
        <p className="mt-5 text-xs uppercase tracking-wider text-muted">Liquidez neta / mes</p>
        <Metric className="text-3xl font-bold text-ink">{money(M.liquido)}</Metric>
        <div className="mb-5 mt-4">
          <Pill>{M.badge}</Pill>
        </div>
        <div className="border-t border-line pt-4">
          <Stats />
        </div>
      </div>
    </Pick>
  );
}

/** V2 · Margen: filete de color en el margen izquierdo (nada arriba). */
export function MargenCard() {
  const [sel, setSel] = useState(false);
  return (
    <Pick sel={sel} setSel={setSel}>
      <div
        className={cn(
          "relative overflow-hidden rounded-card bg-surface shadow-card transition",
          sel ? "border-2 border-primary shadow-pop" : "border border-line group-hover:shadow-pop",
        )}
      >
        <div className="absolute inset-y-0 left-0 transition-all" style={{ width: sel ? 9 : 5, background: C }} />
        <div className="py-6 pl-8 pr-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">{M.nombre}</h3>
              <p className="text-sm text-muted">{M.tagline}</p>
            </div>
            <Pill>{M.badge}</Pill>
          </div>
          <p className="mt-5 text-xs text-muted">Liquidez neta / mes</p>
          <Metric className="text-3xl font-bold text-ink">{money(M.liquido)}</Metric>
          <Divider className="my-5" />
          <Stats />
        </div>
      </div>
    </Pick>
  );
}

/** V3 · Sello: certificado con sello/monograma dorado. */
export function SelloCard() {
  const [sel, setSel] = useState(false);
  return (
    <Pick sel={sel} setSel={setSel}>
      <div
        className={cn(
          "rounded-card bg-surface p-6 shadow-card transition",
          sel ? "border-2 border-accent shadow-pop" : "border border-line group-hover:shadow-pop",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-accent">Modalidad</p>
            <h3 className="font-display text-xl font-semibold text-ink">{M.nombre}</h3>
            <p className="text-sm text-muted">{M.tagline}</p>
          </div>
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full border font-display text-sm font-bold transition",
              sel ? "border-accent bg-accent text-on-accent" : "border-accent/50 text-accent",
            )}
          >
            F
          </span>
        </div>
        <Divider className="my-5" />
        <p className="text-xs text-muted">Liquidez neta / mes</p>
        <Metric className="text-3xl font-bold text-ink">{money(M.liquido)}</Metric>
        <div className="mt-3">
          <Pill tone="accent">{M.badge}</Pill>
        </div>
        <div className="mt-5 border-t border-accent/30 pt-4">
          <Stats />
        </div>
      </div>
    </Pick>
  );
}

/** V4 · Broadsheet: cabecera de periódico, centrado y con reglas. */
export function BroadsheetCard() {
  const [sel, setSel] = useState(false);
  return (
    <Pick sel={sel} setSel={setSel}>
      <div
        className={cn(
          "rounded-card bg-surface p-6 shadow-card transition",
          sel ? "border-2 border-primary shadow-pop" : "border border-line group-hover:shadow-pop",
        )}
      >
        <div className={cn("border-y", sel ? "border-y-2 border-primary" : "border-line-strong")}>
          <h3 className="py-2 text-center font-display text-2xl font-semibold text-ink">{M.nombre}</h3>
        </div>
        <p className="mt-1.5 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted">{M.tagline}</p>
        <div className="mt-5 text-center">
          <p className="text-xs text-muted">Liquidez neta / mes</p>
          <Metric className="text-4xl font-bold text-ink">{money(M.liquido)}</Metric>
        </div>
        <div className="mt-4 flex justify-center">
          <Pill>{M.badge}</Pill>
        </div>
        <Divider className="my-5" />
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="space-y-3 pr-4">
            <StatCell label="Comp. total" value={money(M.compTotal)} />
            <StatCell label="Carga fiscal" value={pct(M.cargaPct)} />
          </div>
          <div className="space-y-3 pl-4">
            <StatCell label="Costo empresa" value={money(M.costoEmpresa)} />
            <StatCell label="Valor / hora" value={money(VH, { decimals: 1 })} accent />
          </div>
        </div>
      </div>
    </Pick>
  );
}

/** V5 · Cifra: la cifra manda; filas con puntos guía. */
export function CifraCard() {
  const [sel, setSel] = useState(false);
  return (
    <Pick sel={sel} setSel={setSel}>
      <div
        className={cn(
          "rounded-card bg-surface p-6 shadow-card transition",
          sel ? "border-2 border-primary shadow-pop" : "border border-line group-hover:shadow-pop",
        )}
      >
        <div className="flex items-center justify-between">
          <p className={cn("font-mono text-[0.7rem] uppercase tracking-[0.18em]", sel ? "text-primary" : "text-muted")}>
            {M.nombre}
          </p>
          <span className="size-2.5 rounded-full" style={{ background: C }} />
        </div>
        <div className="mt-6">
          <Metric className="block text-5xl font-bold text-ink">{money(M.liquido)}</Metric>
          <div className={cn("mt-2 w-16 border-t-2 transition-colors", sel ? "border-primary" : "border-transparent")} />
          <p className="mt-1.5 text-xs text-muted">Liquidez neta / mes · {M.badge.toLowerCase()}</p>
        </div>
        <div className="mt-6 border-t border-line pt-3 font-mono text-sm">
          <Row k="Comp. total" v={money(M.compTotal)} />
          <Row k="Costo empresa" v={money(M.costoEmpresa)} />
          <Row k="Carga fiscal" v={pct(M.cargaPct)} />
          <Row k="Valor / hora" v={money(VH, { decimals: 1 })} accent />
        </div>
      </div>
    </Pick>
  );
}

/* ================================================================== *
 * TARJETA DE EQUIVALENCIA (bruto -> líquido): 4 variantes (estáticas)
 * ================================================================== */

/** E1 · Recibo, estado de cuenta: bruto − cargas = líquido. */
export function ReciboCard() {
  return (
    <div className="rounded-card border border-line bg-surface p-7 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">{M.nombre} · estado</p>
        <Pill>{M.badge}</Pill>
      </div>
      <div className="mt-6 font-mono text-sm">
        <Row k="Bruto de portada" v={money(M.bruto)} />
        <Row k="Impuestos y cargas" v={money(-DED, { sign: true })} loss />
      </div>
      <div className="mt-2 flex items-baseline justify-between border-t-[3px] border-double border-ink/60 pt-3">
        <span className="text-xs uppercase tracking-wider text-muted">Líquido real</span>
        <Metric className="text-3xl font-bold text-ink">{money(M.liquido)}</Metric>
      </div>
      <p className="mt-5 text-xs text-subtle">* Cifras de ejemplo, ilustrativas.</p>
    </div>
  );
}

/** E2 · Antes → Después: dos columnas balanceadas con filete central. */
export function AntesDespuesCard() {
  return (
    <div className="rounded-card border border-line bg-surface p-7 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">{M.nombre}</p>
        <Pill>{M.badge}</Pill>
      </div>
      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
        <div>
          <p className="text-xs text-muted">Bruto de portada</p>
          <Metric className="text-2xl text-subtle line-through decoration-loss/50">{money(M.bruto)}</Metric>
        </div>
        <div className="h-12 w-px bg-line-strong" />
        <div className="text-right">
          <p className="text-xs text-muted">Líquido real</p>
          <Metric className="text-4xl font-bold text-ink">{money(M.liquido)}</Metric>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="grid grid-cols-2 gap-4">
        <StatCell label="Comp. total" value={money(M.compTotal)} />
        <StatCell label="Costo empresa" value={money(M.costoEmpresa)} />
      </div>
    </div>
  );
}

/** E3 · Titular, cita editorial: la cifra como titular. */
export function TitularCard() {
  return (
    <div className="rounded-card border border-line bg-surface p-7 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">{M.nombre}</p>
        <Pill>{M.badge}</Pill>
      </div>
      <div className="mt-6 border-l-2 border-accent pl-5">
        <Metric className="block text-5xl font-bold text-ink">{money(M.liquido)}</Metric>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          de un bruto de <span className="font-semibold text-ink">{money(M.bruto)}</span>, del que el{" "}
          <span className="font-semibold text-loss">{OFF}%</span> se va en impuestos y cargas.
        </p>
      </div>
      <Divider className="my-6" />
      <div className="grid grid-cols-2 gap-4">
        <StatCell label="Comp. total" value={money(M.compTotal)} />
        <StatCell label="Costo empresa" value={money(M.costoEmpresa)} />
      </div>
    </div>
  );
}

/** E4 · Balance: cuenta T contable con doble filete de cierre. */
export function BalanceCard() {
  return (
    <div className="rounded-card border border-line bg-surface p-7 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{M.nombre}</h3>
        <Pill>{M.badge}</Pill>
      </div>
      <div className="mt-5 border-t-2 border-ink font-mono text-sm">
        <Row k="Bruto de portada" v={money(M.bruto)} />
        <Row k="Comp. total" v={money(M.compTotal)} />
        <Row k="Costo empresa" v={money(M.costoEmpresa)} loss />
      </div>
      <div className="mt-1 flex items-baseline justify-between border-t-[3px] border-double border-ink/60 pt-3">
        <span className="text-xs uppercase tracking-wider text-muted">Líquido real</span>
        <Metric className="text-3xl font-bold text-ink">{money(M.liquido)}</Metric>
      </div>
    </div>
  );
}

/* ------------------------------- registros ------------------------------- */
export const MODALITY_VARIANTS = [
  { id: "V1", name: "Folio", note: "Folio contable: doble filete y número de folio.", Comp: FolioCard },
  { id: "V2", name: "Margen", note: "Filete de color en el margen izquierdo (nada arriba).", Comp: MargenCard },
  { id: "V3", name: "Sello", note: "Certificado con sello/monograma dorado.", Comp: SelloCard },
  { id: "V4", name: "Broadsheet", note: "Cabecera de periódico, centrada y con reglas.", Comp: BroadsheetCard },
  { id: "V5", name: "Cifra", note: "La cifra manda; filas con puntos guía.", Comp: CifraCard },
] as const;

export const EQUIV_VARIANTS = [
  { id: "E1", name: "Recibo", note: "Estado de cuenta: bruto − cargas = líquido.", Comp: ReciboCard },
  { id: "E2", name: "Antes → Después", note: "Dos columnas balanceadas con filete central.", Comp: AntesDespuesCard },
  { id: "E3", name: "Titular", note: "Cita editorial: la cifra como titular.", Comp: TitularCard },
  { id: "E4", name: "Balance", note: "Cuenta T contable con doble filete de cierre.", Comp: BalanceCard },
] as const;
