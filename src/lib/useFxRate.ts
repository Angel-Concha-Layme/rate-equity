"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FX_FALLBACK, getRateToPEN, readFxCache, isFxCacheFresh, type FxSource } from "./fx";

export interface FxState {
  rate: number; // PEN per 1 unit of `from`
  date: string;
  source: FxSource;
  loading: boolean;
  stale: boolean;
}

const PEN_STATE: FxState = { rate: 1, date: "", source: "fallback", loading: false, stale: false };

// Stable snapshots per currency code. useSyncExternalStore requires getSnapshot
// to return the same reference while the value does not change.
const snapshots = new Map<string, FxState>();
const serverSnapshots = new Map<string, FxState>();
const listeners = new Set<() => void>();
const requested = new Set<string>();

function fallbackState(code: string): FxState {
  return { rate: FX_FALLBACK[code] ?? 1, date: "", source: "fallback", loading: true, stale: false };
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

// Reads cache (synchronously) and revalidates in the background. Only the first time per code.
function ensureLoaded(code: string) {
  if (code === "PEN" || requested.has(code)) return;
  requested.add(code);

  const cache = readFxCache(code);
  if (cache) {
    setSnapshot(code, {
      rate: cache.rate,
      date: cache.date,
      source: "cache",
      loading: false,
      stale: !isFxCacheFresh(cache),
    });
    if (isFxCacheFresh(cache)) return; // fresh: no network
  }

  getRateToPEN(code)
    .then((r) => setSnapshot(code, { rate: r.rate, date: r.date, source: r.source, loading: false, stale: false }))
    .catch(() => {
      /* getRateToPEN never throws; defensive */
    });
}

/**
 * Exchange rate toward PEN with stale-while-revalidate.
 * NEVER fetches during render: modeled as an external store, paints instantly
 * with cache or FX_FALLBACK and revalidates in the background on subscribe.
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
