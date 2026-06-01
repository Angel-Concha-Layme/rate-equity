/** Estrategia de Perú: ensambla modelado, calendario y copy. */
import { makeMoney } from "@/lib/sample";
import type { CountryStrategy, Rol } from "../types";
import { feriadosPE } from "./feriados";
import { independiente, planilla, uitDe } from "./modelo";
import { COPY_PE, DETALLE_ROWS_PE, MODALIDADES_PE } from "./copy";

// Tramos de precio MENSUAL del seguro privado de salud (en soles).
const SEGURO_TRAMOS_PE = [100, 190, 280, 300];
// El seguro sugerido no debe superar este porcentaje de la liquidez mensual.
const SEGURO_TECHO_LIQUIDEZ = 0.05;

function seguroSugeridoPE(liquidezMensual: number): number {
  if (!SEGURO_TRAMOS_PE.length) return 0;
  const techo = SEGURO_TECHO_LIQUIDEZ * Math.max(0, liquidezMensual);
  const aptos = SEGURO_TRAMOS_PE.filter((t) => t <= techo);
  return aptos.length ? Math.max(...aptos) : Math.min(...SEGURO_TRAMOS_PE);
}

export const peru: CountryStrategy = {
  meta: { code: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  defaultRol: "formal",
  modalidades: MODALIDADES_PE,
  feriados: feriadosPE,
  ingresoVariable: (rol: Rol) => rol === "informal",
  facturaBruto: (rol: Rol) => rol === "informal",
  modelar: ({ rol, ingresoAnual, fraccionMensual, tiempo, year, seguroAnual = 0 }) =>
    rol === "formal"
      ? planilla(ingresoAnual, fraccionMensual, tiempo, uitDe(year))
      : independiente(ingresoAnual, fraccionMensual, tiempo, uitDe(year), seguroAnual),
  detalleRows: () => DETALLE_ROWS_PE,
  seguroTramos: () => SEGURO_TRAMOS_PE,
  seguroSugerido: seguroSugeridoPE,
  money: makeMoney("PEN", "es-PE"),
  copy: COPY_PE,
};
