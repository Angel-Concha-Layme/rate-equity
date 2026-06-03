import type { SVGProps } from "react";
import { BRAND, type GlyphKind } from "@/lib/brand";

/**
 * Geometric logo marks. Stroke/fill use currentColor; the caller sets the size
 * and color via className. One mark per brand keeps each identity legible.
 */
export function BrandGlyph({
  kind = BRAND.glyph,
  className,
}: {
  kind?: GlyphKind;
  className?: string;
}) {
  const base: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (kind) {
    case "equals":
      return (
        <svg {...base} strokeWidth={2.6}>
          <path d="M5 9.5h14M5 15.5h14" />
        </svg>
      );
    case "number":
      return (
        <svg {...base}>
          <path d="M9.6 4 7.6 20M16.4 4l-2 16M5 9.5h14M4.5 14.8h14" />
        </svg>
      );
    case "matrix":
      return (
        <svg {...base} fill="currentColor" stroke="none">
          <circle cx="8" cy="8" r="1.7" />
          <circle cx="16" cy="8" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="8" cy="16" r="1.7" />
          <circle cx="16" cy="16" r="1.7" />
        </svg>
      );
    case "scale":
      return (
        <svg {...base}>
          <path d="M12 4v16M6.5 20h11M4.5 8h15" />
          <path d="M4.5 8 2 13.2a3 3 0 0 0 5 0z" />
          <path d="M19.5 8 17 13.2a3 3 0 0 0 5 0z" />
        </svg>
      );
    case "compass":
      return (
        <svg {...base}>
          <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z" />
        </svg>
      );
    case "drop":
      return (
        <svg {...base}>
          <path d="M12 4c3.2 4.3 5 6.9 5 9.4a5 5 0 0 1-10 0C7 10.9 8.8 8.3 12 4z" />
        </svg>
      );
    case "rank":
      return (
        <svg {...base}>
          <path d="M5 12.5l7-5 7 5M5 17.5l7-5 7 5" />
        </svg>
      );
    case "slash":
      return (
        <svg {...base} strokeWidth={3}>
          <path d="M16 5 8 19" />
        </svg>
      );
    case "north":
      return (
        <svg {...base} fill="currentColor" stroke="currentColor" strokeWidth={1.4}>
          <path d="M12 3.5l6.5 17L12 16l-6.5 4.5z" />
        </svg>
      );
    case "abacus":
      return (
        <svg {...base}>
          <path d="M4 8h16M4 12h16M4 16h16" />
          <g fill="currentColor" stroke="none">
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="10.5" cy="16" r="1.5" />
          </g>
        </svg>
      );
    case "sol":
      return (
        <svg {...base}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9" />
        </svg>
      );
    case "hex":
      return (
        <svg {...base}>
          <path d="M12 3l7.5 4.5v9L12 21l-7.5-4.5v-9z" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...base} fill="currentColor" stroke="currentColor" strokeWidth={1.2}>
          <path d="M13 2 4 13.5h5.5L8 22l9-12h-5.5z" />
        </svg>
      );
    case "wave":
      return (
        <svg {...base} strokeWidth={2.4}>
          <path d="M3 14c3-5.5 6-5.5 9 0s6 5.5 9 0" />
        </svg>
      );
    case "star":
      return (
        <svg {...base} fill="currentColor" stroke="currentColor" strokeWidth={1}>
          <path d="M12 3.2l2.5 5.6 6.1.6-4.6 4 1.4 6L12 16.9 6.6 19.4 8 13.4l-4.6-4 6.1-.6z" />
        </svg>
      );
    case "equity":
      // The product thesis: two different amounts (the gross figures being
      // compared) converging to the SAME economic value. Two bars of different
      // heights on a common base, joined by an equals sign.
      return (
        <svg {...base} fill="currentColor" stroke="none">
          <rect x="4.4" y="10" width="3.7" height="9.6" rx="1.6" />
          <rect x="15.9" y="5.4" width="3.7" height="14.2" rx="1.6" />
          <rect x="9.9" y="10.5" width="4.2" height="2.2" rx="1.1" />
          <rect x="9.9" y="14.5" width="4.2" height="2.2" rx="1.1" />
        </svg>
      );
    case "ledger":
    default:
      return (
        <svg {...base}>
          <path d="M5 6.5h14M5 12h14M5 17.5h9" />
        </svg>
      );
  }
}
