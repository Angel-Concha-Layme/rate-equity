"use client";

import { cn } from "@/lib/cn";

type PillTone = "neutral" | "profit" | "loss" | "accent" | "primary";

const pillTones: Record<PillTone, string> = {
  neutral: "text-muted bg-surface-2 border-line-strong",
  profit: "text-profit bg-profit/10 border-profit/30",
  loss: "text-loss bg-loss/10 border-loss/30",
  accent: "text-accent bg-accent/10 border-accent/30",
  primary: "text-primary bg-primary/10 border-primary/30",
};

export function Pill({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: PillTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.06em]",
        pillTones[tone],
        className,
      )}
      {...props}
    />
  );
}
