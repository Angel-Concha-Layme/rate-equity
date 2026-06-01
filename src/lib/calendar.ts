/**
 * Real working days and hours per month and year, from the weekly schedule
 * (hours per day, index 0 = Monday ... 6 = Sunday). It walks the real calendar
 * of the year, so it respects leap years and the exact distribution of
 * weekdays. Optionally skips a list of holidays (provided by the country
 * strategy); this deduction only makes sense for variable-income roles.
 */

export interface MonthTime {
  month: number; // 1-12
  days: number; // working days of the month
  hours: number; // working hours of the month
}

export interface WorkTime {
  months: MonthTime[]; // 12 entries (January..December)
  totalDays: number;
  totalHours: number;
}

/**
 * Computes working days and hours per month for `year`, according to
 * `schedule` (hours per day, [Mon..Sun]). Skips the given `holidays` ([month, day]).
 */
export function workTime(
  year: number,
  schedule: number[],
  holidays: [number, number][] = [],
): WorkTime {
  const set = holidays.length ? new Set(holidays.map(([m, d]) => `${m}-${d}`)) : null;

  const months: MonthTime[] = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, days: 0, hours: 0 }));

  const cursor = new Date(year, 0, 1);
  while (cursor.getFullYear() === year) {
    // getDay(): 0=Sun..6=Sat -> schedule index [Mon..Sun]: Mon=0..Sun=6
    const dow = cursor.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    const hours = schedule[idx] ?? 0;

    if (hours > 0) {
      const m = cursor.getMonth(); // 0-11
      const isHoliday = set?.has(`${m + 1}-${cursor.getDate()}`) ?? false;
      if (!isHoliday) {
        months[m].days += 1;
        months[m].hours += hours;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalDays = months.reduce((a, b) => a + b.days, 0);
  const totalHours = months.reduce((a, b) => a + b.hours, 0);
  return { months, totalDays, totalHours };
}
