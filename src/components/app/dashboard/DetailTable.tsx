import { Card } from "@/components/common";
import { money, pct } from "@/lib/sample";
import type { Resultado } from "@/lib/calc";
import { cn } from "@/lib/cn";

interface Row {
  label: string;
  get: (x: Resultado) => string;
  emphasis?: boolean;
  tone?: "loss" | "profit";
  sub?: boolean;
}

const ROWS: Row[] = [
  { label: "Bruto mensual", get: (x) => money(x.bruto) },
  { label: "Líquido mensual (mes típico)", get: (x) => money(x.liquido) },
  { label: "Promedio mensual real", get: (x) => money(x.promedioMensual), emphasis: true, tone: "profit" },
  { label: "Costo para la empresa / mes", get: (x) => money(x.costoEmpresa), tone: "loss" },
  { label: "Carga (impuestos + aportes)", get: (x) => pct(x.cargaPct), tone: "loss" },
  { label: "Valor por hora efectiva", get: (x) => money(x.valorHora, { decimals: 1 }) },
  { label: "Ingreso total anual", get: (x) => money(x.anual.ingresoTotal), sub: true },
  { label: "Impuesto a la renta anual", get: (x) => money(x.anual.impuesto), tone: "loss", sub: true },
  { label: "Pensión (AFP) anual", get: (x) => money(x.anual.pension), sub: true },
  { label: "Salud (EsSalud / seguro) anual", get: (x) => money(x.anual.salud), sub: true },
  { label: "Beneficios (grati + CTS) anual", get: (x) => money(x.anual.beneficios), tone: "profit", sub: true },
  { label: "Valor económico total anual", get: (x) => money(x.anual.valorTotal), emphasis: true, sub: true },
];

/** Tabla de detalle anual comparando tu modalidad con la equivalente. */
export function DetailTable({
  tuyo,
  equivalente,
  className,
}: {
  tuyo: Resultado;
  equivalente: Resultado;
  className?: string;
}) {
  const cols = [tuyo, equivalente];
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
                    {x.nombre}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
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
                    {row.get(x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
