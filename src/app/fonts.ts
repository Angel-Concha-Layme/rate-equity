import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

// RateEquity · sistema tipográfico unificado para modo claro (Solvente) y
// oscuro (Foco). Archivo display (titulares y cifras), Inter cuerpo,
// JetBrains Mono para etiquetas y datos.
const display = Archivo({ subsets: ["latin"], variable: "--brand-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--brand-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--brand-mono",
  display: "swap",
});

export const fontVars = [display, sans, mono].map((f) => f.variable).join(" ");
