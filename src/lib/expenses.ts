/**
 * Monthly fixed expenses. A general (country-agnostic) feature: amounts are
 * personal living costs expressed in the country's LOCAL currency, since the
 * numeric subtractions happen after the engine has already worked in local
 * currency. The country strategy is intentionally NOT involved here.
 *
 * An expense only counts when it has a positive amount. Users start from a few
 * opinionated suggestions and may add their own custom rows.
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
  { id: "health", label: "Seguro de salud" },
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

/**
 * Reconciles a (possibly cached) expense list with the current suggestions.
 * Ensures every suggested category is present — so newly added suggestions show
 * up for users with persisted state — while preserving any amounts they already
 * entered and keeping their custom rows. Suggested rows follow the canonical
 * suggestion order; custom/unknown rows are appended afterwards.
 */
export function reconcileExpenses(expenses: Expense[]): Expense[] {
  const byId = new Map(expenses.map((e) => [e.id, e]));
  const suggested = EXPENSE_SUGGESTIONS.map((s) => byId.get(s.id) ?? { ...s, amount: 0 });
  const suggestedIds = new Set(EXPENSE_SUGGESTIONS.map((s) => s.id));
  const extras = expenses.filter((e) => !suggestedIds.has(e.id));
  return [...suggested, ...extras];
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
 * in place. Expenses reduce the net liquidity, not the total value:
 *   disposable = net − expenses
 * The total value (net + benefits) is left untouched, so the equivalence
 * comparison is unaffected. In the waterfall the expenses are a branch that
 * dips from "Líquido" down to "Disponible" without altering the main flow, so
 * the benefits still build up from the net to the (unchanged) total value.
 */
export function applyExpenses(result: Result, monthlyExpenses: number): Result {
  const expenses = Math.round(monthlyExpenses);
  result.monthlyExpenses = expenses;
  result.disposable = result.net - expenses;

  if (expenses <= 0) return result;

  // The net is the first subtotal ("Líquido"); insert the expenses branch right
  // after it. Branch steps are shown but do not carry into the running total,
  // so the benefit steps that follow still climb from the net.
  const steps = result.breakdown;
  const netIdx = steps.findIndex((s) => s.kind === "subtotal");
  if (netIdx === -1) return result;

  const block: BreakdownStep[] = [
    { label: "Gastos fijos", amount: -expenses, kind: "dec", branch: true },
    { label: "Disponible", amount: steps[netIdx].amount - expenses, kind: "subtotal", branch: true },
  ];
  result.breakdown = [...steps.slice(0, netIdx + 1), ...block, ...steps.slice(netIdx + 1)];

  return result;
}
