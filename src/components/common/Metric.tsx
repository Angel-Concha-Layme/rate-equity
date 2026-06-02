"use client";

import { cn } from "@/lib/cn";

/** Hero figure: display font + tabular nums, consistent across light/dark. */
export function Metric({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-display tabular-nums tracking-tight leading-none",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
