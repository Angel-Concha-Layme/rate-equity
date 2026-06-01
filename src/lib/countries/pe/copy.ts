/**
 * Etiquetas y prosa de la estrategia de Perú. Centraliza todo el texto
 * país-específico (modalidades, filas de detalle, ayudas de UI) para que el
 * cálculo y los componentes lo consuman desde un único lugar.
 */
import type { CopyPais, DetalleFila, ModalidadMeta, Rol } from "../types";

export const MODALIDADES_PE: Record<Rol, ModalidadMeta> = {
  formal: {
    rol: "formal",
    key: "planilla",
    nombre: "Planilla",
    tagline: "5ta categoría · dependiente",
    badge: "Beneficios + estabilidad",
    selectorLabel: "Planilla (5ta)",
    comoFrase: "En planilla",
    sujetoFrase: "alguien en planilla",
    razonPromedio: "al sumar gratificaciones, CTS y EsSalud",
    valorDiferido: "gracias a sus gratificaciones, CTS y EsSalud",
    wizard: {
      sub: "5ta categoría",
      desc: "Dependiente, en planilla. Incluye gratificaciones, CTS, EsSalud y AFP.",
      info: "Renta de 5ta: el empleador retiene impuestos y aporta beneficios. Menos líquido, más estable.",
    },
  },
  informal: {
    rol: "informal",
    key: "independiente",
    nombre: "Independiente",
    tagline: "4ta categoría · honorarios",
    badge: "Mayor liquidez",
    selectorLabel: "Independiente (4ta)",
    comoFrase: "Como independiente",
    sujetoFrase: "un independiente",
    razonPromedio: "al sumar la devolución de impuestos que se regulariza al cierre del año",
    valorDiferido: "gracias a la devolución de impuestos que recibe al cierre del año",
    wizard: {
      sub: "4ta categoría",
      desc: "Recibos por honorarios. Más líquido, sin beneficios automáticos.",
      info: "Renta de 4ta: tú asumes pensión y salud. Más liquidez de portada, pero sin grati ni CTS.",
    },
  },
};

export const DETALLE_ROWS_PE: DetalleFila[] = [
  { label: "Bruto mensual", get: (x, f) => f.money(x.bruto) },
  { label: "Líquido mensual (mes típico)", get: (x, f) => f.money(x.liquido) },
  { label: "Promedio mensual real", get: (x, f) => f.money(x.promedioMensual), emphasis: true, tone: "profit" },
  { label: "Costo para la empresa / mes", get: (x, f) => f.money(x.costoEmpresa), tone: "loss" },
  { label: "Carga (impuestos + aportes)", get: (x, f) => f.pct(x.cargaPct), tone: "loss" },
  { label: "Valor por hora efectiva", get: (x, f) => f.money(x.valorHora, { decimals: 1 }) },
  { label: "Ingreso total anual", get: (x, f) => f.money(x.anual.ingresoTotal), sub: true },
  { label: "Impuesto a la renta anual", get: (x, f) => f.money(x.anual.impuesto), tone: "loss", sub: true },
  { label: "Pensión (AFP) anual", get: (x, f) => f.money(x.anual.pension), sub: true },
  { label: "Salud (EsSalud / seguro) anual", get: (x, f) => f.money(x.anual.salud), sub: true },
  { label: "Beneficios (grati + CTS) anual", get: (x, f) => f.money(x.anual.beneficios), tone: "profit", sub: true },
  { label: "Valor económico total anual", get: (x, f) => f.money(x.anual.valorTotal), emphasis: true, sub: true },
];

export const COPY_PE: CopyPais = {
  situacionInfo:
    "5ta = planilla (dependiente, con grati/CTS/EsSalud). 4ta = honorarios (independiente, más líquido, sin beneficios).",
  feriadosInfo:
    "Solo aplica a independientes (4ta): si lo activas, se descuentan los feriados nacionales de Perú de los días laborables del año. En planilla el sueldo es fijo y no se ve afectado.",
  seguroInfo:
    "Solo 4ta: a diferencia de planilla (EsSalud), el independiente costea su salud. Si lo activas, el costo se descuenta de tu liquidez y se valoriza como cobertura de salud.",
  landingTagline: "Planilla (5ta) o Independiente (4ta)",
  wizardPaisNota: "Por ahora calculamos con tasas de Perú 2026.",
};
