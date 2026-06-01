/**
 * Fuente única de las monedas soportadas. De aquí se derivan el selector de la
 * UI (`MONEDA_OPTIONS`) y las tasas de respaldo offline (`FX_FALLBACK`), así que
 * agregar una moneda es añadir una sola entrada a `CURRENCIES`.
 *
 * `fallbackPEN` (soles por 1 unidad) es aproximado y SOLO se usa como último
 * recurso si fallan todas las fuentes de tipo de cambio en vivo; en operación
 * normal el valor proviene de la API.
 */
export interface Currency {
  code: string; // ISO 4217
  label: string; // nombre legible
  symbol: string; // símbolo para inputs
  flag: string; // bandera (emoji)
  fallbackPEN: number; // soles por 1 unidad (respaldo offline)
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

export type Moneda = (typeof CURRENCIES)[number]["code"];

/** Opciones para los selectores de moneda (derivadas del registro). */
export const MONEDA_OPTIONS: { value: Moneda; label: string; symbol: string; flag: string }[] =
  CURRENCIES.map((c) => ({ value: c.code, label: c.label, symbol: c.symbol, flag: c.flag }));

/** Tasas de respaldo offline (soles por 1 unidad), derivadas del registro. */
export const FX_FALLBACK: Record<string, number> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.fallbackPEN]),
);
