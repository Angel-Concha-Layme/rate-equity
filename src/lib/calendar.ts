/**
 * Días y horas laborables reales por mes y año, a partir del horario semanal
 * (horas por día, índice 0 = Lunes ... 6 = Domingo). Recorre el calendario real
 * del año, por lo que respeta bisiestos y la distribución exacta de días de
 * semana. Opcionalmente omite una lista de feriados (provista por la estrategia
 * del país); este descuento solo tiene sentido para roles de ingreso variable.
 */

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

/**
 * Calcula días y horas laborables por mes para `year`, según `horario`
 * (horas por día, [Lun..Dom]). Omite los `feriados` indicados ([mes, día]).
 */
export function tiempoTrabajo(
  year: number,
  horario: number[],
  feriados: [number, number][] = [],
): TiempoTrabajo {
  const set = feriados.length ? new Set(feriados.map(([m, d]) => `${m}-${d}`)) : null;

  const meses: MesTiempo[] = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, dias: 0, horas: 0 }));

  const cursor = new Date(year, 0, 1);
  while (cursor.getFullYear() === year) {
    // getDay(): 0=Dom..6=Sáb -> índice horario [Lun..Dom]: Lun=0..Dom=6
    const dow = cursor.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    const horas = horario[idx] ?? 0;

    if (horas > 0) {
      const m = cursor.getMonth(); // 0-11
      const esFeriado = set?.has(`${m + 1}-${cursor.getDate()}`) ?? false;
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
