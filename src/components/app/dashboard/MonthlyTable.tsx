import { Card } from "@/components/common";
import { getStrategy, type Result } from "@/lib/calc";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import { cn } from "@/lib/cn";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Month-by-month salary comparison (informal vs formal role). The informal
 * role's net varies with each month's working days/hours (and its withholding);
 * the formal one is stable, with extras in the bonus months.
 */
export function MonthlyTable({
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
  const pair = [yours, equivalent];
  const informal = pair.find((r) => r.role === "informal");
  const formal = pair.find((r) => r.role === "formal");
  if (!informal || !formal) return null;

  const year = new Date().getFullYear();
  const totalDays = informal.months.reduce((a, m) => a + m.days, 0);
  const totalHours = informal.months.reduce((a, m) => a + m.hours, 0);
  const totalInformal = informal.months.reduce((a, m) => a + m.net, 0);
  const totalFormal = formal.months.reduce((a, m) => a + m.net, 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-5 pt-5">
        <PanelHeader title={`Salario mes a mes · ${year}`} type="Líquido" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line-strong">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">Mes</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Días</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Horas</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                <span className="inline-flex items-center gap-2 text-ink">
                  <span className="inline-block size-2 rounded-full" style={{ background: "var(--c2)" }} />
                  {strategy.modalities.informal.name}
                </span>
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                <span className="inline-flex items-center gap-2 text-ink">
                  <span className="inline-block size-2 rounded-full" style={{ background: "var(--c1)" }} />
                  {strategy.modalities.formal.name}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {informal.months.map((m, i) => (
              <tr key={m.month} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5 text-sm text-muted">{MONTHS[m.month - 1]}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-subtle">{m.days}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-subtle">{m.hours}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-ink">{money(m.net)}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-ink">
                  {money(formal.months[i].net)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line-strong bg-canvas-2">
              <td className="px-5 py-3 text-sm font-semibold text-ink">Total año</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-ink">{totalDays}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-ink">{totalHours}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-bold tabular-nums text-ink">{money(totalInformal)}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-bold tabular-nums text-ink">{money(totalFormal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
