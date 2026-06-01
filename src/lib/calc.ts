import { tiempoTrabajo } from "./calendar";
import { MONEDA_OPTIONS, type Moneda } from "./currency";
import { getStrategy, PAIS_OPTIONS } from "./countries";
import type { MesResultado, Resultado, Rol } from "./countries/types";

export { MONEDA_OPTIONS, PAIS_OPTIONS, getStrategy };
export type { Moneda, Rol, Resultado, MesResultado };

/**
 * Núcleo de RateEquity: orquestador agnóstico de país. Resuelve la estrategia
 * desde `input.pais` y delega en ella todo el modelado tributario; aquí solo
 * vive lo genérico: calendario, búsqueda binaria de la equivalencia y la
 * normalización del radar.
 */

/** Alias de compatibilidad. La categoría es ahora un rol genérico. */
export type Categoria = Rol;

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
  pais: string; // código ISO del país (resuelve la estrategia)
  categoria: Rol; // formal | informal
  monto: number; // mensual, o tarifa por hora si tipoCobro === "hora"
  modo: "neto" | "bruto"; // cómo interpretar el monto
  tipoCobro: TipoCobro; // mensual o por hora; aplica a ambos roles
  horario: number[]; // horas por día [Lun..Dom]
  monedaCobro: Moneda; // moneda en la que cobra; se convierte a la local del país
  descontarFeriados?: boolean; // restar feriados nacionales a los días laborables
  seguroPrivado?: boolean; // solo informal: paga seguro de salud privado
  seguroPrivadoMonto?: number; // costo mensual del seguro privado, en moneda local
  wizardDone?: boolean; // ya completó el wizard inicial
}

export const DEFAULT_SCENARIO: ScenarioInput = {
  pais: "pe",
  categoria: "formal",
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

/** Moneda local del país (la divisa en la que el motor expresa los resultados). */
export const monedaLocalDe = (pais: string): Moneda => getStrategy(pais).meta.currency;

/** Tramos de seguro privado disponibles para el país (vacío si no hay datos). */
export function seguroPrivadoTramos(pais: string): number[] {
  return getStrategy(pais).seguroTramos();
}

/** Tramo de seguro sugerido por defecto según la liquidez mensual. */
export function seguroPrivadoSugerido(pais: string, liquidezMensual: number): number {
  return getStrategy(pais).seguroSugerido(liquidezMensual);
}

export interface ScenarioResult {
  tuyo: Resultado;
  equivalente: Resultado;
  year: number;
}

/**
 * Resuelve el escenario: calcula tu situación y la equivalente en el otro rol
 * con el MISMO valor económico total anual. Usa el calendario del año en curso
 * para días/horas laborables y delega el modelado en la estrategia del país.
 */
export function computeScenario(input: ScenarioInput): ScenarioResult {
  const strat = getStrategy(input.pais);
  const year = new Date().getFullYear();
  const usaHora = input.tipoCobro === "hora";

  const rol = input.categoria;
  const otro: Rol = rol === "formal" ? "informal" : "formal";

  // Los feriados solo afectan a roles de ingreso variable (informal), cuyo
  // ingreso depende de los días/horas trabajados. Los roles de ingreso fijo
  // (formal) usan siempre el calendario completo del año.
  const descansa = (input.descontarFeriados ?? false) && strat.ingresoVariable(rol);
  const feriados = strat.feriados(year);
  const tiempoFijo = tiempoTrabajo(year, input.horario, []);
  const tiempoVariable = tiempoTrabajo(year, input.horario, descansa ? feriados : []);
  const tiempoDe = (r: Rol) => (strat.ingresoVariable(r) ? tiempoVariable : tiempoFijo);

  const tiempoTuyo = tiempoDe(rol);

  // El seguro privado solo aplica al rol informal (asume su propia salud).
  const seguroAnual =
    rol === "informal" && input.seguroPrivado ? Math.max(0, input.seguroPrivadoMonto ?? 0) * 12 : 0;

  // fracción del ingreso anual que corresponde a cada mes (según tu rol)
  const fraccionPorHoras =
    tiempoTuyo.totalHoras > 0
      ? tiempoTuyo.meses.map((m) => m.horas / tiempoTuyo.totalHoras)
      : Array(12).fill(1 / 12);
  const fraccionUniforme = Array(12).fill(1 / 12);
  const fraccionTuyo = usaHora ? fraccionPorHoras : fraccionUniforme;

  const modelar = (r: Rol, ingresoAnual: number, fraccion: number[]) =>
    strat.modelar({ rol: r, ingresoAnual, fraccionMensual: fraccion, tiempo: tiempoDe(r), year, seguroAnual });

  // Los roles que facturan en bruto se expresan siempre en bruto; el modo neto
  // solo aplica a roles con retención en planilla.
  const modo = strat.facturaBruto(rol) ? "bruto" : input.modo;

  // ingreso anual representado por el monto ingresado (tarifa×horas o 12×mensual)
  const ingresoBrutoAnual = usaHora ? input.monto * tiempoTuyo.totalHoras : 12 * input.monto;
  const objetivoMensual = ingresoBrutoAnual / 12; // bruto o neto según `modo`

  // 1) resolver el ingreso anual de tu rol (si ingresaste neto, invertimos)
  const ingresoAnualTuyo =
    modo === "bruto"
      ? ingresoBrutoAnual
      : bisect((x) => modelar(rol, x, fraccionTuyo).liquido, objetivoMensual);

  const tuyo = modelar(rol, ingresoAnualTuyo, fraccionTuyo);

  // 2) equivalente en el otro rol con el mismo valor total anual
  //    (se expresa como mensual fijo: "necesitaría S/ X al mes")
  const ingresoAnualEquiv = bisect(
    (x) => modelar(otro, x, fraccionUniforme).anual.valorTotal,
    tuyo.anual.valorTotal,
  );
  const equivalente = modelar(otro, ingresoAnualEquiv, fraccionUniforme);

  // 3) radar normalizado entre las dos. Liquidez usa el líquido MENSUAL típico
  // (no el anual): así refleja el efectivo del día a día, donde el informal va
  // por delante, sin que las gratificaciones/CTS del formal lo "emparejen".
  const round = Math.round;
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
