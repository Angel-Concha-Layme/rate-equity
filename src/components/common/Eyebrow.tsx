"use client";

import { cn } from "@/lib/cn";

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted",
        className,
      )}
      {...props}
    />
  );
}
