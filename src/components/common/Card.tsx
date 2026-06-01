"use client";

import { cn } from "@/lib/cn";

export function Card({
  ruled = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ruled?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface border border-line rounded-card shadow-card",
        // Ledger theme: accounting-style top rule (rounded corners like "Clarity")
        ruled && "theme-ledger:border-t-2 theme-ledger:border-t-ink",
        className,
      )}
      {...props}
    />
  );
}
