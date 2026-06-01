import { type Modalidad, type BreakdownStep } from "./sample";
import { tiempoTrabajo, type TiempoTrabajo } from "./calendar";
import { MONEDA_OPTIONS, type Moneda } from "./currency";

export { MONEDA_OPTIONS };
export type { Moneda };

/**
 * Motor de cálculo de RateEquity para Perú (transparente y verificable).
 *
 * Compara las dos categorías tributarias de renta de trabajo:
 *  - Planilla     → rentas de 5ta categoría (dependiente)
 *  - Independiente → rentas de 4ta categoría (recibos por honorarios)
 *
 * Las horas/días laborables se calculan sobre el calendario real del año
 * (respeta bisiestos y la distribución de días de semana). La 4ta categoría
 * modela la retención mensual de 8% (pago a cuenta) y la devolución al cierre
 * del ejercicio, que se valoriza como beneficio.
 */

// ----------------------------- UIT por año -------------------------------
// No existe API pública de la UIT; se mantiene la tabla manualmente (fuente:
// SUNAT / decretos supremos del MEF). Actualizar al publicarse cada año.
const UIT_POR_AÑO: Record<number, number> = { 2024: 5150, 2025: 5350, 2026: 5500 };
const UIT_DEFECTO = 5500;
export function uitDe(year: number): number {
  return UIT_POR_AÑO[year] ?? UIT_DEFECTO;
}

// AFP/ONP, EsSalud y beneficios (fracciones)
const AFP = 0.13;
const ESSALUD = 0.09;
const SUELDOS_GRATI = 2; // jul + dic
const BONIF_EXTRA = 0.09; // bonificación extraordinaria sobre gratificación
const CTS_ANUAL = 7 / 6; // ≈ 1.1667 sueldos/año
const DEDUCC_4TA = 0.2; // deducción 20%
const RET_4TA = 0.08; // retención mensual 4ta (pago a cuenta)
const UMBRAL_RET_4TA = 1500; // soles: solo se retiene si el recibo supera este monto
const MESES_GRATI = [7, 12]; // julio y diciembre

// escala progresiva sobre la renta neta de trabajo (tras 7 UIT), en múltiplos de UIT
const TRAMOS: [number, number][] = [
  [5, 0.08],
  [20, 0.14],
  [35, 0.17],
  [45, 0.2],
  [Infinity, 0.3],
];

/** Impuesto a la renta de trabajo anual a partir de la base imponible (antes de 7 UIT). */
export function impuestoRentaTrabajo(baseAntes7UIT: number, uit: number): number {
  const base = Math.max(0, baseAntes7UIT - 7 * uit);
  let tax = 0;
  let prev = 0;
  for (const [limUIT, tasa] of TRAMOS) {
    const lim = limUIT === Infinity ? Infinity : limUIT * uit;
    const enTramo = Math.min(Math.max(base - prev, 0), lim - prev);
    if (enTramo > 0) tax += enTramo * tasa;
    prev = lim;
    if (base <= lim) break;
  }
  return tax;
}

export type Categoria = "planilla" | "independiente";

/** Detalle de un mes (para la tabla mes a mes). */
export interface MesResultado {
  mes: number; // 1-12
  dias: number; // días laborables del mes
  horas: number; // horas laborables del mes
  bruto: number; // ingreso bruto del mes
  descuento: number; // 4ta: retención 8% · 5ta: AFP + IR retenido
  liquido: number; // efectivo recibido en el mes
}

export interface Resultado extends Modalidad {
  // (hereda los campos mensuales de Modalidad)
  promedioMensual: number; // valor total / 12
  valorHora: number;
  devolucion: number; // 4ta: devolución anual de IR (0 en planilla)
  meses: MesResultado[];
  anual: {
    ingresoTotal: number;
    impuesto: number;
    pension: number;
    salud: number;
    beneficios: number;
    liquidez: number;
    valorTotal: number;
    costoEmpresa: number;
  };
}

const round = Math.round;

