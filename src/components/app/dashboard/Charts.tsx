"use client";

import { useState } from "react";
import { MODALITIES, RADAR_AXES, money, type BreakdownStep, type Modality, type MoneyFn } from "@/lib/sample";
import { RadarTooltip } from "@/components/app/dashboard/RadarTooltip";

/** "Eye" cursor (inline SVG) to signal that the axis reveals information. */
const EYE_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%231b2a4a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E\") 11 11, pointer";

/** What each radar axis represents (the "why" of the difference). */
const AXIS_REASON: Record<string, string> = {
  liquidity: "Efectivo neto que recibes cada mes.",
  totalComp: "Valor económico total; el equivalente se calcula para igualarlo.",
  benefits: "Gratificaciones, CTS y salud valorizados al mes.",
  stability: "Continuidad del ingreso y protección laboral.",
  flexibility: "Libertad de horario, clientes y forma de trabajo.",
};

/** Value to show per axis and modality (money for monetary ones, qualitative for the rest). */
function axisValue(key: keyof Modality["radar"], m: Modality, fmt: MoneyFn): string {
  if (key === "liquidity") return `${fmt(m.net)}/mes`;
  if (key === "totalComp") return `${fmt(m.totalComp)}/mes`;
  if (key === "benefits") return `${fmt(m.benefits)}/mes`;
  const s = m.radar[key];
  return s >= 66 ? "Alta" : s >= 33 ? "Media" : "Baja";
}

/* ------------------------------------------------------------------ *
 * Sparkline: month-to-month income stability
 * ------------------------------------------------------------------ */
