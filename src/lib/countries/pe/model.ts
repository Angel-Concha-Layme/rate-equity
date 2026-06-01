/**
 * Peru tax modeling (transparent and verifiable).
 *
 * Compares the two labor-income categories:
 *  - formal   → planilla, 5th-category income (dependent)
 *  - informal → independiente, 4th-category income (professional fee receipts)
 *
 * Working hours/days are computed over the real calendar of the year (respects
 * leap years and the weekday distribution). The 4th category models the 8%
 * monthly withholding (advance payment) and the year-end refund, which is
 * valued as a benefit.
 */
import type { BreakdownStep } from "@/lib/sample";
import type { WorkTime } from "@/lib/calendar";
import type { MonthResult, Result } from "../types";
import { MODALITIES_PE } from "./copy";

// ----------------------------- UIT per year -------------------------------
// There is no public UIT API; the table is maintained manually (source: SUNAT
// / MEF supreme decrees). Update when each year is published.
const UIT_BY_YEAR: Record<number, number> = { 2024: 5150, 2025: 5350, 2026: 5500 };
const UIT_DEFAULT = 5500;
export function uitOf(year: number): number {
  return UIT_BY_YEAR[year] ?? UIT_DEFAULT;
}

// AFP/ONP, EsSalud and benefits (fractions)
const AFP = 0.13;
const ESSALUD = 0.09;
const BONUS_SALARIES = 2; // jul + dec
const EXTRA_BONUS = 0.09; // extraordinary bonus over the gratification
const CTS_ANNUAL = 7 / 6; // ≈ 1.1667 salaries/year
const DEDUCTION_4TH = 0.2; // 20% deduction
const WITHHOLDING_4TH = 0.08; // monthly 4th-category withholding (advance payment)
const WITHHOLDING_4TH_THRESHOLD = 1500; // soles: withheld only if the receipt exceeds this
const BONUS_MONTHS = [7, 12]; // July and December

// progressive scale over net labor income (after 7 UIT), in multiples of UIT
const BRACKETS: [number, number][] = [
  [5, 0.08],
  [20, 0.14],
  [35, 0.17],
  [45, 0.2],
  [Infinity, 0.3],
];

/** Annual labor income tax from the taxable base (before 7 UIT). */
export function laborIncomeTax(baseBefore7UIT: number, uit: number): number {
  const base = Math.max(0, baseBefore7UIT - 7 * uit);
  let tax = 0;
  let prev = 0;
  for (const [limitUIT, rate] of BRACKETS) {
    const limit = limitUIT === Infinity ? Infinity : limitUIT * uit;
    const inBracket = Math.min(Math.max(base - prev, 0), limit - prev);
    if (inBracket > 0) tax += inBracket * rate;
    prev = limit;
    if (base <= limit) break;
  }
  return tax;
}

const round = Math.round;

/** Formal/payroll (5th) from the base annual income (12 salaries) and the monthly fraction. */
export function modelFormal(
  annualIncome: number,
  monthlyFraction: number[],
  time: WorkTime,
  uit: number,
): Result {
  const meta = MODALITIES_PE.formal;
  const baseAnnual = annualIncome;
  const S = annualIncome / 12; // average monthly salary
  const bonusTotal = BONUS_SALARIES * S * (1 + EXTRA_BONUS);
  const cts = CTS_ANNUAL * S;
  const receivedIncome = baseAnnual + bonusTotal + cts; // everything received (pre-tax)

  const taxableBase = baseAnnual + bonusTotal; // CTS not subject to income tax
  const tax = laborIncomeTax(taxableBase, uit);
  const pension = AFP * baseAnnual; // bonuses exempt from contributions
  const health = ESSALUD * baseAnnual; // EsSalud (employer)

  const liquidity = receivedIncome - tax - pension; // cash in hand (AFP goes to the fund)
  const totalValue = liquidity + pension + health; // pension and health are worker value
  const employerCost = baseAnnual + bonusTotal + cts + health;
  const benefits = bonusTotal + cts; // extra cash vs base salary

  const hourlyValue = time.totalHours > 0 ? totalValue / time.totalHours : 0;

  // monthly detail: month salary (by fraction) − AFP − income tax; bonus in jul/dec
  const months: MonthResult[] = time.months.map((m, i) => {
    const monthSalary = baseAnnual * monthlyFraction[i];
    const bonus = BONUS_MONTHS.includes(m.month) ? bonusTotal / 2 : 0;
    const afpMonth = AFP * monthSalary;
    const taxMonth = tax / 12;
    const deduction = afpMonth + taxMonth;
    const gross = monthSalary + bonus;
    const net = monthSalary - afpMonth - taxMonth + bonus;
    return { month: m.month, days: m.days, hours: m.hours, gross: round(gross), deduction: round(deduction), net: round(net) };
  });

  const typicalMonthlyNet = S - AFP * S - tax / 12;

  const breakdown: BreakdownStep[] = [
    { label: "Bruto", amount: round(S), kind: "start" },
    { label: "Imp. renta (5ta)", amount: -round(tax / 12), kind: "dec" },
    { label: "AFP / pensión", amount: -round(AFP * S), kind: "dec" },
    { label: "Líquido", amount: round(typicalMonthlyNet), kind: "subtotal" },
    { label: "Gratificación", amount: round(bonusTotal / 12), kind: "inc" },
    { label: "CTS", amount: round(cts / 12), kind: "inc" },
    { label: "EsSalud", amount: round(health / 12), kind: "inc" },
    { label: "Valor total", amount: round(totalValue / 12), kind: "total" },
  ];

  return {
    key: meta.key,
    role: meta.role,
    name: meta.name,
    tagline: meta.tagline,
    gross: round(S),
    net: round(typicalMonthlyNet),
    totalComp: round(totalValue / 12),
    employerCost: round(employerCost / 12),
    benefits: round(benefits / 12),
    loadPct: round(((tax + pension) / receivedIncome) * 100),
    hoursPerWeek: time.months.length ? round(time.totalHours / 52) : 0,
    badge: meta.badge,
    breakdown,
    spark: [1, 1, 1, 1, 1, 1].map((f) => round((totalValue / 12) * f)),
    radar: { liquidity: 0, totalComp: 0, benefits: 0, stability: 92, flexibility: 28 },
    monthlyAverage: round(totalValue / 12),
    hourlyValue,
    refund: 0,
    months,
    annual: {
      totalIncome: round(receivedIncome),
      tax: round(tax),
      pension: round(pension),
      health: round(health),
      benefits: round(benefits),
      liquidity: round(liquidity),
      totalValue: round(totalValue),
      employerCost: round(employerCost),
    },
  };
}

