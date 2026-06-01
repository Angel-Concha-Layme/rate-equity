/**
 * Días y horas laborables reales por mes y año, a partir del horario semanal
 * (horas por día, índice 0 = Lunes ... 6 = Domingo). Recorre el calendario real
 * del año, por lo que respeta bisiestos y la distribución exacta de días de
 * semana. Opcionalmente descuenta los feriados nacionales de Perú; este
 * descuento solo aplica al trabajador independiente (4ta), cuyo ingreso depende
 * de los días/horas trabajados. El sueldo de planilla (5ta) es fijo, así que se
 * calcula siempre con el calendario completo (sin descontar feriados).
 */

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

export interface MesTiempo {
  mes: number; // 1-12
  dias: number; // días laborables del mes
  horas: number; // horas laborables del mes
}

export interface TiempoTrabajo {
  meses: MesTiempo[]; // 12 entradas (enero..diciembre)
  totalDias: number;
  totalHoras: number;
}

/** ¿Hay datos de feriados para este año? (para habilitar el toggle con sentido). */
export function hayFeriados(year: number): boolean {
  return Boolean(FERIADOS_PE[year]?.length);
}

/**
 * Calcula días y horas laborables por mes para `year`, según `horario`
 * (horas por día, [Lun..Dom]). Si `descontarFeriados`, omite los feriados PE.
 */
export function tiempoTrabajo(
  year: number,
  horario: number[],
  descontarFeriados = false,
): TiempoTrabajo {
  const feriados =
    descontarFeriados && FERIADOS_PE[year]
      ? new Set(FERIADOS_PE[year].map(([m, d]) => `${m}-${d}`))
      : null;

  const meses: MesTiempo[] = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, dias: 0, horas: 0 }));

  const cursor = new Date(year, 0, 1);
  while (cursor.getFullYear() === year) {
    // getDay(): 0=Dom..6=Sáb -> índice horario [Lun..Dom]: Lun=0..Dom=6
    const dow = cursor.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    const horas = horario[idx] ?? 0;

    if (horas > 0) {
      const m = cursor.getMonth(); // 0-11
      const esFeriado = feriados?.has(`${m + 1}-${cursor.getDate()}`) ?? false;
      if (!esFeriado) {
        meses[m].dias += 1;
        meses[m].horas += horas;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDias = meses.reduce((a, b) => a + b.dias, 0);
  const totalHoras = meses.reduce((a, b) => a + b.horas, 0);
  return { meses, totalDias, totalHoras };
}
