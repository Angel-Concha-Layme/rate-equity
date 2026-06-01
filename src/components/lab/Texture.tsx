import type { CSSProperties } from "react";
import type { ThemeKey } from "./theme";

/** Fondo decorativo por tema. Valor dinámico -> estilo inline (no es clase). */
const LEDGER_TEX =
  "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(28,26,20,0.035) 31px 32px), radial-gradient(120% 80% at 100% 0%, rgba(154,106,28,0.06), transparent 60%)";

const TEXTURES: Record<ThemeKey, string> = {
  ledger: LEDGER_TEX,
  "ledger-v2": LEDGER_TEX,
  terminal:
    "radial-gradient(90% 60% at 80% -10%, rgba(45,212,191,0.10), transparent 60%), radial-gradient(70% 50% at 0% 0%, rgba(59,130,246,0.09), transparent 55%), linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
  clarity:
    "radial-gradient(60% 50% at 12% 0%, rgba(16,185,129,0.13), transparent 55%), radial-gradient(55% 45% at 95% 12%, rgba(251,113,56,0.13), transparent 55%)",
};

/**
 * Estilo de fondo decorativo para aplicar en el contenedor raíz de la página.
 * Como es un `background` (no un overlay posicionado), siempre queda detrás del
 * contenido sin necesidad de z-index. `fixed` da el efecto de fondo estático.
 */
export function textureStyle(theme: ThemeKey): CSSProperties {
  return {
    backgroundImage: TEXTURES[theme],
    backgroundSize: theme === "terminal" ? "auto, auto, 44px 44px, 44px 44px" : undefined,
    backgroundAttachment: "fixed",
  };
}
