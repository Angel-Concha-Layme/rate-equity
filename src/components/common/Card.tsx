"use client";

import { cn } from "@/lib/cn";

type CardOwnProps = {
  ruled?: boolean;
};

type CardProps<T extends React.ElementType> = CardOwnProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof CardOwnProps | "as">;

export function Card<T extends React.ElementType = "div">({
  as,
  ruled = false,
  className,
  ...props
}: CardProps<T>) {
  const Component = (as ?? "div") as React.ElementType;
  return (
    <Component
      className={cn(
        "rounded-card border border-line bg-surface",
        ruled && "border-t-2 border-t-line-strong",
        className,
      )}
      {...props}
    />
  );
}
