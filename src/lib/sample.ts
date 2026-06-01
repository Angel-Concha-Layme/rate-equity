/**
 * Sample data for the Styles Lab.
 * This is NOT the real calculation engine (that comes later); these are
 * illustrative, coherent figures that tell RateEquity's central story:
 * two offers with similar gross pay can represent very different realities.
 *
 * Scenario: one person evaluating 3 modalities. Currency: USD/month.
 */

export type ModalityKey = "planilla" | "contractor" | "freelance" | "independiente";

export interface BreakdownStep {
  label: string;
  /** Absolute amount for start/subtotal/total; signed delta for inc/dec. */
  amount: number;
  kind: "start" | "inc" | "dec" | "subtotal" | "total";
  /**
   * A branch step is drawn as an aside that hangs from the current running
   * total but does NOT carry into it, so the main flow continues unaffected
   * (e.g. expenses dipping from "Líquido" to "Disponible" while benefits still
   * build up to the total value).
   */
  branch?: boolean;
}

export interface Modality {
  key: ModalityKey;
  name: string;
  tagline: string;
  /** Headline gross pay offered by each modality. */
  gross: number;
  /** Cash that reaches the pocket (take-home). */
  net: number;
  /** Total compensation including valued benefits. */
  totalComp: number;
  /** What it costs the employer. */
  employerCost: number;
  /** Value of labor benefits (bonus, vacations, CTS, insurance...). */
  benefits: number;
  /** Tax burden + contributions as % of gross. */
  loadPct: number;
  /** Effective hours per week (typical). */
  hoursPerWeek: number;
  /** Highlighted label. */
  badge: string;
  /** Breakdown for the waterfall. */
  breakdown: BreakdownStep[];
  /** Mini series for the sparkline (month-to-month income stability). */
  spark: number[];
  /** Radar axes (0-100). */
  radar: { liquidity: number; totalComp: number; benefits: number; stability: number; flexibility: number };
}

export const MODALITIES: Modality[] = [
  {
    key: "planilla",
    name: "Planilla",
    tagline: "Relación de dependencia",
    gross: 3000,
    net: 2340,
    totalComp: 2860,
    employerCost: 3900,
    benefits: 520,
    loadPct: 22,
    hoursPerWeek: 40,
    badge: "Más estable",
    breakdown: [
      { label: "Bruto", amount: 3000, kind: "start" },
      { label: "Imp. a la renta", amount: -180, kind: "dec" },
      { label: "Aporte pensión", amount: -330, kind: "dec" },
      { label: "Aporte salud", amount: -150, kind: "dec" },
      { label: "Líquido", amount: 2340, kind: "subtotal" },
      { label: "Aguinaldo / CTS", amount: 390, kind: "inc" },
      { label: "Vacaciones", amount: 130, kind: "inc" },
      { label: "Comp. total", amount: 2860, kind: "total" },
    ],
    spark: [2860, 2860, 2860, 2860, 2860, 2860],
    radar: { liquidity: 62, totalComp: 70, benefits: 95, stability: 92, flexibility: 28 },
  },
  {
    key: "contractor",
    name: "Contractor",
    tagline: "Servicios recurrentes",
    gross: 3600,
    net: 3060,
    totalComp: 3060,
    employerCost: 3600,
    benefits: 0,
    loadPct: 15,
    hoursPerWeek: 40,
    badge: "Mayor liquidez",
    breakdown: [
      { label: "Bruto", amount: 3600, kind: "start" },
      { label: "Imp. a la renta", amount: -432, kind: "dec" },
      { label: "Seguro propio", amount: -108, kind: "dec" },
      { label: "Líquido", amount: 3060, kind: "subtotal" },
      { label: "Beneficios", amount: 0, kind: "inc" },
      { label: "Comp. total", amount: 3060, kind: "total" },
    ],
    spark: [3060, 3060, 2980, 3060, 3060, 3120],
    radar: { liquidity: 90, totalComp: 82, benefits: 12, stability: 56, flexibility: 74 },
  },
  {
    key: "freelance",
    name: "Freelance",
    tagline: "Por proyecto",
    gross: 3200,
    net: 2624,
    totalComp: 2624,
    employerCost: 3200,
    benefits: 0,
    loadPct: 18,
    hoursPerWeek: 35,
    badge: "Más flexible",
    breakdown: [
      { label: "Bruto", amount: 3200, kind: "start" },
      { label: "Imp. a la renta", amount: -480, kind: "dec" },
      { label: "Comisiones / admin", amount: -96, kind: "dec" },
      { label: "Líquido", amount: 2624, kind: "subtotal" },
      { label: "Comp. total", amount: 2624, kind: "total" },
    ],
    spark: [2900, 2400, 3100, 2200, 2900, 2624],
    radar: { liquidity: 78, totalComp: 72, benefits: 8, stability: 30, flexibility: 95 },
  },
];

export const RADAR_AXES: { key: keyof Modality["radar"]; label: string }[] = [
  { key: "liquidity", label: "Liquidez" },
  { key: "totalComp", label: "Comp. total" },
  { key: "benefits", label: "Beneficios" },
  { key: "stability", label: "Estabilidad" },
  { key: "flexibility", label: "Flexibilidad" },
];

export const WEEKS_PER_MONTH = 4.33;

/* --------------------------- formatting helpers --------------------------- */

// From this amount on, compact notation is used (e.g. "S/ 16.2 M") to avoid
// overflow/overlap with currencies that have many digits.
const MONEY_COMPACT_FROM = 1_000_000;

export type MoneyFn = (n: number, opts?: { decimals?: number; sign?: boolean }) => string;

/**
 * Creates a currency formatter bound to a specific currency and locale. Each
 * country (strategy) exposes its own, so figures are shown in the matching
 * local currency without coupling formatting to Peru.
 */
export function makeMoney(currency: string, locale: string): MoneyFn {
  return function money(n: number, opts: { decimals?: number; sign?: boolean } = {}): string {
    const { decimals = 0, sign = false } = opts;
    const abs = Math.abs(n);
    const compact = abs >= MONEY_COMPACT_FROM;
    const s = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...(compact
        ? { notation: "compact", maximumFractionDigits: 1 }
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    }).format(abs);
    if (sign) return `${n < 0 ? "−" : "+"}${s}`;
    return `${n < 0 ? "−" : ""}${s}`;
  };
}

/** Default formatter (Soles), used by the lab and as a fallback. */
export const money: MoneyFn = makeMoney("PEN", "es-PE");

export function pct(n: number, decimals = 0): string {
  return `${n.toFixed(decimals)}%`;
}

/** Effective hourly value from a monthly net amount and hours/week. */
export function hourlyValue(monthlyNet: number, hoursPerWeek: number): number {
  const monthlyHours = hoursPerWeek * WEEKS_PER_MONTH;
  return monthlyHours > 0 ? monthlyNet / monthlyHours : 0;
}
