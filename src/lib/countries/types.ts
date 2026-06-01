/**
 * Multi-country Strategy contract. The core (`computeScenario`) delegates
 * everything country-specific (tax modeling, calendar/holidays, labels and
 * copy) to a `CountryStrategy` resolved from the registry by ISO code.
 *
 * Modalities are modeled with generic roles: `formal` (dependent employment,
 * with benefits) and `informal` (self-employed, more take-home cash). Each
 * country provides the labels and prose used to present those roles.
 */
import type { Modality, ModalityKey, MoneyFn } from "@/lib/sample";
import type { CurrencyCode } from "@/lib/currency";
import type { WorkTime } from "@/lib/calendar";

/** Canonical comparable roles (country-independent). */
export type Role = "formal" | "informal";

/** Countries with an available strategy. Extended as jurisdictions are added. */
export type Country = "pe";

/** Detail of a month (for the month-by-month table). */
export interface MonthResult {
  month: number; // 1-12
  days: number; // working days of the month
  hours: number; // working hours of the month
  gross: number; // gross income of the month
  deduction: number; // withholding/contributions of the month by role
  net: number; // cash received in the month
}

/** Full result of modeling a modality for a given annual income. */
export interface Result extends Modality {
  role: Role;
  monthlyAverage: number; // total value / 12
  hourlyValue: number;
  refund: number; // annual tax refund (0 if not applicable)
  months: MonthResult[];
  annual: {
    totalIncome: number;
    tax: number;
    pension: number;
    health: number;
    benefits: number;
    liquidity: number;
    totalValue: number;
    employerCost: number;
  };
}

/** Metadata and copy of a modality within a country. */
export interface ModalityMeta {
  role: Role;
  key: ModalityKey; // stable identity (React keys / compatibility)
  name: string; // "Planilla"
  tagline: string; // "5ta categoría · dependiente"
  badge: string; // "Beneficios + estabilidad"
  selectorLabel: string; // "Planilla (5ta)"
  // prose fragments for the equivalence banner
  asPhrase: string; // sentence opener: "En planilla"
  subjectPhrase: string; // subject: "alguien en planilla"
  averageReason: string; // why the average beats the typical month
  deferredValue: string; // where the value not seen as cash comes from
  // wizard copy
  wizard: { sub: string; desc: string; info: string };
}

/** Formatters injected into the detail rows. */
export interface Formats {
  money: MoneyFn;
  pct: (n: number, decimals?: number) => string;
}

/** Row of the annual detail table (labels and per-country data access). */
export interface DetailRow {
  label: string;
  get: (x: Result, fmt: Formats) => string;
  emphasis?: boolean;
  tone?: "loss" | "profit";
  sub?: boolean;
}

/** Country identity and formatting. */
export interface CountryMeta {
  code: Country;
  label: string;
  flag: string;
  currency: CurrencyCode;
  locale: string;
  disabled?: boolean;
}

/** Country-specific texts shared by the UI. */
export interface CountryCopy {
  situationInfo: string; // help for the situation selector (sidebar)
  holidaysInfo: string; // help for the holidays toggle
  insuranceInfo: string; // help for the private insurance toggle
  landingTagline: string; // landing subtitle
  wizardCountryNote: string; // note for the country step in the wizard
}

/** Arguments to model a modality. */
export interface ModelArgs {
  role: Role;
  annualIncome: number;
  monthlyFraction: number[];
  time: WorkTime;
  year: number;
  annualInsurance?: number;
}

/** A country's strategy: models the calculation and provides labels/copy/holidays. */
export interface CountryStrategy {
  meta: CountryMeta;
  defaultRole: Role;
  modalities: Record<Role, ModalityMeta>;
  /** National holidays of the year: [month (1-12), day]. */
  holidays(year: number): [number, number][];
  /** Does the role's income depend on days/hours worked? (holidays affect it). */
  variableIncome(role: Role): boolean;
  /** Does the role always bill gross? (tax is settled later). */
  billsGross(role: Role): boolean;
  model(a: ModelArgs): Result;
  /** Rows of the annual detail table (country-specific labels). */
  detailRows(): DetailRow[];
  /** Monthly price tiers of private health insurance (local currency). */
  insuranceTiers(): number[];
  /** Suggested insurance tier based on monthly liquidity. */
  suggestedInsurance(monthlyLiquidity: number): number;
  /** Local currency formatter. */
  money: MoneyFn;
  copy: CountryCopy;
}