/** Planilla (5ta) a partir del ingreso anual base (12 sueldos) y la fracción mensual. */
function planilla(
  ingresoAnual: number,
  fraccionMensual: number[],
  tiempo: TiempoTrabajo,
  uit: number,
): Resultado {
  const baseAnual = ingresoAnual;
  const S = ingresoAnual / 12; // sueldo mensual promedio
  const gratiTotal = SUELDOS_GRATI * S * (1 + BONIF_EXTRA);
  const cts = CTS_ANUAL * S;
  const ingresoPercibido = baseAnual + gratiTotal + cts; // todo lo percibido (pre-impuesto)

  const baseImponible = baseAnual + gratiTotal; // CTS inafecto al IR
  const impuesto = impuestoRentaTrabajo(baseImponible, uit);
  const pension = AFP * baseAnual; // gratificaciones exoneradas de aportes
  const salud = ESSALUD * baseAnual; // EsSalud (empleador)

  const liquidez = ingresoPercibido - impuesto - pension; // efectivo en mano (AFP va al fondo)
  const valorTotal = liquidez + pension + salud; // pensión y salud son valor del trabajador
  const costoEmpresa = baseAnual + gratiTotal + cts + salud;
  const beneficios = gratiTotal + cts; // efectivo extra vs sueldo base

  const valorHora = tiempo.totalHoras > 0 ? valorTotal / tiempo.totalHoras : 0;

  // detalle por mes: sueldo del mes (según fracción) − AFP − IR; grati en jul/dic
  const meses: MesResultado[] = tiempo.meses.map((m, i) => {
    const sueldoMes = baseAnual * fraccionMensual[i];
    const grati = MESES_GRATI.includes(m.mes) ? gratiTotal / 2 : 0;
    const afpMes = AFP * sueldoMes;
    const irMes = impuesto / 12;
    const descuento = afpMes + irMes;
    const bruto = sueldoMes + grati;
    const liquido = sueldoMes - afpMes - irMes + grati;
    return { mes: m.mes, dias: m.dias, horas: m.horas, bruto: round(bruto), descuento: round(descuento), liquido: round(liquido) };
  });

  const netoMensualTipico = S - AFP * S - impuesto / 12;

  const breakdown: BreakdownStep[] = [
    { label: "Bruto", amount: round(S), kind: "start" },
    { label: "Imp. renta (5ta)", amount: -round(impuesto / 12), kind: "dec" },
    { label: "AFP / pensión", amount: -round(AFP * S), kind: "dec" },
    { label: "Líquido", amount: round(netoMensualTipico), kind: "subtotal" },
    { label: "Gratificación", amount: round(gratiTotal / 12), kind: "inc" },
    { label: "CTS", amount: round(cts / 12), kind: "inc" },
    { label: "EsSalud", amount: round(salud / 12), kind: "inc" },
    { label: "Valor total", amount: round(valorTotal / 12), kind: "total" },
  ];

  return {
    key: "planilla",
    nombre: "Planilla",
    tagline: "5ta categoría · dependiente",
    bruto: round(S),
    liquido: round(netoMensualTipico),
    compTotal: round(valorTotal / 12),
    costoEmpresa: round(costoEmpresa / 12),
    beneficios: round(beneficios / 12),
    cargaPct: round(((impuesto + pension) / ingresoPercibido) * 100),
    horasSemana: tiempo.meses.length ? round(tiempo.totalHoras / 52) : 0,
    badge: "Beneficios + estabilidad",
    breakdown,
    spark: [1, 1, 1, 1, 1, 1].map((f) => round((valorTotal / 12) * f)),
    radar: { liquidez: 0, compTotal: 0, beneficios: 0, estabilidad: 92, flexibilidad: 28 },
    promedioMensual: round(valorTotal / 12),
    valorHora,
    devolucion: 0,
    meses,
    anual: {
      ingresoTotal: round(ingresoPercibido),
      impuesto: round(impuesto),
      pension: round(pension),
      salud: round(salud),
      beneficios: round(beneficios),
      liquidez: round(liquidez),
      valorTotal: round(valorTotal),
      costoEmpresa: round(costoEmpresa),
    },
  };
}

/**
 * Independiente (4ta) a partir del ingreso anual y la fracción mensual.
 * `seguroAnual` es el costo anual del seguro privado (en soles). Se trata como
 * cobertura de salud: lo paga el trabajador (reduce su liquidez) pero se
 * contabiliza como valor de salud, igual que EsSalud en planilla. Por eso el
 * valor total no cambia frente a no tener seguro; lo que baja es la liquidez.
 */
