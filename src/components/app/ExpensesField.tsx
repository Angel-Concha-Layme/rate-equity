"use client";

import { useState } from "react";
import { Modal, Button, MoneyInput, Input } from "@/components/common";
import { activeExpenses, totalMonthlyExpenses, type Expense } from "@/lib/expenses";
import { cn } from "@/lib/cn";

let customSeq = 0;
const newCustomId = () => `custom-${Date.now()}-${customSeq++}`;

/**
 * Editor for monthly fixed expenses. Mirrors the schedule field: a compact
 * trigger that shows a summary and opens a modal. Suggested categories only
 * count once they have an amount; users may add custom rows too. Amounts are in
 * the local currency, so the symbol is provided by the caller.
 */
export function ExpensesField({
  expenses,
  onChange,
  currencySymbol,
}: {
  expenses: Expense[];
  onChange: (expenses: Expense[]) => void;
  currencySymbol: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Expense[]>(expenses);

  const active = activeExpenses(expenses);
  const total = totalMonthlyExpenses(expenses);

  const openModal = () => {
    setDraft(expenses);
    setOpen(true);
  };
  const save = () => {
    // Keep suggested rows (so they persist as options) and custom rows that
    // were actually filled in; drop empty custom rows.
    const cleaned = draft.filter((e) => !e.custom || e.amount > 0 || e.label.trim());
    onChange(cleaned);
    setOpen(false);
  };

  const setAmount = (id: string, amount: number) =>
    setDraft((d) => d.map((e) => (e.id === id ? { ...e, amount } : e)));
  const setLabel = (id: string, label: string) =>
    setDraft((d) => d.map((e) => (e.id === id ? { ...e, label } : e)));
  const remove = (id: string) => setDraft((d) => d.filter((e) => e.id !== id));
  const addCustom = () =>
    setDraft((d) => [...d, { id: newCustomId(), label: "", amount: 0, custom: true }]);

  const draftTotal = totalMonthlyExpenses(draft);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label="Editar gastos mensuales"
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-left transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
      >
        <span className="truncate text-[0.95rem]">
          {total > 0 ? (
            <>
              <span className="font-mono font-semibold tabular-nums text-ink">
                {currencySymbol} {total.toLocaleString("es-PE")}
              </span>
              <span className="text-muted"> / mes · {active.length} {active.length === 1 ? "gasto" : "gastos"}</span>
            </>
          ) : (
            <span className="text-muted">Sin gastos · añade los tuyos</span>
          )}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Gastos mensuales">
        <p className="mb-4 text-sm text-muted">
          Tus gastos fijos del mes, en moneda local. Solo cuentan los que tengan un monto; déjalos en
          blanco para ignorarlos. Reducen tu liquidez disponible.
        </p>
        <div className="space-y-2">
          {draft.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              {e.custom ? (
                <Input
                  aria-label="Nombre del gasto"
                  placeholder="Nombre del gasto"
                  value={e.label}
                  onChange={(ev) => setLabel(e.id, ev.target.value)}
                  className="min-w-0 flex-1"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{e.label}</span>
              )}
              <div className="relative w-32 shrink-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  {currencySymbol}
                </span>
                <MoneyInput
                  className="pl-9 text-right"
                  aria-label={`Monto de ${e.label || "gasto"}`}
                  value={e.amount}
                  onChange={(amount) => setAmount(e.id, amount)}
                />
              </div>
              {e.custom ? (
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  aria-label={`Quitar ${e.label || "gasto"}`}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-input border border-line-strong text-muted transition hover:border-loss/60 hover:text-loss"
                >
                  <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 10h10" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <span className="size-8 shrink-0" aria-hidden />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCustom}
          className="mt-3 cursor-pointer text-xs font-semibold text-accent underline-offset-4 hover:underline"
        >
          + Agregar gasto
        </button>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">
            Total:{" "}
            <strong className={cn("font-mono tabular-nums", draftTotal === 0 ? "text-muted" : "text-ink")}>
              {currencySymbol} {draftTotal.toLocaleString("es-PE")}/mes
            </strong>
          </span>
          <Button onClick={save}>Guardar gastos</Button>
        </div>
      </Modal>
    </>
  );
}
