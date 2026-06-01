/**
 * Datos de ejemplo para el Laboratorio de Estilos.
 * NO es el motor de cálculo real (eso vendrá luego); son cifras ilustrativas
 * y coherentes que cuentan la historia central de RateEquity:
 * dos ofertas con bruto parecido pueden representar realidades muy distintas.
 *
 * Escenario: una misma persona evaluando 3 modalidades. Moneda: USD/mes.
 */

export type ModalidadKey = "planilla" | "contractor" | "freelance" | "independiente";

export interface BreakdownStep {
  label: string;
  /** monto absoluto para start/subtotal/total; delta con signo para inc/dec */
  amount: number;
  kind: "start" | "inc" | "dec" | "subtotal" | "total";
}

export interface Modalidad {
  key: ModalidadKey;
  nombre: string;
  tagline: string;
  /** bruto "de portada" que ofrece cada modalidad */
  bruto: number;
  /** efectivo que llega al bolsillo (líquido) */
  liquido: number;
  /** compensación total incluyendo beneficios valorizados */
  compTotal: number;
  /** lo que le cuesta a la empresa */
  costoEmpresa: number;
  /** valor de beneficios laborales (aguinaldo, vacaciones, CTS, seguro...) */
  beneficios: number;
  /** carga tributaria + aportes como % del bruto */
  cargaPct: number;
  /** horas efectivas por semana (típicas) */
  horasSemana: number;
  /** etiqueta destacada */
  badge: string;
  /** desglose para el waterfall */
  breakdown: BreakdownStep[];
  /** mini serie para sparkline (estabilidad del ingreso mes a mes) */
  spark: number[];
  /** ejes del radar (0-100) */
  radar: { liquidez: number; compTotal: number; beneficios: number; estabilidad: number; flexibilidad: number };
}

export const MODALIDADES: Modalidad[] = [
  {
    key: "planilla",
    nombre: "Planilla",
    tagline: "Relación de dependencia",
    bruto: 3000,
    liquido: 2340,
    compTotal: 2860,
    costoEmpresa: 3900,
    beneficios: 520,
    cargaPct: 22,
    horasSemana: 40,
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
    radar: { liquidez: 62, compTotal: 70, beneficios: 95, estabilidad: 92, flexibilidad: 28 },
  },
  {
    key: "contractor",
    nombre: "Contractor",
    tagline: "Servicios recurrentes",
    bruto: 3600,
    liquido: 3060,
    compTotal: 3060,
    costoEmpresa: 3600,
    beneficios: 0,
    cargaPct: 15,
    horasSemana: 40,
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
    radar: { liquidez: 90, compTotal: 82, beneficios: 12, estabilidad: 56, flexibilidad: 74 },
  },
  {
    key: "freelance",
    nombre: "Freelance",
    tagline: "Por proyecto",
    bruto: 3200,
    liquido: 2624,
    compTotal: 2624,
    costoEmpresa: 3200,
    beneficios: 0,
    cargaPct: 18,
    horasSemana: 35,
    badge: "Más flexible",
    breakdown: [
      { label: "Bruto", amount: 3200, kind: "start" },
      { label: "Imp. a la renta", amount: -480, kind: "dec" },
      { label: "Comisiones / admin", amount: -96, kind: "dec" },
      { label: "Líquido", amount: 2624, kind: "subtotal" },
      { label: "Comp. total", amount: 2624, kind: "total" },
    ],
    spark: [2900, 2400, 3100, 2200, 2900, 2624],
    radar: { liquidez: 78, compTotal: 72, beneficios: 8, estabilidad: 30, flexibilidad: 95 },
  },
];

export const RADAR_AXES: { key: keyof Modalidad["radar"]; label: string }[] = [
  { key: "liquidez", label: "Liquidez" },
  { key: "compTotal", label: "Comp. total" },
  { key: "beneficios", label: "Beneficios" },
  { key: "estabilidad", label: "Estabilidad" },
  { key: "flexibilidad", label: "Flexibilidad" },
];

export const SEMANAS_MES = 4.33;

/* --------------------------- helpers de formato --------------------------- */

// A partir de este monto se usa notación compacta (p. ej. "S/ 16,2 M") para
// evitar desbordes/solapamientos con monedas de muchos dígitos.
const MONEY_COMPACT_DESDE = 1_000_000;

export function money(n: number, opts: { decimals?: number; sign?: boolean } = {}): string {
  const { decimals = 0, sign = false } = opts;
  const abs = Math.abs(n);
  const compacto = abs >= MONEY_COMPACT_DESDE;
  const s = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    ...(compacto
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
  }).format(abs);
  if (sign) return `${n < 0 ? "−" : "+"}${s}`;
  return `${n < 0 ? "−" : ""}${s}`;
}

export function pct(n: number, decimals = 0): string {
  return `${n.toFixed(decimals)}%`;
}

/** valor por hora efectiva a partir de un líquido mensual y horas/semana */
export function valorHora(liquidoMensual: number, horasSemana: number): number {
  const horasMes = horasSemana * SEMANAS_MES;
  return horasMes > 0 ? liquidoMensual / horasMes : 0;
}
