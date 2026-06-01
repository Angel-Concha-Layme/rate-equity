"use client";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-surface-2 border border-line-strong rounded-input text-ink px-3 py-2.5 text-[0.95rem]",
        "transition placeholder:text-subtle",
        "focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/25",
        className,
      )}
      {...props}
    />
  );
}
