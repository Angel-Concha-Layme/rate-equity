import { workTime } from "./calendar";
import { CURRENCY_OPTIONS, type CurrencyCode } from "./currency";
import { getStrategy, COUNTRY_OPTIONS } from "./countries";
import { applyExpenses, defaultExpenses, totalMonthlyExpenses, type Expense } from "./expenses";
import type { MonthResult, Result, Role } from "./countries/types";

export { CURRENCY_OPTIONS, COUNTRY_OPTIONS, getStrategy };
export type { CurrencyCode, Role, Result, MonthResult, Expense };

/**
 * RateEquity core: country-agnostic orchestrator. It resolves the strategy from
 * `input.country` and delegates all tax modeling to it; only the generic parts
 * live here: calendar, binary search for the equivalence, and radar
 * normalization.
 */

/** Compatibility alias. The category is now a generic role. */
export type Category = Role;

/** Binary search over a monotonically increasing function of annual income. */
function bisect(f: (x: number) => number, target: number): number {
  let lo = 0;
  let hi = 1_000_000_000;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type BillingType = "monthly" | "hourly";

export interface ScenarioInput {
  country: string; // ISO country code (resolves the strategy)
  category: Role; // formal | informal
  amount: number; // monthly, or hourly rate if billingType === "hourly"
  mode: "net" | "gross"; // how to interpret the amount
  billingType: BillingType; // monthly or hourly; applies to both roles
  schedule: number[]; // hours per day [Mon..Sun]
  billingCurrency: CurrencyCode; // currency billed in; converted to the country's local one
  deductHolidays?: boolean; // subtract national holidays from working days
  expenses?: Expense[]; // monthly fixed expenses, in local currency (general feature)
  expensesOn?: boolean; // whether the fixed expenses are applied to the disposable
  // Equivalence basis: "valor" matches total economic value (default); "bruto"
  // matches the planilla's BASE gross against the independiente's total value.
  compareBasis?: "valor" | "bruto";
  wizardDone?: boolean; // already completed the initial wizard
}

export const DEFAULT_SCENARIO: ScenarioInput = {
  country: "pe",
  category: "formal",
  amount: 4500,
  mode: "gross",
  billingType: "monthly",
  schedule: [8, 8, 8, 8, 8, 0, 0],
  billingCurrency: "PEN",
  deductHolidays: false,
  expenses: defaultExpenses(),
  expensesOn: false,
  compareBasis: "valor",
  wizardDone: false,
};

/** Local currency of the country (the currency in which the engine expresses results). */
export const localCurrencyOf = (country: string): CurrencyCode => getStrategy(country).meta.currency;

export interface ScenarioResult {
  yours: Result;
  equivalent: Result;
  year: number;
}

/**
 * Resolves the scenario: computes your situation and the equivalent one in the
 * other role with the SAME total annual economic value. Uses the current year's
 * calendar for working days/hours and delegates modeling to the country strategy.
 */
export function computeScenario(input: ScenarioInput): ScenarioResult {
  const strategy = getStrategy(input.country);
  const year = new Date().getFullYear();
  const usesHourly = input.billingType === "hourly";

  const role = input.category;
  const other: Role = role === "formal" ? "informal" : "formal";

  // Holidays only affect variable-income roles (informal), whose income depends
  // on the days/hours worked. Fixed-income roles (formal) always use the full
  // calendar of the year.
  const restsOnHolidays = (input.deductHolidays ?? false) && strategy.variableIncome(role);
  const holidays = strategy.holidays(year);
  const fixedTime = workTime(year, input.schedule, []);
  const variableTime = workTime(year, input.schedule, restsOnHolidays ? holidays : []);
  const timeOf = (r: Role) => (strategy.variableIncome(r) ? variableTime : fixedTime);

  const yourTime = timeOf(role);

  // fraction of the annual income corresponding to each month (per your role)
  const fractionByHours =
    yourTime.totalHours > 0
      ? yourTime.months.map((m) => m.hours / yourTime.totalHours)
      : Array(12).fill(1 / 12);
  const uniformFraction = Array(12).fill(1 / 12);
  const yourFraction = usesHourly ? fractionByHours : uniformFraction;

  const model = (r: Role, annualIncome: number, fraction: number[]) =>
    strategy.model({ role: r, annualIncome, monthlyFraction: fraction, time: timeOf(r), year });

  // Roles that bill gross are always expressed in gross; net mode only applies
  // to roles with payroll withholding.
  const mode = strategy.billsGross(role) ? "gross" : input.mode;

  // annual income represented by the entered amount (rate×hours or 12×monthly)
  const annualGrossIncome = usesHourly ? input.amount * yourTime.totalHours : 12 * input.amount;
  const monthlyTarget = annualGrossIncome / 12; // gross or net depending on `mode`

  // 1) resolve the annual income of your role (if you entered net, we invert)
  const yourAnnualIncome =
    mode === "gross"
      ? annualGrossIncome
      : bisect((x) => model(role, x, yourFraction).net, monthlyTarget);

  const yours = model(role, yourAnnualIncome, yourFraction);

  // 2) equivalent in the other role. By default both sides match the SAME total
  //    annual economic value. In "bruto" mode the formal (planilla) role enters
  //    the equality through its BASE gross salary instead of its total value,
  //    while the informal (independiente) keeps its total value (which, lacking
  //    benefits, is almost its gross). So the planilla's gross is set equal to
  //    the independiente's total value; the planilla's own total value then
  //    lands well above (the value of its grati / CTS / EsSalud).
  const basis = input.compareBasis ?? "valor";
  const matchValue = (r: Role, m: Result) =>
    basis === "bruto" && r === "formal" ? m.gross * 12 : m.annual.totalValue;
  const equivAnnualIncome = bisect(
    (x) => matchValue(other, model(other, x, uniformFraction)),
    matchValue(role, yours),
  );
  const equivalent = model(other, equivAnnualIncome, uniformFraction);

  // 3) radar normalized between the two. Liquidity uses the typical MONTHLY net
  // (not the annual one): this reflects day-to-day cash, where the informal is
  // ahead, without the formal's bonuses/CTS "evening it out".
  const round = Math.round;
  const pair = [yours, equivalent];
  const maxLiq = Math.max(...pair.map((m) => m.net), 1);
  const maxComp = Math.max(...pair.map((m) => m.annual.totalValue), 1);
  const maxBen = Math.max(...pair.map((m) => m.annual.benefits), 1);
  pair.forEach((m) => {
    m.radar.liquidity = round((m.net / maxLiq) * 100);
    m.radar.totalComp = round((m.annual.totalValue / maxComp) * 100);
    m.radar.benefits = round((m.annual.benefits / maxBen) * 100);
  });

  // Fixed monthly expenses (already in local currency) apply equally to both
  // modalities: they reduce the disposable bottom line without altering the
  // economic-value comparison used for the equivalence.
  const monthlyExpenses = input.expensesOn ? totalMonthlyExpenses(input.expenses ?? []) : 0;
  pair.forEach((m) => applyExpenses(m, monthlyExpenses));

  return { yours, equivalent, year };
}
