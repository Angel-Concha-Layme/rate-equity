import { Card } from "@/components/common";
import { money } from "@/lib/sample";
import type { Resultado } from "@/lib/calc";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import { cn } from "@/lib/cn";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Salario mes a mes comparado (Independiente vs Planilla). El líquido del
 * independiente varía con los días/horas laborables de cada mes (y su retención
 * de 8%); el de planilla es estable, con gratificación en julio y diciembre.
 */
export function MonthlyTable({
  tuyo,
  equivalente,
  className,
}: {
  tuyo: Resultado;
  equivalente: Resultado;
  className?: string;
}) {
  const pair = [tuyo, equivalente];
  const indep = pair.find((r) => r.key === "independiente");
  const plan = pair.find((r) => r.key === "planilla");
  if (!indep || !plan) return null;

  const year = new Date().getFullYear();
  const totalDias = indep.meses.reduce((a, m) => a + m.dias, 0);
  const totalHoras = indep.meses.reduce((a, m) => a + m.horas, 0);
  const totalIndep = indep.meses.reduce((a, m) => a + m.liquido, 0);
  const totalPlan = plan.meses.reduce((a, m) => a + m.liquido, 0);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-5 pt-5">
        <PanelHeader titulo={`Salario mes a mes · ${year}`} tipo="Líquido" />
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
                  Independiente
                </span>
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                <span className="inline-flex items-center gap-2 text-ink">
                  <span className="inline-block size-2 rounded-full" style={{ background: "var(--c1)" }} />
                  Planilla
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {indep.meses.map((m, i) => (
              <tr key={m.mes} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5 text-sm text-muted">{MESES[m.mes - 1]}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-subtle">{m.dias}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-subtle">{m.horas}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-ink">{money(m.liquido)}</td>
                <td className="px-5 py-2.5 text-right font-mono text-sm tabular-nums text-ink">
                  {money(plan.meses[i].liquido)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line-strong bg-canvas-2">
              <td className="px-5 py-3 text-sm font-semibold text-ink">Total año</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-ink">{totalDias}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-semibold tabular-nums text-ink">{totalHoras}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-bold tabular-nums text-ink">{money(totalIndep)}</td>
              <td className="px-5 py-3 text-right font-mono text-sm font-bold tabular-nums text-ink">{money(totalPlan)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
