"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  leaving?: boolean; // in the exit animation, before being removed
}

// Maximum number of toasts visible at once. Beyond it, the oldest ones are
// discarded (useful when pressing a toggle repeatedly). Easily editable.
const MAX_TOASTS = 3;

// Duration of the exit animation (must match --animate-fade-out).
const EXIT_MS = 200;

// Minimal external store (same pattern as useScenario): lets us trigger toasts
// from anywhere without context or props.
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  for (const listener of listeners) listener();
}

/** Removes a toast after animating its exit. */
function dismiss(id: number) {
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

/** Shows a toast; it auto-dismisses after `durationMs`. */
export function toast(message: string, opts: { tone?: ToastTone; durationMs?: number } = {}) {
  const { tone = "neutral", durationMs = 3000 } = opts;
  const id = nextId++;
  // Keep only the latest MAX_TOASTS; earlier ones are discarded instantly.
  items = [...items, { id, message, tone }].slice(-MAX_TOASTS);
  emit();
  setTimeout(() => dismiss(id), durationMs);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: ToastItem[] = [];

// Client-mount detection without setState-in-effect: useSyncExternalStore
// returns the server snapshot (false) during SSR and on the first hydration
// render, and the client one (true) after mounting. This way the portal only
// appears on the client without causing a hydration mismatch.
const subscribeMounted = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
}

/**
 * Toast container. Mounted once (in the root layout) and rendered into a portal
 * over `document.body`: it stays on top by DOM order, without resorting to
 * z-index.
 */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  const mounted = useMounted();

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-2 px-4"
    >
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-card border border-line bg-surface px-4 py-3 text-sm text-ink shadow-pop",
            t.leaving ? "animate-fade-out" : "animate-fade-in",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}