function independiente(
  ingresoAnual: number,
  fraccionMensual: number[],
  tiempo: TiempoTrabajo,
  uit: number,
  seguroAnual = 0,
): Resultado {
  const ingresoTotal = ingresoAnual;
  const deduccion = Math.min(DEDUCC_4TA * ingresoTotal, 24 * uit);
  const baseImponible = ingresoTotal - deduccion;
  const impuesto = impuestoRentaTrabajo(baseImponible, uit); // impuesto FINAL (anual)

  // detalle por mes: bruto, retención 8% (si supera el umbral) y el seguro mensual
  const seguroMensual = seguroAnual / 12;
  let retencionAnual = 0;
  const meses: MesResultado[] = tiempo.meses.map((m, i) => {
    const bruto = ingresoTotal * fraccionMensual[i];
    const retencion = bruto > UMBRAL_RET_4TA ? RET_4TA * bruto : 0;
    retencionAnual += retencion;
    const descuento = retencion + seguroMensual; // retención + seguro privado
    return { mes: m.mes, dias: m.dias, horas: m.horas, bruto: round(bruto), descuento: round(descuento), liquido: round(bruto - descuento) };
  });

  const devolucion = Math.max(0, retencionAnual - impuesto); // se regulariza en la DJ anual
  const salud = seguroAnual; // cobertura privada valorizada (equivalente a EsSalud)
  const liquidezAnual = ingresoTotal - retencionAnual - seguroAnual; // efectivo tras seguro
  const valorTotal = liquidezAnual + devolucion + salud; // = ingreso − impuesto final
  const costoEmpresa = ingresoTotal; // la empresa solo paga el honorario

  const valorHora = tiempo.totalHoras > 0 ? valorTotal / tiempo.totalHoras : 0;
  const brutoMensual = ingresoTotal / 12;
  const retencionMensual = retencionAnual / 12;
  const liquidoMensual = liquidezAnual / 12;

  const breakdown: BreakdownStep[] = [
    { label: "Bruto", amount: round(brutoMensual), kind: "start" },
    { label: "Retención 8%", amount: -round(retencionMensual), kind: "dec" },
    ...(seguroAnual > 0
      ? [{ label: "Seguro privado", amount: -round(seguroMensual), kind: "dec" as const }]
      : []),
    { label: "Líquido", amount: round(liquidoMensual), kind: "subtotal" },
    { label: "Devolución IR", amount: round(devolucion / 12), kind: "inc" },
    ...(seguroAnual > 0
      ? [{ label: "Salud (seguro)", amount: round(salud / 12), kind: "inc" as const }]
      : []),
    { label: "Valor total", amount: round(valorTotal / 12), kind: "total" },
  ];

  return {
    key: "independiente",
    nombre: "Independiente",
    tagline: "4ta categoría · honorarios",
    bruto: round(brutoMensual),
    liquido: round(liquidoMensual),
    compTotal: round(valorTotal / 12),
    costoEmpresa: round(costoEmpresa / 12),
    beneficios: round(devolucion / 12),
    cargaPct: round((impuesto / ingresoTotal) * 100),
    horasSemana: tiempo.meses.length ? round(tiempo.totalHoras / 52) : 0,
    badge: "Mayor liquidez",
    breakdown,
    spark: [1.16, 0.7, 1.2, 0.62, 1.1, 0.82].map((f) => round((valorTotal / 12) * f)),
    radar: { liquidez: 0, compTotal: 0, beneficios: 0, estabilidad: 34, flexibilidad: 92 },
    promedioMensual: round(valorTotal / 12),
    valorHora,
    devolucion: round(devolucion),
    meses,
    anual: {
      ingresoTotal: round(ingresoTotal),
      impuesto: round(impuesto),
      pension: 0,
      salud: round(salud),
      beneficios: round(devolucion),
      liquidez: round(liquidezAnual),
      valorTotal: round(valorTotal),
      costoEmpresa: round(ingresoTotal),
    },
  };
}

/** Búsqueda binaria sobre función monótona creciente del ingreso anual. */
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

export type TipoCobro = "mensual" | "hora";

