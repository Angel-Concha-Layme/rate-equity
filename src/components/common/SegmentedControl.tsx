"use client";

import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/common/Tooltip";

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  hint?: string; // tooltip explicativo cuando la opción está deshabilitada
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex w-full gap-1 rounded-input border border-line bg-canvas-2 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const btn = (
          <button
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={opt.disabled || undefined}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className={cn(
              "w-full rounded-[calc(var(--radius-input-v)-2px)] px-3 py-1.5 text-sm font-semibold transition",
              opt.disabled
                ? "cursor-not-allowed text-subtle"
                : active
                  ? "bg-surface text-ink shadow-card"
                  : "text-muted hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        );

        return opt.disabled && opt.hint ? (
          <Tooltip key={opt.value} content={opt.hint} className="flex-1">
            {btn}
          </Tooltip>
        ) : (
          <span key={opt.value} className="flex-1">
            {btn}
          </span>
        );
      })}
    </div>
  );
}
