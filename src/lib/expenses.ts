/**
 * Monthly fixed expenses. A general (country-agnostic) feature: amounts are
 * personal living costs expressed in the country's LOCAL currency, since the
 * numeric subtractions happen after the engine has already worked in local
 * currency. The country strategy is intentionally NOT involved here.
 *
 * An expense only counts when it has a positive amount ("si no se pone un
 * número, no cuenta"). Users start from a few opinionated suggestions and may
 * add their own custom rows.
 */
import type { BreakdownStep } from "@/lib/sample";
import type { Result } from "@/lib/countries/types";

export interface Expense {
  id: string;
  label: string; // user-facing (kept in Spanish like the rest of the UI)
  amount: number; // monthly, in local currency; 0 means "not set"
  /** Suggested rows are seeded by default; custom rows are user-added. */
  custom?: boolean;
}

/** Opinionated default categories shown in the editor (amount left at 0). */
export const EXPENSE_SUGGESTIONS: { id: string; label: string }[] = [
  { id: "rent", label: "Alquiler" },
  { id: "food", label: "Alimentación" },
  { id: "transport", label: "Transporte" },
  { id: "utilities", label: "Servicios (luz, agua, internet)" },
  { id: "debts", label: "Deudas / préstamos" },
  { id: "education", label: "Educación" },
];

/** Default expense list: the suggestions with no amount set. */
export function defaultExpenses(): Expense[] {
  return EXPENSE_SUGGESTIONS.map((s) => ({ ...s, amount: 0 }));
}

/** Only expenses with a positive amount are counted. */
export function activeExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => e.amount > 0);
}

/** Total monthly fixed expenses (local currency). */
export function totalMonthlyExpenses(expenses: Expense[]): number {
  return activeExpenses(expenses).reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Applies the monthly expenses (already in local currency) to a modeled result,
 * in place. The economic comparison (total value) is unchanged; expenses are a
 * personal cash outflow shown as the final descent of the waterfall toward the
 * disposable figure (`disposable = totalComp - monthlyExpenses`).
 */
export function applyExpenses(result: Result, monthlyExpenses: number): Result {
  result.monthlyExpenses = Math.round(monthlyExpenses);
  result.disposable = Math.round(result.totalComp - monthlyExpenses);

  if (monthlyExpenses <= 0) return result;

  // Demote the existing closing "total" step to a subtotal, then append the
  // expenses block and the new "Disponible" total so the running sum stays
  // consistent (total value − expenses).
  const steps: BreakdownStep[] = result.breakdown.map((s) =>
    s.kind === "total" ? { ...s, kind: "subtotal" } : s,
  );
  steps.push({ label: "Gastos fijos", amount: -result.monthlyExpenses, kind: "dec" });
  steps.push({ label: "Disponible", amount: result.disposable, kind: "total" });
  result.breakdown = steps;

  return result;
}
