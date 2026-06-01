"use client";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "accent" | "ghost";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-input border border-transparent cursor-pointer transition duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none";

const buttonSizes = {
  sm: "text-xs px-3 py-2",
  md: "text-sm px-[1.05rem] py-2.5",
  lg: "text-base px-6 py-3",
} as const;

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110 shadow-glow",
  accent: "bg-accent text-on-accent hover:brightness-105",
  ghost: "bg-transparent text-ink border-line-strong hover:bg-ink/[0.06]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button className={cn(buttonBase, buttonSizes[size], buttonVariants[variant], className)} {...props} />
  );
}
