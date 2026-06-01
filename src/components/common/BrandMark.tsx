import { BRAND } from "@/lib/brand";
import { BrandGlyph } from "./BrandGlyph";
import { cn } from "@/lib/cn";

/**
 * The logo icon: the brand glyph framed per BRAND.markStyle.
 * - tile: filled square in the primary color (default)
 * - outline: hairline-framed glyph in the primary color
 * - plain: bare glyph in the accent color, no frame
 */
export function BrandMark({ className }: { className?: string }) {
  if (BRAND.markStyle === "plain") {
    return <BrandGlyph className={cn("size-6 text-accent", className)} />;
  }

  const frame =
    BRAND.markStyle === "outline"
      ? "border-2 border-line-strong text-primary"
      : "bg-primary text-on-primary shadow-card";

  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-input", frame, className)}>
      <BrandGlyph className="size-[1.15rem]" />
    </span>
  );
}
