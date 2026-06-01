"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEFAULT_SCENARIO, type ScenarioInput } from "./calc";
import { defaultExpenses, reconcileExpenses } from "./expenses";

const KEY = "rate-equity:scenario";

interface StoreState {
  input: ScenarioInput;
  loaded: boolean;
}

// Stable snapshot for SSR/hydration: the first render (server and client) uses
// the defaults; loading from cache happens on subscribe, already on the client.
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
    /* no cache access */
  }
}

// Maps legacy `category` values (Peruvian keys) to the canonical roles.
const LEGACY_ROLE: Record<string, ScenarioInput["category"]> = {
  planilla: "formal",
  independiente: "informal",
};

function normalize(input: ScenarioInput): ScenarioInput {
  const base = LEGACY_ROLE[input.category as string]
    ? { ...input, category: LEGACY_ROLE[input.category as string] }
    : input;
  return { ...base, expenses: reconcileExpenses(base.expenses ?? defaultExpenses()) };
}

function hydrateFromCache() {
  let input = state.input;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) input = normalize({ ...input, ...(JSON.parse(raw) as Partial<ScenarioInput>) });
  } catch {
    /* cache unavailable or corrupt: use defaults */
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
 * Scenario state persisted in the browser cache (localStorage). Modeled as an
 * external store to hydrate without mismatch and expose `loaded` as a reactive
 * value (not a ref) to consumers.
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
