"use client";

import { Eyebrow, Metric, InfoDot } from "@/components/common";

export interface KpiDelta {
  dir: "up" | "down" | "eq";
  text: string;
}

/**
 * KPI comparativo: valor de "tú" (protagonista) + valor de la otra modalidad +
 * el delta entre ambos. Todas las tarjetas comparten el mismo estilo neutro.
 */
export function KpiTile({
  label,
  value,
  compare,
  delta,
  info,
}: {
  label: string;
  value: string;
  compare?: { label: string; value: string };
  delta?: KpiDelta | null;
  info?: string;
}) {
  return (
    <div className="flex h-full flex-col gap-1.5 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <Eyebrow>{label}</Eyebrow>
        {info && <InfoDot content={info} />}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <Metric className="text-2xl font-bold text-ink">{value}</Metric>
        {delta && (
          <span className="text-xs font-semibold text-muted">
            {delta.dir === "up" ? "▲" : delta.dir === "down" ? "▼" : "="} {delta.text}
          </span>
        )}
      </div>
      {compare && (
        <p className="mt-auto text-xs text-subtle">
          {compare.label}: <span className="font-mono tabular-nums">{compare.value}</span>
        </p>
      )}
    </div>
  );
}
