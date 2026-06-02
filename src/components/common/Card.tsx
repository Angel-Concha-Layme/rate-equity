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
        "rounded-card border border-line bg-surface transition duration-300 hover:border-accent/40",
        // Sombra verde (--primary) solo en hover (claro); en oscuro se conserva la previa.
        "theme-light:hover:shadow-[0_0_22px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
        "theme-dark:shadow-[0_0_16px_var(--line)] theme-dark:hover:shadow-[0_0_22px_color-mix(in_oklab,var(--accent)_40%,transparent)]",
        ruled && "border-t-2 border-t-line-strong",
        className,
      )}
      {...props}
    />
  );
}
