/**
 * Single source of supported currencies. The UI selector (`CURRENCY_OPTIONS`)
 * and the offline fallback rates (`FX_FALLBACK`) are derived from here, so
 * adding a currency means adding a single entry to `CURRENCIES`.
 *
 * `fallbackPEN` (soles per 1 unit) is approximate and is used ONLY as a last
 * resort if every live exchange-rate source fails; under normal operation the
 * value comes from the API.
 */
export interface Currency {
  code: string; // ISO 4217
  label: string; // human-readable name
  symbol: string; // symbol for inputs
  flag: string; // flag (emoji)
  fallbackPEN: number; // soles per 1 unit (offline fallback)
}

export const CURRENCIES = [
  { code: "PEN", label: "Sol", symbol: "S/", flag: "🇵🇪", fallbackPEN: 1 },
  { code: "USD", label: "Dólar", symbol: "$", flag: "🇺🇸", fallbackPEN: 3.75 },
  { code: "EUR", label: "Euro", symbol: "€", flag: "🇪🇺", fallbackPEN: 4.05 },
  { code: "MXN", label: "Peso mexicano", symbol: "$", flag: "🇲🇽", fallbackPEN: 0.21 },
  { code: "COP", label: "Peso colombiano", symbol: "$", flag: "🇨🇴", fallbackPEN: 0.00094 },
  { code: "CLP", label: "Peso chileno", symbol: "$", flag: "🇨🇱", fallbackPEN: 0.00395 },
  { code: "ARS", label: "Peso argentino", symbol: "$", flag: "🇦🇷", fallbackPEN: 0.0031 },
  { code: "BRL", label: "Real", symbol: "R$", flag: "🇧🇷", fallbackPEN: 0.68 },
  { code: "UYU", label: "Peso uruguayo", symbol: "$U", flag: "🇺🇾", fallbackPEN: 0.094 },
  { code: "BOB", label: "Boliviano", symbol: "Bs", flag: "🇧🇴", fallbackPEN: 0.54 },
  { code: "PYG", label: "Guaraní", symbol: "₲", flag: "🇵🇾", fallbackPEN: 0.00051 },
] as const satisfies readonly Currency[];

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** Options for the currency selectors (derived from the registry). */
export const CURRENCY_OPTIONS: { value: CurrencyCode; label: string; symbol: string; flag: string }[] =
  CURRENCIES.map((c) => ({ value: c.code, label: c.label, symbol: c.symbol, flag: c.flag }));

/** Offline fallback rates (soles per 1 unit), derived from the registry. */
export const FX_FALLBACK: Record<string, number> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.fallbackPEN]),
);