export interface ScenarioInput {
  pais: string; // 'pe' (único habilitado por ahora)
  categoria: Categoria;
  monto: number; // mensual, o tarifa por hora si tipoCobro === "hora"
  modo: "neto" | "bruto"; // cómo interpretar el monto
  tipoCobro: TipoCobro; // mensual o por hora; aplica a ambas categorías
  horario: number[]; // horas por día [Lun..Dom]
  monedaCobro: Moneda; // moneda en la que cobra; se convierte a la local del país
  descontarFeriados?: boolean; // restar feriados nacionales a los días laborables
  seguroPrivado?: boolean; // solo 4ta: paga seguro de salud privado
  seguroPrivadoMonto?: number; // costo mensual del seguro privado, en soles (PEN)
  wizardDone?: boolean; // ya completó el wizard inicial
}

export const DEFAULT_SCENARIO: ScenarioInput = {
  pais: "pe",
  categoria: "planilla",
  monto: 4500,
  modo: "bruto",
  tipoCobro: "mensual",
  horario: [8, 8, 8, 8, 8, 0, 0],
  monedaCobro: "PEN",
  descontarFeriados: false,
  seguroPrivado: false,
  seguroPrivadoMonto: 190, // tramo PE por defecto; se reajusta al activar según liquidez
  wizardDone: false,
};

