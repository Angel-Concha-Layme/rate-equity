"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_SCENARIO, type ScenarioInput } from "./calc";

const KEY = "rate-equity:scenario";

interface StoreState {
  input: ScenarioInput;
  loaded: boolean;
}

// Snapshot estable para SSR/hidratación: el primer render (servidor y cliente)
// usa los defaults; la carga desde cache ocurre al suscribirse, ya en cliente.
const SERVER_STATE: StoreState = { input: DEFAULT_SCENARIO, loaded: false };

let state: StoreState = SERVER_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist(input: ScenarioInput) {
  try {
    localStorage.setItem(KEY, JSON.stringify(input));
  } catch {
    /* sin acceso a cache */
  }
}

// Mapea valores legacy de `categoria` (claves peruanas) a los roles canónicos.
const ROL_LEGACY: Record<string, ScenarioInput["categoria"]> = {
  planilla: "formal",
  independiente: "informal",
};

function normalizar(input: ScenarioInput): ScenarioInput {
  const legacy = ROL_LEGACY[input.categoria as string];
  return legacy ? { ...input, categoria: legacy } : input;
}

function hydrateFromCache() {
  let input = state.input;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) input = normalizar({ ...input, ...(JSON.parse(raw) as Partial<ScenarioInput>) });
  } catch {
    /* cache no disponible o corrupta: usamos defaults */
  }
  state = { input, loaded: true };
  emit();
}

function write(input: ScenarioInput) {
  state = { ...state, input };
  persist(input);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!state.loaded) hydrateFromCache();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Estado del escenario con persistencia en cache del navegador (localStorage).
 * Se modela como store externo para hidratar sin mismatch y exponer `loaded`
 * como valor reactivo (no un ref) hacia los consumidores.
 */
export function useScenario() {
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );

  const setInput = useCallback(
    (updater: ScenarioInput | ((prev: ScenarioInput) => ScenarioInput)) => {
      const next = typeof updater === "function" ? updater(state.input) : updater;
      write(next);
    },
    [],
  );

  const patch = useCallback((p: Partial<ScenarioInput>) => write({ ...state.input, ...p }), []);
  const reset = useCallback(() => write(DEFAULT_SCENARIO), []);

  return { input: snap.input, setInput, patch, reset, loaded: snap.loaded };
}
