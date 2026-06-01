/**
 * Exchange rate toward the country's local currency (today PEN).
 * Cascade: open.er-api.com -> jsDelivr currency-api -> pages.dev -> offline constant.
 * No API key, CORS-enabled. The calculation must NEVER block on the network:
 * there is always an immediate value (cache or FX_FALLBACK), revalidated in
 * the background.
 *
 * Attribution (ExchangeRate-API open-access license): shown in the UI.
 */

// Offline last resort (approximate rates) so the calculation never blocks.
// Derived from the single currency registry (`currency.ts`).
import { FX_FALLBACK } from "./currency";
export { FX_FALLBACK };

export type FxSource = "api" | "cache" | "fallback";

export interface FxResult {
  rate: number; // units of PEN per 1 unit of the source currency
  date: string; // human-readable date of the datum
  source: FxSource;
  nextUpdateUnix?: number;
}

const cacheKey = (from: string) => `rateequity:fxrate:${from.toUpperCase()}`;
const todayISO = () => new Date().toISOString().slice(0, 10);

interface CacheEntry {
  rate: number;
  base: string;
  date: string;
  fetchedAt: number;
  nextUpdateUnix?: number;
}

export function readFxCache(from: string): CacheEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(from));
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function writeFxCache(entry: CacheEntry) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(entry.base), JSON.stringify(entry));
  } catch {
    /* no cache access */
  }
}

/** Is the cache still valid according to the API's nextUpdate signal? */
export function isFxCacheFresh(entry: CacheEntry | null): boolean {
  if (!entry) return false;
  if (entry.nextUpdateUnix) return Date.now() / 1000 < entry.nextUpdateUnix;
  return Date.now() - entry.fetchedAt < 12 * 60 * 60 * 1000; // 12h
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Primary: open.er-api.com (rates.PEN, uppercase). */
async function fromOpenErApi(from: string): Promise<FxResult> {
  const json = (await fetchJson(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`)) as {
    result?: string;
    rates?: Record<string, number>;
    time_last_update_utc?: string;
    time_next_update_unix?: number;
  };
  if (json.result !== "success" || typeof json.rates?.PEN !== "number") {
    throw new Error("invalid open.er-api response");
  }
  return {
    rate: json.rates.PEN,
    date: (json.time_last_update_utc ?? todayISO()).slice(0, 16),
    source: "api",
    nextUpdateUnix: json.time_next_update_unix,
  };
}

/** Fallback: currency-api (json[from].pen, lowercase). `host` allows jsDelivr or pages.dev. */
async function fromCurrencyApi(from: string, host: string): Promise<FxResult> {
  const lower = from.toLowerCase();
  const json = (await fetchJson(`${host}/v1/currencies/${lower}.json`)) as Record<string, unknown> & {
    date?: string;
  };
  const obj = json[lower] as Record<string, number> | undefined;
  if (!obj || typeof obj.pen !== "number") throw new Error("invalid currency-api response");
  return { rate: obj.pen, date: json.date ?? todayISO(), source: "api" };
}

/** Gets the rate toward PEN trying each source; never throws (falls back to FX_FALLBACK). */
export async function getRateToPEN(from: string): Promise<FxResult> {
  const code = from.toUpperCase();
  if (code === "PEN") return { rate: 1, date: todayISO(), source: "fallback" };

  const sources: Array<() => Promise<FxResult>> = [
    () => fromOpenErApi(code),
    () => fromCurrencyApi(code, "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest"),
    () => fromCurrencyApi(code, "https://latest.currency-api.pages.dev"),
  ];

  for (const source of sources) {
    try {
      const r = await source();
      if (Number.isFinite(r.rate) && r.rate > 0) {
        writeFxCache({ rate: r.rate, base: code, date: r.date, fetchedAt: Date.now(), nextUpdateUnix: r.nextUpdateUnix });
        return r;
      }
    } catch {
      /* try the next source */
    }
  }

  return { rate: FX_FALLBACK[code] ?? 1, date: todayISO(), source: "fallback" };
}
