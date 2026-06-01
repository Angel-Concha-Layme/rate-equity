import { Card, Divider, Metric, Pill } from "@/components/common";
import { pct, type MoneyFn } from "@/lib/sample";
import type { Result } from "@/lib/calc";
import { cn } from "@/lib/cn";

function Stat({ dt, dd, accent }: { dt: string; dd: string; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{dt}</dt>
      <dd className={cn("font-mono text-base font-semibold tabular-nums", accent ? "text-accent" : "text-ink")}>
        {dd}
      </dd>
    </div>
  );
}

/**
 * Summary card of a modality (Planilla / Independiente). Uses the shared `Card`
 * and distributes its content to match the height of its row.
 */
export function ModalityCard({
  res,
  color,
  label,
  active,
  money,
  className,
}: {
  res: Result;
  color: string;
  label: string;
  active: boolean;
  money: MoneyFn;
  className?: string;
}) {
  // The size of the headline figures adapts to their length so that two large
  // amounts (currencies with many digits) do not overflow or overlap.
  const netStr = money(res.net);
  const grossStr = money(res.gross);
  const maxLen = Math.max(netStr.length, grossStr.length);
  const metricSize = maxLen >= 12 ? "text-xl" : maxLen >= 10 ? "text-2xl" : "text-3xl";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em]" style={{ color }}>
            {label}
          </p>
          <h3 className="font-display text-xl font-semibold text-ink">{res.name}</h3>
          <p className="text-sm text-muted">{res.tagline}</p>
        </div>
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full border border-line font-display text-sm font-bold transition"
          style={active ? { background: color, borderColor: color, color: "var(--on-primary)" } : { color }}
        >
          {res.name.charAt(0)}
        </span>
      </div>

      <Divider className="my-4" />

      <div className="grid grid-cols-2 items-end gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="text-xs text-muted">Liquidez neta / mes</p>
          <Metric className={cn("block truncate font-bold text-ink", metricSize)}>{netStr}</Metric>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">Bruto / mes</p>
          <Metric className={cn("block truncate font-bold text-ink", metricSize)}>{grossStr}</Metric>
        </div>
      </div>
      <div className="mt-2">
        <Pill>{res.badge}</Pill>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <Stat dt="Comp. total" dd={money(res.totalComp)} />
          <Stat dt="Costo empresa" dd={money(res.employerCost)} />
          <Stat dt="Carga fiscal" dd={pct(res.loadPct)} />
          <Stat dt="Valor / hora" dd={money(res.hourlyValue, { decimals: 1 })} accent />
        </dl>
      </div>
    </Card>
  );
}
