/**
 * Labels and prose for the Peru strategy. Centralizes all country-specific text
 * (modalities, detail rows, UI help) so the calculation and the components
 * consume it from a single place.
 */
import type { CountryCopy, DetailRow, ModalityMeta, Role } from "../types";

export const MODALITIES_PE: Record<Role, ModalityMeta> = {
  formal: {
    role: "formal",
    key: "planilla",
    name: "Planilla",
    tagline: "5ta categoría · dependiente",
    badge: "Beneficios + estabilidad",
    selectorLabel: "Planilla (5ta)",
    asPhrase: "En planilla",
    subjectPhrase: "alguien en planilla",
    averageReason: "al sumar gratificaciones, CTS y EsSalud",
    deferredValue: "gracias a sus gratificaciones, CTS y EsSalud",
    wizard: {
      sub: "5ta categoría",
      desc: "Dependiente, en planilla. Incluye gratificaciones, CTS, EsSalud y AFP.",
      info: "Renta de 5ta: el empleador retiene impuestos y aporta beneficios. Menos líquido, más estable.",
    },
  },
  informal: {
    role: "informal",
    key: "independiente",
    name: "Independiente",
    tagline: "4ta categoría · honorarios",
    badge: "Mayor liquidez",
    selectorLabel: "Independiente (4ta)",
    asPhrase: "Como independiente",
    subjectPhrase: "un independiente",
    averageReason: "al sumar la devolución de impuestos que se regulariza al cierre del año",
    deferredValue: "gracias a la devolución de impuestos que recibe al cierre del año",
    wizard: {
      sub: "4ta categoría",
      desc: "Recibos por honorarios. Más líquido, sin beneficios automáticos.",
      info: "Renta de 4ta: tú asumes pensión y salud. Más liquidez de portada, pero sin grati ni CTS.",
    },
  },
};

export const DETAIL_ROWS_PE: DetailRow[] = [
  { label: "Bruto mensual", get: (x, f) => f.money(x.gross) },
  { label: "Líquido mensual (mes típico)", get: (x, f) => f.money(x.net) },
  { label: "Promedio mensual real", get: (x, f) => f.money(x.monthlyAverage), emphasis: true, tone: "profit" },
  { label: "Costo para la empresa / mes", get: (x, f) => f.money(x.employerCost), tone: "loss" },
  { label: "Carga (impuestos + aportes)", get: (x, f) => f.pct(x.loadPct), tone: "loss" },
  { label: "Valor por hora efectiva", get: (x, f) => f.money(x.hourlyValue, { decimals: 1 }) },
  { label: "Ingreso total anual", get: (x, f) => f.money(x.annual.totalIncome), sub: true },
  { label: "Impuesto a la renta anual", get: (x, f) => f.money(x.annual.tax), tone: "loss", sub: true },
  { label: "Pensión (AFP) anual", get: (x, f) => f.money(x.annual.pension), sub: true },
  { label: "Salud (EsSalud) anual", get: (x, f) => f.money(x.annual.health), sub: true },
  { label: "Beneficios (grati + CTS) anual", get: (x, f) => f.money(x.annual.benefits), tone: "profit", sub: true },
  { label: "Valor económico total anual", get: (x, f) => f.money(x.annual.totalValue), emphasis: true, sub: true },
];

export const COPY_PE: CountryCopy = {
  situationInfo:
    "5ta = planilla (dependiente, con grati/CTS/EsSalud). 4ta = honorarios (independiente, más líquido, sin beneficios).",
  holidaysInfo:
    "Solo aplica a independientes (4ta): si lo activas, se descuentan los feriados nacionales de Perú de los días laborables del año. En planilla el sueldo es fijo y no se ve afectado.",
  landingTagline: "Planilla (5ta) o Independiente (4ta)",
  wizardCountryNote: "Por ahora calculamos con tasas de Perú 2026.",
};
