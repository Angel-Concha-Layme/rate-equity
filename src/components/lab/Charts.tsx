"use client";

import { useState } from "react";
import { MODALIDADES, RADAR_AXES, money, type BreakdownStep, type Modalidad } from "@/lib/sample";

/** Qué representa cada eje del radar (el "por qué" de la diferencia). */
const AXIS_RAZON: Record<string, string> = {
  liquidez: "Efectivo neto que recibes cada mes.",
  compTotal: "Valor económico total; el equivalente se calcula para igualarlo.",
  beneficios: "Gratificaciones, CTS y salud valorizados al mes.",
  estabilidad: "Continuidad del ingreso y protección laboral.",
  flexibilidad: "Libertad de horario, clientes y forma de trabajo.",
};

/** Valor a mostrar por eje y modalidad (money para los monetarios, cualitativo para el resto). */
function valorEje(key: keyof Modalidad["radar"], m: Modalidad): string {
  if (key === "liquidez") return `${money(m.liquido)}/mes`;
  if (key === "compTotal") return `${money(m.compTotal)}/mes`;
  if (key === "beneficios") return `${money(m.beneficios)}/mes`;
  const s = m.radar[key];
  return s >= 66 ? "Alta" : s >= 33 ? "Media" : "Baja";
}

/* ------------------------------------------------------------------ *
 * Sparkline: estabilidad del ingreso mes a mes
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
 * Waterfall: bruto -> deducciones -> líquido -> beneficios -> total
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
      return "var(--muted)";
    case "dec":
      return "var(--loss)";
    case "inc":
      return "var(--profit)";
    case "subtotal":
      return "var(--accent)";
    case "total":
      return "var(--primary)";
  }
}

export function WaterfallChart({
  steps,
  className = "block h-auto w-full",
}: {
  steps: BreakdownStep[];
  className?: string;
}) {
  const W = 760;
  const H = 268;
  const PL = 16;
  const PR = 16;
  const PT = 40;
  const PB = 50;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const n = steps.length;
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
      run = s.amount;
      y0n = 0;
      y1n = run;
      runAfter = run;
    } else {
      const st = run;
      const en = run + s.amount;
      y0n = Math.min(st, en);
      y1n = Math.max(st, en);
      run = en;
      runAfter = en;
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
    >
      {/* línea base */}
      <line x1={PL} y1={y(0)} x2={W - PR} y2={y(0)} stroke="var(--chart-axis)" strokeWidth="1" />

      {bars.map((b, i) => {
        const top = y(b.y1n);
        const bottom = y(b.y0n);
        const h = Math.max(bottom - top, b.amount === 0 ? 0 : 2);
        const color = stepColor(b.kind);
        const isFloat = b.kind === "inc" || b.kind === "dec";
        const labelText = isFloat
          ? money(b.amount, { sign: true })
          : money(b.amount);
        const arrow = b.kind === "dec" ? "▾ " : b.kind === "inc" ? "▴ " : "";
        return (
          <g key={i}>
            {/* conector punteado */}
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
            {/* barra */}
            {b.amount === 0 ? (
              <line x1={b.cx - barW / 2} y1={y(b.runAfter)} x2={b.cx + barW / 2} y2={y(b.runAfter)} stroke={color} strokeWidth="2" />
            ) : (
              <rect x={b.cx - barW / 2} y={top} width={barW} height={h} rx="3" fill={color} />
            )}
            {/* etiqueta de valor */}
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
            {/* etiqueta de eje X */}
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
 * HBars: comparación horizontal entre modalidades (HTML/CSS)
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
 * Radar: comparación multi-atributo
 * ------------------------------------------------------------------ */
export function RadarChart({ modalidades = MODALIDADES }: { modalidades?: Modalidad[] } = {}) {
  // viewBox más ancho que alto: deja margen horizontal para las etiquetas
  // laterales (antes se recortaban). El svg se dimensiona por ancho.
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
          {/* anillos */}
          {rings.map((ring, ri) => (
            <polygon
              key={ri}
              points={axes.map((_, i) => polar(R * ring, i).join(",")).join(" ")}
              fill="none"
              stroke="var(--chart-grid)"
              strokeWidth="1"
            />
          ))}
          {/* series */}
          {modalidades.map((m, mi) => {
            const pts = axes.map((ax, i) => polar((R * m.radar[ax.key]) / 100, i).join(",")).join(" ");
            return <polygon key={m.key} points={pts} fill={colors[mi]} fillOpacity="0.13" stroke={colors[mi]} strokeWidth="2" strokeLinejoin="round" />;
          })}
          {/* radios + etiquetas (con zona de hover por arista) */}
          {axes.map((ax, i) => {
            const [ex, ey] = polar(R, i);
            const [lx, ly] = polar(R + 20, i);
            const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
            const active = hover === i;
            return (
              <g
                key={ax.key}
                className="cursor-help"
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
                {/* zona invisible para facilitar el hover sobre la etiqueta */}
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
            // Tooltip hacia el interior del radar: queda dentro de la card y el
            // fondo opaco lo hace legible sobre las series.
            const tx = lx < cx - 6 ? "0%" : lx > cx + 6 ? "-100%" : "-50%";
            const ty = ly < cy - 6 ? "0%" : ly > cy + 6 ? "-100%" : "-50%";
            return (
              <div
                className="pointer-events-none absolute w-max max-w-[210px] rounded-input border border-line bg-surface p-2.5 text-xs shadow-pop"
                style={{
                  left: `${(lx / W) * 100}%`,
                  top: `${(ly / H) * 100}%`,
                  transform: `translate(${tx}, ${ty})`,
                }}
              >
                <p className="font-semibold text-ink">{ax.label}</p>
                <div className="mt-1.5 space-y-1">
                  {modalidades.map((m, mi) => (
                    <div key={m.key} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-muted">
                        <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: colors[mi] }} />
                        {m.nombre}
                      </span>
                      <span className="font-mono font-semibold tabular-nums" style={{ color: colors[mi] }}>
                        {valorEje(ax.key, m)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[0.7rem] leading-snug text-subtle">{AXIS_RAZON[ax.key]}</p>
              </div>
            );
          })()}
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1">
        {modalidades.map((m, mi) => (
          <div key={m.key} className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[mi] }} />
            {m.nombre}
          </div>
        ))}
      </div>
    </div>
  );
}
