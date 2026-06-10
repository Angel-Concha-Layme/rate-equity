"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useListbox } from "@/lib/useListbox";

/** Dropdown that renders flag + label (+ sub). Keyboard: arrows, Enter, Home/End, Escape. */
export function FlagSelect<T extends string>({
  value,
  onChange,
  options,
  className,
  id,
  "aria-label": ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; flag: string; sub?: string; disabled?: boolean }[];
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const { open, hi, ref, popupRef, coords, toggle, select, onKeyDown } = useListbox(options, value, onChange);
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-[0.95rem] text-ink transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="text-lg leading-none" aria-hidden>
            {selected?.flag}
          </span>
          <span className="truncate font-medium">{selected?.label ?? "Selecciona"}</span>
          {selected?.sub && <span className="truncate text-xs text-subtle">{selected.sub}</span>}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={cn("size-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
        <ul
          ref={popupRef}
          role="listbox"
          style={{
            position: "fixed",
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            width: coords?.width,
          }}
          className="max-h-72 animate-fade-up overflow-auto rounded-input border border-line bg-surface p-1 shadow-pop [animation-duration:120ms]"
        >
          {options.map((o, i) => {
            const active = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={active}
                aria-disabled={o.disabled}
                onClick={() => select(i)}
                className={cn(
                  "flex items-center gap-2.5 rounded-[calc(var(--radius-input-v)-2px)] px-3 py-2 text-sm",
                  o.disabled
                    ? "cursor-not-allowed opacity-60"
                    : active
                      ? "cursor-pointer bg-primary/10 font-semibold text-ink"
                      : "cursor-pointer text-ink hover:bg-surface-2",
                  i === hi && !o.disabled && "ring-1 ring-inset ring-ring/40",
                )}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {o.flag}
                </span>
                <span className="flex-1">
                  {o.label}
                  {o.sub && <span className="ml-1.5 text-xs text-subtle">{o.sub}</span>}
                  {o.disabled && <span className="ml-1 text-xs text-subtle">· próximamente</span>}
                </span>
                {active && (
                  <svg aria-hidden viewBox="0 0 20 20" className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 10l3.5 3.5L15 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
