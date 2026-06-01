import { Fragment } from "react";

export type RadarTooltipRow = {
  key: string;
  /** Modality name (left column). */
  name: string;
  /** Already-formatted value (right column, aligned in a column). */
  value: string;
  /** Color of the dot and the value. */
  color: string;
};

/**
 * Radar tooltip. Uses a two-column grid so the names stay on the left and the
 * amounts align in a single column, regardless of each label's width. The
 * horizontal padding leaves air on both sides.
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
