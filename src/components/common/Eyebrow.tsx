"use client";

import { cn } from "@/lib/cn";

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.16em] text-muted",
        "theme-ledger:font-mono theme-ledger:tracking-[0.22em]",
        "theme-terminal:font-mono theme-terminal:text-primary theme-terminal:tracking-[0.2em]",
        "theme-clarity:normal-case theme-clarity:tracking-normal theme-clarity:font-bold theme-clarity:text-accent theme-clarity:text-sm",
        className,
      )}
      {...props}
    />
  );
}
