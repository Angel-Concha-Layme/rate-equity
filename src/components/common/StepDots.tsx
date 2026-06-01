"use client";

import { cn } from "@/lib/cn";

/** Progreso del wizard: pasos completados (acento), actual (ancho), pendientes. */
export function StepDots({
  count,
  current,
  onJump,
}: {
  count: number;
  current: number;
  onJump?: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2" aria-label="Progreso del wizard">
      {Array.from({ length: count }).map((_, i) => {
        const estado = i < current ? "done" : i === current ? "current" : "todo";
        const clickable = !!onJump && i <= current;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Paso ${i + 1} de ${count}${estado === "done" ? " (completado)" : ""}`}
            aria-current={estado === "current" ? "step" : undefined}
            disabled={!clickable}
            onClick={() => clickable && onJump!(i)}
            className={cn(
              "h-2 rounded-pill transition-all",
              estado === "current" ? "w-8 bg-primary" : estado === "done" ? "w-2 bg-accent" : "w-2 bg-line-strong",
              clickable ? "cursor-pointer" : "cursor-default",
            )}
          />
        );
      })}
    </div>
  );
}
