/** Peru strategy: assembles modeling, calendar and copy. */
import { makeMoney } from "@/lib/sample";
import type { CountryStrategy, Role } from "../types";
import { holidaysPE } from "./holidays";
import { modelFormal, modelInformal, uitOf } from "./model";
import { COPY_PE, DETAIL_ROWS_PE, MODALITIES_PE } from "./copy";

// Monthly price tiers of private health insurance (in soles).
const INSURANCE_TIERS_PE = [100, 190, 280, 300];
// The suggested insurance must not exceed this percentage of monthly liquidity.
const INSURANCE_LIQUIDITY_CAP = 0.05;

function suggestedInsurancePE(monthlyLiquidity: number): number {
  if (!INSURANCE_TIERS_PE.length) return 0;
  const cap = INSURANCE_LIQUIDITY_CAP * Math.max(0, monthlyLiquidity);
  const eligible = INSURANCE_TIERS_PE.filter((t) => t <= cap);
  return eligible.length ? Math.max(...eligible) : Math.min(...INSURANCE_TIERS_PE);
}

export const peru: CountryStrategy = {
  meta: { code: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  defaultRole: "formal",
  modalities: MODALITIES_PE,
  holidays: holidaysPE,
  variableIncome: (role: Role) => role === "informal",
  billsGross: (role: Role) => role === "informal",
  model: ({ role, annualIncome, monthlyFraction, time, year, annualInsurance = 0 }) =>
    role === "formal"
      ? modelFormal(annualIncome, monthlyFraction, time, uitOf(year))
      : modelInformal(annualIncome, monthlyFraction, time, uitOf(year), annualInsurance),
  detailRows: () => DETAIL_ROWS_PE,
  insuranceTiers: () => INSURANCE_TIERS_PE,
  suggestedInsurance: suggestedInsurancePE,
  money: makeMoney("PEN", "es-PE"),
  copy: COPY_PE,
};
