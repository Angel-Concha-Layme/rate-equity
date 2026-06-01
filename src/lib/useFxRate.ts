"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FX_FALLBACK, getRateToPEN, readFxCache, isFxCacheFresh, type FxFuente } from "./fx";

export interface FxState {
  rate: number; // PEN por 1 unidad de `from`
  fecha: string;
  fuente: FxFuente;
  loading: boolean;
  stale: boolean;
}

const PEN_STATE: FxState = { rate: 1, fecha: "", fuente: "fallback", loading: false, stale: false };

// Snapshots estables por código de moneda. useSyncExternalStore exige que
// getSnapshot devuelva la misma referencia mientras el valor no cambie.
const snapshots = new Map<string, FxState>();
const serverSnapshots = new Map<string, FxState>();
const listeners = new Set<() => void>();
const requested = new Set<string>();

function fallbackState(code: string): FxState {
  return { rate: FX_FALLBACK[code] ?? 1, fecha: "", fuente: "fallback", loading: true, stale: false };
}

function serverSnapshot(code: string): FxState {
  if (code === "PEN") return PEN_STATE;
  let snap = serverSnapshots.get(code);
  if (!snap) {
    snap = fallbackState(code);
    serverSnapshots.set(code, snap);
  }
  return snap;
}

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(code: string, next: FxState) {
  snapshots.set(code, next);
  emit();
}

function clientSnapshot(code: string): FxState {
  if (code === "PEN") return PEN_STATE;
  let snap = snapshots.get(code);
  if (!snap) {
    snap = fallbackState(code);
    snapshots.set(code, snap);
  }
  return snap;
}

// Lee caché (síncrono) y revalida en segundo plano. Solo la primera vez por código.
function ensureLoaded(code: string) {
  if (code === "PEN" || requested.has(code)) return;
  requested.add(code);

  const cache = readFxCache(code);
  if (cache) {
    setSnapshot(code, {
      rate: cache.rate,
      fecha: cache.fecha,
      fuente: "cache",
      loading: false,
      stale: !isFxCacheFresh(cache),
    });
    if (isFxCacheFresh(cache)) return; // fresca: sin red
  }

  getRateToPEN(code)
    .then((r) => setSnapshot(code, { rate: r.rate, fecha: r.fecha, fuente: r.fuente, loading: false, stale: false }))
    .catch(() => {
      /* getRateToPEN nunca lanza; defensivo */
    });
}

/**
 * Tipo de cambio hacia PEN con stale-while-revalidate.
 * NUNCA hace fetch en render: se modela como store externo, pinta al instante
 * con caché o FX_FALLBACK y revalida en segundo plano al suscribirse.
 */
export function useFxRate(from: string): FxState {
  const code = (from || "PEN").toUpperCase();

  const subscribe = useCallback(
    (listener: () => void) => {
      if (code === "PEN") return () => {};
      listeners.add(listener);
      ensureLoaded(code);
      return () => {
        listeners.delete(listener);
      };
    },
    [code],
  );

  const getSnapshot = useCallback(() => clientSnapshot(code), [code]);
  const getServerSnapshot = useCallback(() => serverSnapshot(code), [code]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