export function Sparkline({
  data,
  color = "var(--c1)",
  width = 96,
  height = 28,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (data.length - 1);
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  const id = `sl-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Waterfall: gross -> deductions -> net -> benefits -> total
 * ------------------------------------------------------------------ */
function wrapLabel(label: string): string[] {
  if (label.length <= 11) return [label];
  const words = label.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 11 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = `${cur} ${w}`.trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

function stepColor(kind: BreakdownStep["kind"]): string {
  switch (kind) {
    case "start":
      return "var(--wf-start)";
    case "dec":
      return "var(--loss)";
    case "inc":
      return "var(--profit)";
    case "subtotal":
      return "var(--wf-subtotal)";
    case "total":
      return "var(--wf-total)";
  }
}

export function WaterfallChart({
  steps,
  className = "block h-auto mx-auto",
  money: fmt = money,
}: {
  steps: BreakdownStep[];
  className?: string;
  money?: MoneyFn;
}) {
  const H = 268;
  const PL = 16;
  const PR = 16;
  const PT = 40;
  const PB = 50;
  // Width is driven by the number of bars: each gets a fixed slot wide enough
  // for its bottom label (no overlap). The chart is centered and capped to the
  // card width (max-w-full), so it only takes the horizontal space it needs.
  const SLOT = 100;
  const n = steps.length;
  const W = PL + PR + n * SLOT;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const slot = innerW / n;
  const barW = Math.min(62, slot * 0.56);

  const bars: Array<
    BreakdownStep & { y0n: number; y1n: number; runAfter: number; cx: number }
  > = [];
  let run = 0;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    let y0n: number, y1n: number, runAfter: number;
    if (s.kind === "start" || s.kind === "subtotal" || s.kind === "total") {
      y0n = 0;
      y1n = s.amount;
      // A branch absolute step (e.g. "Disponible") is shown but keeps the main
      // running total at its current value so following steps continue from it.
      if (s.branch) {
        runAfter = run;
      } else {
        run = s.amount;
        runAfter = run;
      }
    } else {
      const st = run;
      const en = run + s.amount;
      y0n = Math.min(st, en);
      y1n = Math.max(st, en);
      // A branch delta (e.g. "Gastos fijos") hangs from the line without
      // reducing the main running total.
      if (s.branch) {
        runAfter = run;
      } else {
        run = en;
        runAfter = en;
      }
    }
    bars.push({ ...s, y0n, y1n, runAfter, cx: PL + slot * (i + 0.5) });
  }

  const maxY = Math.max(...bars.map((b) => b.y1n)) * 1.06 || 1;
  const y = (v: number) => PT + innerH * (1 - v / maxY);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Desglose en cascada del bruto al neto y compensación total"
      className={className}
      style={{ width: W, maxWidth: "100%" }}
    >
      <line x1={PL} y1={y(0)} x2={W - PR} y2={y(0)} stroke="var(--chart-axis)" strokeWidth="1" />

      {bars.map((b, i) => {
        const top = y(b.y1n);
        const bottom = y(b.y0n);
        const h = Math.max(bottom - top, b.amount === 0 ? 0 : 2);
        const color = stepColor(b.kind);
        const isFloat = b.kind === "inc" || b.kind === "dec";
        const labelText = isFloat
          ? fmt(b.amount, { sign: true })
          : fmt(b.amount);
        const arrow = b.kind === "dec" ? "▾ " : b.kind === "inc" ? "▴ " : "";
        return (
          <g key={i}>
            {i < n - 1 && (
              <line
                x1={b.cx + barW / 2}
                y1={y(b.runAfter)}
                x2={bars[i + 1].cx - barW / 2}
                y2={y(b.runAfter)}
                stroke="var(--chart-axis)"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.8"
              />
            )}
            {b.amount === 0 ? (
              <line x1={b.cx - barW / 2} y1={y(b.runAfter)} x2={b.cx + barW / 2} y2={y(b.runAfter)} stroke={color} strokeWidth="2" />
            ) : (
              <rect x={b.cx - barW / 2} y={top} width={barW} height={h} rx="3" fill={color} />
            )}
            <text
              x={b.cx}
              y={top - 9}
              textAnchor="middle"
              className="font-mono tabular-nums"
              fontSize="12.5"
              fontWeight="600"
              fill={isFloat ? color : "var(--ink)"}
            >
              {arrow}
              {labelText}
            </text>
            {wrapLabel(b.label).map((ln, li, arr) => (
              <text
                key={li}
                x={b.cx}
                y={H - PB + 18 + li * 15 - (arr.length - 1) * 0}
                textAnchor="middle"
                fontSize="14"
                fill="var(--muted)"
                className="font-sans"
              >
                {ln}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * HBars: horizontal comparison between modalities (HTML/CSS)
 * ------------------------------------------------------------------ */
export function HBars({
  rows,
  max,
}: {
  rows: { label: string; value: number; color: string; highlight?: boolean }[];
  max: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3" role="img" aria-label={`${r.label}: ${money(r.value)}`}>
          <div className="w-24 shrink-0 text-sm text-muted">{r.label}</div>
          <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-surface-2">
            <div
              className="h-full rounded-md transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max((r.value / max) * 100, 2)}%`,
                background: r.color,
                boxShadow: r.highlight ? `0 0 0 1px ${r.color}` : undefined,
              }}
            />
          </div>
          <div className="w-20 shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-ink">
            {money(r.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Radar: multi-attribute comparison
 * ------------------------------------------------------------------ */
export function RadarChart({
  modalities = MODALITIES,
  money: fmt = money,
}: { modalities?: Modality[]; money?: MoneyFn } = {}) {
  // viewBox wider than tall: leaves horizontal margin for the side labels
  // (they used to be clipped). The svg is sized by width.
  const W = 440;
  const H = 360;
  const cx = W / 2;
  const cy = H / 2;
  const R = 104;
  const axes = RADAR_AXES;
  const N = axes.length;
  const colors = ["var(--c1)", "var(--c2)", "var(--c3)"];

  const polar = (r: number, i: number) => {
    const a = (-90 + (i * 360) / N) * (Math.PI / 180);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];

  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full max-w-[560px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full"
          role="img"
          aria-label="Comparación de modalidades por atributo"
        >
          {rings.map((ring, ri) => (
            <polygon
              key={ri}
              points={axes.map((_, i) => polar(R * ring, i).join(",")).join(" ")}
              fill="none"
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
          ))}
          {modalities.map((m, mi) => {
            const pts = axes.map((ax, i) => polar((R * m.radar[ax.key]) / 100, i).join(",")).join(" ");
            return <polygon key={m.key} points={pts} fill={colors[mi]} fillOpacity="0.13" stroke={colors[mi]} strokeWidth="2" strokeLinejoin="round" />;
          })}
          {axes.map((ax, i) => {
            const [ex, ey] = polar(R, i);
            const [lx, ly] = polar(R + 20, i);
            const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
            const active = hover === i;
            return (
              <g
                key={ax.key}
                style={{ cursor: EYE_CURSOR }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <line
                  x1={cx}
                  y1={cy}
                  x2={ex}
                  y2={ey}
                  stroke={active ? "var(--chart-axis, var(--muted))" : "var(--chart-grid)"}
                  strokeWidth={active ? 1.5 : 1}
                />
                {/* invisible zone to ease hovering over the label */}
                <circle cx={lx} cy={ly} r={30} fill="transparent" />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="11.5"
                  fontWeight={active ? 700 : 500}
                  fill={active ? "var(--ink)" : "var(--muted)"}
                  className="font-sans"
                >
                  {ax.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hover !== null &&
          (() => {
            const ax = axes[hover];
            const [lx, ly] = polar(R + 20, hover);
            // Tooltip toward the inside of the radar: stays within the card and
            // the opaque background keeps it legible over the series.
            const tx = lx < cx - 6 ? "0%" : lx > cx + 6 ? "-100%" : "-50%";
            const ty = ly < cy - 6 ? "0%" : ly > cy + 6 ? "-100%" : "-50%";
            return (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: `${(lx / W) * 100}%`,
                  top: `${(ly / H) * 100}%`,
                  transform: `translate(${tx}, ${ty})`,
                }}
              >
                <RadarTooltip
                  title={ax.full ?? ax.label}
                  reason={AXIS_REASON[ax.key]}
                  rows={modalities.map((m, mi) => ({
                    key: m.key,
                    name: m.name,
                    value: axisValue(ax.key, m, fmt),
                    color: colors[mi],
                  }))}
                />
              </div>
            );
          })()}
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1">
        {modalities.map((m, mi) => (
          <div key={m.key} className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[mi] }} />
            {m.name}
          </div>
        ))}
      </div>
    </div>
  );
}
