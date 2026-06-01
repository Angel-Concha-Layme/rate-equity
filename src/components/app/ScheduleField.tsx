"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/common";
import { cn } from "@/lib/cn";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PRESETS: { label: string; schedule: number[] }[] = [
  { label: "L-V · 8h", schedule: [8, 8, 8, 8, 8, 0, 0] },
  { label: "L-V · 4h", schedule: [4, 4, 4, 4, 4, 0, 0] },
  { label: "L-S · 8h", schedule: [8, 8, 8, 8, 8, 8, 0] },
  { label: "L-V · 9h", schedule: [9, 9, 9, 9, 9, 0, 0] },
];

export function scheduleSummary(h: number[]): string {
  const week = h.slice(0, 5);
  const weekend = h.slice(5);
  if (week.every((x) => x === week[0]) && weekend.every((x) => x === 0) && week[0] > 0)
    return `L-V · ${week[0]}h/día`;
  if (h.every((x) => x === h[0]) && h[0] > 0) return `todos los días · ${h[0]}h`;
  return "horario personalizado";
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, Math.min(24, v)));
  const btn =
    "grid size-8 place-items-center rounded-input border border-line-strong text-lg leading-none text-ink transition hover:bg-surface-2";
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="menos" onClick={() => set(value - 1)} className={btn}>
        −
      </button>
      <input
        type="number"
        min={0}
        max={24}
        value={value}
        onChange={(e) => set(Number(e.target.value) || 0)}
        className="w-14 rounded-input border border-line-strong bg-surface-2 px-2 py-1.5 text-center font-mono text-sm tabular-nums text-ink focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
      />
      <button type="button" aria-label="más" onClick={() => set(value + 1)} className={btn}>
        +
      </button>
    </div>
  );
}

export function ScheduleField({
  schedule,
  onChange,
}: {
  schedule: number[];
  onChange: (h: number[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(schedule);
  const total = schedule.reduce((a, b) => a + b, 0);
  const draftTotal = draft.reduce((a, b) => a + b, 0);

  const openModal = () => {
    setDraft(schedule);
    setOpen(true);
  };
  const save = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label="Editar horario semanal"
        className="flex w-full items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-left transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
      >
        <span className="text-[0.95rem]">
          <span className="font-mono font-semibold tabular-nums text-ink">{total} h</span>
          <span className="text-muted"> / sem · {scheduleSummary(schedule)}</span>
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Horario semanal">
        <p className="mb-4 text-sm text-muted">
          Define las horas que trabajas cada día. Usa un preset o edítalo a tu medida.
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const activo = p.schedule.every((x, i) => x === draft[i]);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setDraft([...p.schedule])}
                className={cn(
                  "rounded-pill border px-3 py-1.5 text-xs font-semibold transition",
                  activo
                    ? "border-ink bg-surface-2 text-ink"
                    : "border-line-strong bg-surface-2 text-muted hover:text-ink",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="space-y-1.5">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                "flex items-center justify-between gap-3 rounded-input px-2 py-1",
                draft[i] === 0 && "opacity-60",
              )}
            >
              <span className="w-12 text-sm font-medium text-ink">{d}</span>
              <Stepper value={draft[i]} onChange={(v) => setDraft((dd) => dd.map((x, j) => (j === i ? v : x)))} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">
            Total:{" "}
            <strong className={cn("font-mono tabular-nums", draftTotal === 0 ? "text-loss" : "text-ink")}>
              {draftTotal} h/semana
            </strong>
          </span>
          <Button onClick={save} disabled={draftTotal === 0}>
            Guardar horario
          </Button>
        </div>
      </Modal>
    </>
  );
}
