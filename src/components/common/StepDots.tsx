"use client";

import { cn } from "@/lib/cn";

/** Wizard progress: completed steps (accent), current (wide), pending. */
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
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const clickable = !!onJump && i <= current;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Paso ${i + 1} de ${count}${state === "done" ? " (completado)" : ""}`}
            aria-current={state === "current" ? "step" : undefined}
            disabled={!clickable}
            onClick={() => clickable && onJump!(i)}
            className={cn(
              "h-2 rounded-pill transition-all",
              state === "current" ? "w-8 bg-primary" : state === "done" ? "w-2 bg-accent" : "w-2 bg-line-strong",
              clickable ? "cursor-pointer" : "cursor-default",
            )}
          />
        );
      })}
    </div>
  );
}
