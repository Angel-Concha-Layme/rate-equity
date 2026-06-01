/**
 * Contrato del patrón Strategy multi-país. El core (`computeScenario`) delega
 * todo lo país-específico (modelado tributario, calendario/feriados, etiquetas
 * y copy) en una `CountryStrategy` resuelta desde el registro por código ISO.
 *
 * Las modalidades se modelan con roles genéricos: `formal` (relación de
 * dependencia, con beneficios) e `informal` (por cuenta propia, más líquido).
 * Cada país aporta las etiquetas y la prosa con las que se muestran esos roles.
 */
import type { Modalidad, ModalidadKey, MoneyFn } from "@/lib/sample";
import type { Moneda } from "@/lib/currency";
import type { TiempoTrabajo } from "@/lib/calendar";

/** Roles canónicos comparables (independientes del país). */
export type Rol = "formal" | "informal";

/** Países con estrategia disponible. Se amplía al sumar jurisdicciones. */
export type Pais = "pe";

/** Detalle de un mes (para la tabla mes a mes). */
export interface MesResultado {
  mes: number; // 1-12
  dias: number; // días laborables del mes
  horas: number; // horas laborables del mes
  bruto: number; // ingreso bruto del mes
  descuento: number; // retención/aportes del mes según rol
  liquido: number; // efectivo recibido en el mes
}

/** Resultado completo de modelar una modalidad para un ingreso anual dado. */
export interface Resultado extends Modalidad {
  rol: Rol;
  promedioMensual: number; // valor total / 12
  valorHora: number;
  devolucion: number; // devolución anual de impuestos (0 si no aplica)
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

/** Metadatos y copy de una modalidad dentro de un país. */
export interface ModalidadMeta {
  rol: Rol;
  key: ModalidadKey; // identidad estable (React keys / compatibilidad)
  nombre: string; // "Planilla"
  tagline: string; // "5ta categoría · dependiente"
  badge: string; // "Beneficios + estabilidad"
  selectorLabel: string; // "Planilla (5ta)"
  // fragmentos de prosa para el banner de equivalencia
  comoFrase: string; // inicio de oración: "En planilla"
  sujetoFrase: string; // sujeto: "alguien en planilla"
  razonPromedio: string; // por qué el promedio supera al mes típico
  valorDiferido: string; // de dónde sale el valor que no se ve como efectivo
  // copy del wizard
  wizard: { sub: string; desc: string; info: string };
}

/** Formateadores que se inyectan a las filas de detalle. */
export interface Formatos {
  money: MoneyFn;
  pct: (n: number, decimals?: number) => string;
}

/** Fila de la tabla de detalle anual (labels y acceso a datos por país). */
export interface DetalleFila {
  label: string;
  get: (x: Resultado, fmt: Formatos) => string;
  emphasis?: boolean;
  tone?: "loss" | "profit";
  sub?: boolean;
}

/** Identidad y formato del país. */
export interface PaisMeta {
  code: Pais;
  label: string;
  flag: string;
  currency: Moneda;
  locale: string;
  disabled?: boolean;
}

/** Textos país-específicos compartidos por la UI. */
export interface CopyPais {
  situacionInfo: string; // ayuda del selector de situación (sidebar)
  feriadosInfo: string; // ayuda del toggle de feriados
  seguroInfo: string; // ayuda del toggle de seguro privado
  landingTagline: string; // subtítulo del landing
  wizardPaisNota: string; // nota del paso de país en el wizard
}

/** Argumentos para modelar una modalidad. */
export interface ModelarArgs {
  rol: Rol;
  ingresoAnual: number;
  fraccionMensual: number[];
  tiempo: TiempoTrabajo;
  year: number;
  seguroAnual?: number;
}

/** Estrategia de un país: modela el cálculo y aporta etiquetas/copy/feriados. */
export interface CountryStrategy {
  meta: PaisMeta;
  defaultRol: Rol;
  modalidades: Record<Rol, ModalidadMeta>;
  /** Feriados nacionales del año: [mes (1-12), día]. */
  feriados(year: number): [number, number][];
  /** ¿El ingreso del rol depende de los días/horas trabajados? (feriados afectan). */
  ingresoVariable(rol: Rol): boolean;
  /** ¿El rol factura siempre en bruto? (el impuesto se regulariza después). */
  facturaBruto(rol: Rol): boolean;
  modelar(a: ModelarArgs): Resultado;
  /** Filas de la tabla de detalle anual (labels país-específicos). */
  detalleRows(): DetalleFila[];
  /** Tramos de precio mensual del seguro privado de salud (moneda local). */
  seguroTramos(): number[];
  /** Tramo de seguro sugerido según la liquidez mensual. */
  seguroSugerido(liquidezMensual: number): number;
  /** Formateador de moneda local. */
  money: MoneyFn;
  copy: CopyPais;
}
