/**
 * Per-country strategy registry (Strategy pattern). The core resolves the
 * strategy from `input.country`; adding a new country means creating its folder
 * under `pe/` (model + copy + holidays), registering it here and enabling it in
 * `COUNTRY_OPTIONS`.
 */
import type { CountryStrategy, Country } from "./types";
import { peru } from "./pe";

export type { CountryStrategy, Country, Role, Result, MonthResult } from "./types";

export const STRATEGIES: Partial<Record<Country, CountryStrategy>> = {
  pe: peru,
};

/** Strategy of the country (falling back to Peru if the code is not enabled). */
export function getStrategy(country: string): CountryStrategy {
  return STRATEGIES[country as Country] ?? peru;
}

/**
 * Options for the country selector. Includes future jurisdictions marked as
 * `disabled` until they have a strategy: the UI shows them but does not allow
 * selecting them.
 */
export const COUNTRY_OPTIONS: {
  value: string;
  label: string;
  flag: string;
  currency: string;
  locale: string;
  disabled: boolean;
}[] = [
  { value: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  { value: "mx", label: "México", flag: "🇲🇽", currency: "MXN", locale: "es-MX", disabled: true },
  { value: "co", label: "Colombia", flag: "🇨🇴", currency: "COP", locale: "es-CO", disabled: true },
  { value: "cl", label: "Chile", flag: "🇨🇱", currency: "CLP", locale: "es-CL", disabled: true },
];
