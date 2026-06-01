/** National holidays of Peru by year: [month (1-12), day]. Maintain manually. */
const HOLIDAYS_PE: Record<number, [number, number][]> = {
  2025: [
    [1, 1], [4, 17], [4, 18], [5, 1], [6, 7], [6, 29], [7, 23], [7, 28],
    [7, 29], [8, 6], [8, 30], [10, 8], [11, 1], [12, 8], [12, 9], [12, 25],
  ],
  2026: [
    [1, 1], [4, 2], [4, 3], [5, 1], [6, 7], [6, 29], [7, 23], [7, 28],
    [7, 29], [8, 6], [8, 30], [10, 8], [11, 1], [12, 8], [12, 9], [12, 25],
  ],
};

/** PE holidays of the year (empty list if no data is loaded). */
export function holidaysPE(year: number): [number, number][] {
  return HOLIDAYS_PE[year] ?? [];
}
