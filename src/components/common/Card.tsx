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
        // El Libro Mayor: filete superior tipo contabilidad (esquinas redondeadas como "Claro")
        ruled && "theme-ledger:border-t-2 theme-ledger:border-t-ink",
        className,
      )}
      {...props}
    />
  );
}
