/** Feriados nacionales de Perú por año: [mes (1-12), día]. Mantener manualmente. */
const FERIADOS_PE: Record<number, [number, number][]> = {
  2025: [
    [1, 1], [4, 17], [4, 18], [5, 1], [6, 7], [6, 29], [7, 23], [7, 28],
    [7, 29], [8, 6], [8, 30], [10, 8], [11, 1], [12, 8], [12, 9], [12, 25],
  ],
  2026: [
    [1, 1], [4, 2], [4, 3], [5, 1], [6, 7], [6, 29], [7, 23], [7, 28],
    [7, 29], [8, 6], [8, 30], [10, 8], [11, 1], [12, 8], [12, 9], [12, 25],
  ],
};

/** Feriados PE del año (lista vacía si no hay datos cargados). */
export function feriadosPE(year: number): [number, number][] {
  return FERIADOS_PE[year] ?? [];
}
