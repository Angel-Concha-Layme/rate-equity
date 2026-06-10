"use client";

import { Card, Eyebrow, Metric, InfoDot } from "@/components/common";

export interface KpiDelta {
  dir: "up" | "down" | "eq";
  text: string;
}

/**
 * Comparative KPI: "your" value (the focus) + the other modality's value + the
 * delta between them. All tiles share the same neutral style.
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
    <Card className="flex h-full flex-col gap-1.5 p-4">
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
    </Card>
  );
}
