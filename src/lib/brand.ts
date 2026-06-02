export type GlyphKind =
  | "ledger"
  | "equals"
  | "number"
  | "matrix"
  | "scale"
  | "compass"
  | "drop"
  | "rank"
  | "slash"
  | "north"
  | "abacus"
  | "sol"
  | "hex"
  | "bolt"
  | "wave"
  | "star"
  | "equity";

export type MarkStyle = "tile" | "outline" | "plain";

export interface Brand {
  /** Full product name. Used in <title>, meta, footer and the landing copy. */
  name: string;
  /** Wordmark split: lead reads in ink, accent tail in the accent color. */
  markLead: string;
  markAccent: string;
  /** Short descriptor shown in the footer. */
  tagline: string;
  /** Small mono pill in the header and sidebar. */
  locale: string;
  /** data-theme key whose token block lives in globals.css. */
  theme: string;
  /** Logo mark drawn by BrandGlyph. */
  glyph: GlyphKind;
  /** How the logo mark is framed by BrandMark. */
  markStyle: MarkStyle;
}

/**
 * Single source of brand identity. A visual rebrand swaps these values plus the
 * matching [data-theme] token block in globals.css and the fonts in fonts.ts.
 * Nothing else in the app hardcodes the brand name or mark.
 */
export const BRAND: Brand = {
  name: "RateEquity",
  markLead: "Rate",
  markAccent: "Equity",
  tagline: "Valor económico real",
  locale: "Perú · 2026",
  theme: "light",
  glyph: "equity",
  markStyle: "tile",
};
