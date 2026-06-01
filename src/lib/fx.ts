/**
 * Tipo de cambio hacia la moneda local del país (hoy PEN).
 * Cascada: open.er-api.com -> jsDelivr currency-api -> pages.dev -> constante offline.
 * Sin API key, con CORS. El cálculo NUNCA debe bloquear por red: siempre hay un
 * valor inmediato (caché o FX_FALLBACK) y se revalida en segundo plano.
 *
 * Atribución (licencia open-access de ExchangeRate-API): se muestra en la UI.
 */

// Último recurso offline (tasas aproximadas) para que el cálculo nunca se
// bloquee. Se derivan del registro único de monedas (`currency.ts`).
import { FX_FALLBACK } from "./currency";
export { FX_FALLBACK };

export type FxFuente = "api" | "cache" | "fallback";

export interface FxResult {
  rate: number; // unidades de PEN por 1 unidad de la moneda de origen
  fecha: string; // fecha legible del dato
  fuente: FxFuente;
  nextUpdateUnix?: number;
}

const cacheKey = (from: string) => `rateequity:fxrate:${from.toUpperCase()}`;
const hoyISO = () => new Date().toISOString().slice(0, 10);

interface CacheEntry {
  rate: number;
  base: string;
  fecha: string;
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
    /* sin acceso a cache */
  }
}

/** ¿La caché sigue vigente según la señal nextUpdate de la API? */
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

/** Primaria: open.er-api.com (rates.PEN, mayúsculas). */
async function fromOpenErApi(from: string): Promise<FxResult> {
  const json = (await fetchJson(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`)) as {
    result?: string;
    rates?: Record<string, number>;
    time_last_update_utc?: string;
    time_next_update_unix?: number;
  };
  if (json.result !== "success" || typeof json.rates?.PEN !== "number") {
    throw new Error("respuesta inválida open.er-api");
  }
  return {
    rate: json.rates.PEN,
    fecha: (json.time_last_update_utc ?? hoyISO()).slice(0, 16),
    fuente: "api",
    nextUpdateUnix: json.time_next_update_unix,
  };
}

/** Fallback: currency-api (json[from].pen, minúsculas). `host` permite jsDelivr o pages.dev. */
async function fromCurrencyApi(from: string, host: string): Promise<FxResult> {
  const lower = from.toLowerCase();
  const json = (await fetchJson(`${host}/v1/currencies/${lower}.json`)) as Record<string, unknown> & {
    date?: string;
  };
  const obj = json[lower] as Record<string, number> | undefined;
  if (!obj || typeof obj.pen !== "number") throw new Error("respuesta inválida currency-api");
  return { rate: obj.pen, fecha: json.date ?? hoyISO(), fuente: "api" };
}

/** Obtiene la tasa hacia PEN probando cada fuente; nunca lanza (cae a FX_FALLBACK). */
export async function getRateToPEN(from: string): Promise<FxResult> {
  const code = from.toUpperCase();
  if (code === "PEN") return { rate: 1, fecha: hoyISO(), fuente: "fallback" };

  const fuentes: Array<() => Promise<FxResult>> = [
    () => fromOpenErApi(code),
    () => fromCurrencyApi(code, "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest"),
    () => fromCurrencyApi(code, "https://latest.currency-api.pages.dev"),
  ];

  for (const fuente of fuentes) {
    try {
      const r = await fuente();
      if (Number.isFinite(r.rate) && r.rate > 0) {
        writeFxCache({ rate: r.rate, base: code, fecha: r.fecha, fetchedAt: Date.now(), nextUpdateUnix: r.nextUpdateUnix });
        return r;
      }
    } catch {
      /* probar la siguiente fuente */
    }
  }

  return { rate: FX_FALLBACK[code] ?? 1, fecha: hoyISO(), fuente: "fallback" };
}
