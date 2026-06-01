import { Card } from "@/components/common";
import { pct } from "@/lib/sample";
import { getStrategy, type Result } from "@/lib/calc";
import { cn } from "@/lib/cn";

/** Annual detail table comparing your modality with the equivalent one. */
export function DetailTable({
  yours,
  equivalent,
  country,
  className,
}: {
  yours: Result;
  equivalent: Result;
  country: string;
  className?: string;
}) {
  const strategy = getStrategy(country);
  const money = strategy.money;
  const rows = strategy.detailRows();
  const fmt = { money, pct };
  const cols = [yours, equivalent];
  const hasExpenses = !!yours.monthlyExpenses;
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line-strong">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">Concepto</th>
              {cols.map((x, i) => (
                <th key={x.key} className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-2 text-ink">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ background: i === 0 ? "var(--c1)" : "var(--c2)" }}
                    />
                    {i === 0 ? "Tú · " : ""}
                    {x.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className={cn("border-b border-line last:border-0", row.emphasis && "bg-canvas-2")}>
                <td
                  className={cn(
                    "px-5 py-3 text-sm text-muted",
                    row.sub && "pl-8 text-subtle",
                    row.emphasis && "font-semibold text-ink",
                  )}
                >
                  {row.label}
                </td>
                {cols.map((x) => (
                  <td
                    key={x.key}
                    className={cn(
                      "px-5 py-3 text-right font-mono text-sm tabular-nums",
                      row.emphasis ? "font-bold text-ink" : "text-ink",
                      row.tone === "loss" && "text-loss",
                      row.tone === "profit" && "text-profit",
                    )}
                  >
                    {row.get(x, fmt)}
                  </td>
                ))}
              </tr>
            ))}
            {hasExpenses && (
              <>
                <tr className="border-b border-line">
                  <td className="px-5 py-3 text-sm text-muted">Gastos fijos / mes</td>
                  {cols.map((x) => (
                    <td key={x.key} className="px-5 py-3 text-right font-mono text-sm tabular-nums text-loss">
                      {money(x.monthlyExpenses ?? 0)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-line bg-canvas-2 last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-ink">Disponible / mes</td>
                  {cols.map((x) => (
                    <td key={x.key} className="px-5 py-3 text-right font-mono text-sm font-bold tabular-nums text-ink">
                      {money(x.disposable ?? 0)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
