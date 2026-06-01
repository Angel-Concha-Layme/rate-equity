import { Fragment } from "react";

export type RadarTooltipRow = {
  key: string;
  /** Nombre de la modalidad (columna izquierda). */
  name: string;
  /** Valor ya formateado (columna derecha, alineado en columna). */
  value: string;
  /** Color del punto y del valor. */
  color: string;
};

/**
 * Tooltip del radar. Usa un grid de dos columnas para que los nombres queden
 * a la izquierda y las cantidades alineadas en una misma columna, sin depender
 * del ancho de cada etiqueta. El padding horizontal deja aire a ambos lados.
 */
export function RadarTooltip({
  title,
  reason,
  rows,
}: {
  title: string;
  reason?: string;
  rows: RadarTooltipRow[];
}) {
  return (
    <div className="w-max max-w-[240px] rounded-input border border-line bg-surface px-3.5 py-2.5 text-xs shadow-pop">
      <p className="font-semibold text-ink">{title}</p>
      <div className="mt-1.5 grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1">
        {rows.map((r) => (
          <Fragment key={r.key}>
            <span className="flex items-center gap-1.5 text-muted">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
            <span className="text-right font-mono font-semibold tabular-nums" style={{ color: r.color }}>
              {r.value}
            </span>
          </Fragment>
        ))}
      </div>
      {reason && <p className="mt-1.5 text-[0.7rem] leading-snug text-subtle">{reason}</p>}
    </div>
  );
}
