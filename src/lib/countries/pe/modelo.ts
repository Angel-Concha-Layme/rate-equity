/**
 * Modelado tributario de Perú (transparente y verificable).
 *
 * Compara las dos categorías de renta de trabajo:
 *  - formal   → planilla, rentas de 5ta categoría (dependiente)
 *  - informal → independiente, rentas de 4ta categoría (recibos por honorarios)
 *
 * Las horas/días laborables se calculan sobre el calendario real del año
 * (respeta bisiestos y la distribución de días de semana). La 4ta categoría
 * modela la retención mensual de 8% (pago a cuenta) y la devolución al cierre
 * del ejercicio, que se valoriza como beneficio.
 */
import type { BreakdownStep } from "@/lib/sample";
import type { TiempoTrabajo } from "@/lib/calendar";
import type { MesResultado, Resultado } from "../types";
import { MODALIDADES_PE } from "./copy";

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

const round = Math.round;

/** Planilla (5ta) a partir del ingreso anual base (12 sueldos) y la fracción mensual. */
export function planilla(
  ingresoAnual: number,
  fraccionMensual: number[],
  tiempo: TiempoTrabajo,
  uit: number,
): Resultado {
  const meta = MODALIDADES_PE.formal;
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
    key: meta.key,
    rol: meta.rol,
    nombre: meta.nombre,
    tagline: meta.tagline,
    bruto: round(S),
    liquido: round(netoMensualTipico),
    compTotal: round(valorTotal / 12),
    costoEmpresa: round(costoEmpresa / 12),
    beneficios: round(beneficios / 12),
    cargaPct: round(((impuesto + pension) / ingresoPercibido) * 100),
    horasSemana: tiempo.meses.length ? round(tiempo.totalHoras / 52) : 0,
    badge: meta.badge,
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
export function independiente(
  ingresoAnual: number,
  fraccionMensual: number[],
  tiempo: TiempoTrabajo,
  uit: number,
  seguroAnual = 0,
): Resultado {
  const meta = MODALIDADES_PE.informal;
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
    key: meta.key,
    rol: meta.rol,
    nombre: meta.nombre,
    tagline: meta.tagline,
    bruto: round(brutoMensual),
    liquido: round(liquidoMensual),
    compTotal: round(valorTotal / 12),
    costoEmpresa: round(costoEmpresa / 12),
    beneficios: round(devolucion / 12),
    cargaPct: round((impuesto / ingresoTotal) * 100),
    horasSemana: tiempo.meses.length ? round(tiempo.totalHoras / 52) : 0,
    badge: meta.badge,
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
