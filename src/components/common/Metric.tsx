"use client";

import { cn } from "@/lib/cn";

/** Cifra protagonista: fuente display + tabular; en Terminal usa mono. */
export function Metric({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-display tabular-nums tracking-tight leading-none theme-terminal:font-mono theme-terminal:tracking-tighter",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
