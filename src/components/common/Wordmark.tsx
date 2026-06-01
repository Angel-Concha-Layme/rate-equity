import { BRAND } from "@/lib/brand";
import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/cn";

const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" } as const;

/** Full brand lockup: logo mark + wordmark (lead in ink, accent tail). */
export function Wordmark({
  size = "md",
  withMark = true,
  className,
}: {
  size?: keyof typeof sizes;
  withMark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-display font-bold tracking-tight text-ink",
        sizes[size],
        className,
      )}
    >
      {withMark && <BrandMark />}
      <span className="leading-none">
        {BRAND.markLead}
        <span className="text-accent">{BRAND.markAccent}</span>
      </span>
    </span>
  );
}
