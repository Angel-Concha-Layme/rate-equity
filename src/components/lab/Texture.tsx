import type { CSSProperties } from "react";

/** Decorative background per theme. Dynamic value -> inline style (not a class). */
const LEDGER_TEX =
  "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(28,26,20,0.035) 31px 32px), radial-gradient(120% 80% at 100% 0%, rgba(154,106,28,0.06), transparent 60%)";

type Tex = { image: string; size?: string };

const TEXTURES: Record<string, Tex> = {
  ledger: { image: LEDGER_TEX },
  "ledger-v2": { image: LEDGER_TEX },
  terminal: {
    image:
      "radial-gradient(90% 60% at 80% -10%, rgba(45,212,191,0.10), transparent 60%), radial-gradient(70% 50% at 0% 0%, rgba(59,130,246,0.09), transparent 55%), linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
    size: "auto, auto, 44px 44px, 44px 44px",
  },
  clarity: {
    image:
      "radial-gradient(60% 50% at 12% 0%, rgba(16,185,129,0.13), transparent 55%), radial-gradient(55% 45% at 95% 12%, rgba(251,113,56,0.13), transparent 55%)",
  },
};

const DEFAULT_TEX: Tex = { image: LEDGER_TEX };

/**
 * Decorative background style for the page root container. Since it is a
 * `background` (not a positioned overlay) it always stays behind content
 * without z-index. `fixed` gives the static background effect. Unknown theme
 * keys fall back to a neutral texture, so new brand themes always render.
 */
export function textureStyle(theme: string): CSSProperties {
  const tex = TEXTURES[theme] ?? DEFAULT_TEX;
  return {
    backgroundImage: tex.image,
    backgroundSize: tex.size,
    backgroundAttachment: "fixed",
  };
}
