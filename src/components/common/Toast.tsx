"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  leaving?: boolean; // en animación de salida, antes de removerse
}

// Máximo de toasts visibles a la vez. Al superarlo, se descartan los más
// antiguos (útil al presionar un toggle repetidamente). Fácilmente editable.
const MAX_TOASTS = 3;

// Duración de la animación de salida (debe coincidir con --animate-fade-out).
const EXIT_MS = 200;

// Store externo mínimo (mismo patrón que useScenario): permite disparar toasts
// desde cualquier parte sin contexto ni props.
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  for (const listener of listeners) listener();
}

/** Quita un toast tras animar su salida. */
function dismiss(id: number) {
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

/** Muestra un toast; se autodescarta tras `durationMs`. */
export function toast(message: string, opts: { tone?: ToastTone; durationMs?: number } = {}) {
  const { tone = "neutral", durationMs = 3000 } = opts;
  const id = nextId++;
  // Conserva solo los últimos MAX_TOASTS; los anteriores se descartan al instante.
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

// Detección de montaje en cliente sin setState-en-efecto: useSyncExternalStore
// devuelve el snapshot de servidor (false) en SSR y en el primer render de
// hidratación, y el de cliente (true) tras montar. Así el portal solo aparece
// en cliente sin provocar mismatch de hidratación.
const subscribeMounted = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
}

/**
 * Contenedor de toasts. Se monta una vez (en el layout raíz) y se renderiza en
 * un portal sobre `document.body`: queda por encima por orden del DOM, sin
 * recurrir a z-index.
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
