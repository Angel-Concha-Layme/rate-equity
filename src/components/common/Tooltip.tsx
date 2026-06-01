"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const GAP = 8; // separación entre el disparador y el globo (px)
const MARGIN = 8; // margen mínimo respecto a los bordes del viewport (px)

interface Coords {
  top: number;
  left: number;
}

/**
 * Tooltip anclado al disparador pero renderizado en un portal sobre
 * `document.body` con `position: fixed`. Así escapa de cualquier ancestro con
 * `overflow` (p. ej. la sidebar con scroll) que de otro modo lo recortaría, sin
 * recurrir a z-index: al montarse al final del body queda por encima por orden
 * del DOM, igual que el Modal.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const bubbleW = bubble?.offsetWidth ?? 0;
    const bubbleH = bubble?.offsetHeight ?? 0;
    const vw = document.documentElement.clientWidth;

    // Centrado horizontal sobre el disparador, recortado al viewport.
    let left = rect.left + rect.width / 2 - bubbleW / 2;
    left = Math.max(MARGIN, Math.min(left, vw - bubbleW - MARGIN));

    // Por defecto encima; si no cabe arriba, debajo del disparador.
    const fitsAbove = rect.top - GAP - bubbleH >= MARGIN;
    const top = fitsAbove ? rect.top - GAP - bubbleH : rect.bottom + GAP;

    setCoords({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => reposition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, reposition]);

  return (
    <span
      ref={triggerRef}
      className={cn("inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {children}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            style={{ top: coords?.top ?? -9999, left: coords?.left ?? -9999 }}
            className="pointer-events-none fixed w-max max-w-60 rounded-input border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink shadow-pop"
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
