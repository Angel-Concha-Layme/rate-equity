/** Peru strategy: assembles modeling, calendar and copy. */
import { makeMoney } from "@/lib/sample";
import type { CountryStrategy, Role } from "../types";
import { holidaysPE } from "./holidays";
import { modelFormal, modelInformal, uitOf } from "./model";
import { COPY_PE, DETAIL_ROWS_PE, MODALITIES_PE } from "./copy";

export const peru: CountryStrategy = {
  meta: { code: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  defaultRole: "formal",
  modalities: MODALITIES_PE,
  holidays: holidaysPE,
  variableIncome: (role: Role) => role === "informal",
  billsGross: (role: Role) => role === "informal",
  model: ({ role, annualIncome, monthlyFraction, time, year }) =>
    role === "formal"
      ? modelFormal(annualIncome, monthlyFraction, time, uitOf(year))
      : modelInformal(annualIncome, monthlyFraction, time, uitOf(year)),
  detailRows: () => DETAIL_ROWS_PE,
  money: makeMoney("PEN", "es-PE"),
  copy: COPY_PE,
};