export const PAIS_OPTIONS = [
  { value: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  { value: "mx", label: "México", flag: "🇲🇽", currency: "MXN", locale: "es-MX", disabled: true },
  { value: "co", label: "Colombia", flag: "🇨🇴", currency: "COP", locale: "es-CO", disabled: true },
  { value: "cl", label: "Chile", flag: "🇨🇱", currency: "CLP", locale: "es-CL", disabled: true },
];

/** Moneda local del país (hoy solo Perú = PEN). */
export const monedaLocalDe = (pais: string): Moneda =>
  (PAIS_OPTIONS.find((p) => p.value === pais)?.currency as Moneda) ?? "PEN";

export const CATEGORIA_OPTIONS: { value: Categoria; label: string }[] = [
  { value: "planilla", label: "Planilla (5ta)" },
  { value: "independiente", label: "Independiente (4ta)" },
];

// --------------------------- Seguro privado ------------------------------
// Tramos de precio MENSUAL del seguro privado de salud, por país (en su moneda
// local). Pensado para escalar: al habilitar un nuevo país en PAIS_OPTIONS,
// añade aquí sus tramos con la misma clave (código de país). El tramo por
// defecto se decide con `seguroPrivadoSugerido` según la liquidez del trabajador.
const SEGURO_PRIVADO_TRAMOS: Record<string, number[]> = {
  pe: [100, 190, 280, 300],
};

// El seguro sugerido no debe superar este porcentaje de la liquidez mensual.
const SEGURO_TECHO_LIQUIDEZ = 0.05;

/** Tramos de seguro privado disponibles para el país (vacío si no hay datos). */
export function seguroPrivadoTramos(pais: string): number[] {
  return SEGURO_PRIVADO_TRAMOS[pais] ?? [];
}

/**
 * Tramo de seguro sugerido por defecto: el más alto cuyo costo mensual no
 * supere el 5% de la liquidez mensual. Si ninguno cabe bajo el techo, devuelve
 * el tramo más bajo. Devuelve 0 si el país no tiene tramos configurados.
 */
export function seguroPrivadoSugerido(pais: string, liquidezMensual: number): number {
  const tramos = seguroPrivadoTramos(pais);
  if (!tramos.length) return 0;
  const techo = SEGURO_TECHO_LIQUIDEZ * Math.max(0, liquidezMensual);
  const aptos = tramos.filter((t) => t <= techo);
  return aptos.length ? Math.max(...aptos) : Math.min(...tramos);
}

export interface ScenarioResult {
  tuyo: Resultado;
  equivalente: Resultado;
  year: number;
}

/**
 * Resuelve el escenario: calcula tu situación y la equivalente en la otra
 * categoría con el MISMO valor económico total anual. Usa el calendario del
 * año en curso para días/horas laborables.
 */
export function computeScenario(input: ScenarioInput): ScenarioResult {
  const year = new Date().getFullYear();
  const uit = uitDe(year);
  const usaHora = input.tipoCobro === "hora";

  // Los feriados solo afectan al trabajador independiente (4ta): su ingreso
  // depende de los días/horas efectivamente trabajados. El sueldo de planilla
  // (5ta) es fijo y no se ve afectado por feriados, por lo que siempre usa el
  // calendario completo del año.
  const descansaFeriados = (input.descontarFeriados ?? false) && input.categoria === "independiente";
  const tiempoPlanilla = tiempoTrabajo(year, input.horario, false);
  const tiempoIndependiente = tiempoTrabajo(year, input.horario, descansaFeriados);
  const tiempoDe = (cat: Categoria): TiempoTrabajo =>
    cat === "planilla" ? tiempoPlanilla : tiempoIndependiente;

  const tiempoTuyo = tiempoDe(input.categoria);

  // El seguro privado solo aplica al independiente (4ta). Si tu categoría es
  // planilla, el control está oculto y no tiene efecto (tampoco en su
  // equivalente independiente).
  const seguroAnual =
    input.categoria === "independiente" && input.seguroPrivado
      ? Math.max(0, input.seguroPrivadoMonto ?? 0) * 12
      : 0;

  // fracción del ingreso anual que corresponde a cada mes (según tu categoría)
  const fraccionPorHoras =
    tiempoTuyo.totalHoras > 0
      ? tiempoTuyo.meses.map((m) => m.horas / tiempoTuyo.totalHoras)
      : Array(12).fill(1 / 12);
  const fraccionUniforme = Array(12).fill(1 / 12);
  const fraccionTuyo = usaHora ? fraccionPorHoras : fraccionUniforme;

  const modelar = (cat: Categoria, ingresoAnual: number, fraccion: number[]) =>
    cat === "planilla"
      ? planilla(ingresoAnual, fraccion, tiempoDe(cat), uit)
      : independiente(ingresoAnual, fraccion, tiempoDe(cat), uit, seguroAnual);

  // El independiente siempre se expresa en bruto (factura honorarios); el modo
  // neto solo aplica a planilla.
  const modo = input.categoria === "independiente" ? "bruto" : input.modo;

  // ingreso anual representado por el monto ingresado (tarifa×horas o 12×mensual)
  const ingresoBrutoAnual = usaHora ? input.monto * tiempoTuyo.totalHoras : 12 * input.monto;
  const objetivoMensual = ingresoBrutoAnual / 12; // bruto o neto según `modo`

  // 1) resolver el ingreso anual de tu categoría (si ingresaste neto, invertimos)
  const ingresoAnualTuyo =
    modo === "bruto"
      ? ingresoBrutoAnual
      : bisect((x) => modelar(input.categoria, x, fraccionTuyo).liquido, objetivoMensual);

  const tuyo = modelar(input.categoria, ingresoAnualTuyo, fraccionTuyo);

  // 2) equivalente en la otra categoría con el mismo valor total anual
  //    (se expresa como mensual fijo: "necesitaría S/ X al mes")
  const otra: Categoria = input.categoria === "planilla" ? "independiente" : "planilla";
  const ingresoAnualEquiv = bisect(
    (x) => modelar(otra, x, fraccionUniforme).anual.valorTotal,
    tuyo.anual.valorTotal,
  );
  const equivalente = modelar(otra, ingresoAnualEquiv, fraccionUniforme);

  // 3) radar normalizado entre las dos. Liquidez usa el líquido MENSUAL típico
  // (no el anual): así refleja el efectivo del día a día, donde el independiente
  // va por delante, sin que las gratificaciones/CTS de planilla lo "emparejen".
  const pair = [tuyo, equivalente];
  const maxLiq = Math.max(...pair.map((m) => m.liquido), 1);
  const maxComp = Math.max(...pair.map((m) => m.anual.valorTotal), 1);
  const maxBen = Math.max(...pair.map((m) => m.anual.beneficios), 1);
  pair.forEach((m) => {
    m.radar.liquidez = round((m.liquido / maxLiq) * 100);
    m.radar.compTotal = round((m.anual.valorTotal / maxComp) * 100);
    m.radar.beneficios = round((m.anual.beneficios / maxBen) * 100);
  });

  return { tuyo, equivalente, year };
}