/**
 * Informal/independiente (4th) from the annual income and the monthly fraction.
 * Health is not modeled here: unlike payroll (EsSalud), the independent worker
 * pays for it out of pocket, which is treated as a regular monthly expense via
 * the general expenses feature, not as part of the labor-income model. The only
 * benefit here is the year-end income-tax refund, when it applies.
 */
export function modelInformal(
  annualIncome: number,
  monthlyFraction: number[],
  time: WorkTime,
  uit: number,
): Result {
  const meta = MODALITIES_PE.informal;
  const totalIncome = annualIncome;
  const deduction = Math.min(DEDUCTION_4TH * totalIncome, 24 * uit);
  const taxableBase = totalIncome - deduction;
  const tax = laborIncomeTax(taxableBase, uit); // FINAL tax (annual)

  // monthly detail: gross and the 8% withholding (if above threshold)
  let annualWithholding = 0;
  const months: MonthResult[] = time.months.map((m, i) => {
    const gross = totalIncome * monthlyFraction[i];
    const withholding = gross > WITHHOLDING_4TH_THRESHOLD ? WITHHOLDING_4TH * gross : 0;
    annualWithholding += withholding;
    return { month: m.month, days: m.days, hours: m.hours, gross: round(gross), deduction: round(withholding), net: round(gross - withholding) };
  });

  const refund = Math.max(0, annualWithholding - tax); // settled in the annual return
  const health = 0; // health is self-funded and tracked as a regular expense
  const annualLiquidity = totalIncome - annualWithholding; // cash after withholding
  const totalValue = annualLiquidity + refund; // net liquidity + the only benefit (refund)
  const employerCost = totalIncome; // the company only pays the fee

  const hourlyValue = time.totalHours > 0 ? totalValue / time.totalHours : 0;
  const monthlyGross = totalIncome / 12;
  const monthlyWithholding = annualWithholding / 12;
  const monthlyNet = annualLiquidity / 12;

  const breakdown: BreakdownStep[] = [
    { label: "Bruto", amount: round(monthlyGross), kind: "start" },
    { label: "Retención 8%", amount: -round(monthlyWithholding), kind: "dec" },
    { label: "Líquido", amount: round(monthlyNet), kind: "subtotal" },
    ...(refund > 0
      ? [{ label: "Devolución IR", amount: round(refund / 12), kind: "inc" as const }]
      : []),
    { label: "Valor total", amount: round(totalValue / 12), kind: "total" },
  ];

  return {
    key: meta.key,
    role: meta.role,
    name: meta.name,
    tagline: meta.tagline,
    gross: round(monthlyGross),
    net: round(monthlyNet),
    totalComp: round(totalValue / 12),
    employerCost: round(employerCost / 12),
    benefits: round(refund / 12),
    loadPct: round((tax / totalIncome) * 100),
    hoursPerWeek: time.months.length ? round(time.totalHours / 52) : 0,
    badge: meta.badge,
    breakdown,
    spark: [1.16, 0.7, 1.2, 0.62, 1.1, 0.82].map((f) => round((totalValue / 12) * f)),
    radar: { liquidity: 0, totalComp: 0, benefits: 0, stability: 34, flexibility: 92 },
    monthlyAverage: round(totalValue / 12),
    hourlyValue,
    refund: round(refund),
    months,
    annual: {
      totalIncome: round(totalIncome),
      tax: round(tax),
      pension: 0,
      health: round(health),
      benefits: round(refund),
      liquidity: round(annualLiquidity),
      totalValue: round(totalValue),
      employerCost: round(totalIncome),
    },
  };
}
