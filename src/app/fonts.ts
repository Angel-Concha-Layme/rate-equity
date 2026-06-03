import { Archivo, Inter, JetBrains_Mono } from "next/font/google";

// RateEquity · unified type system for light (Solvente) and dark (Foco) modes.
// Archivo for display (headings and figures), Inter for body, JetBrains Mono
// for labels and data.
const display = Archivo({ subsets: ["latin"], variable: "--brand-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--brand-sans", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--brand-mono",
  display: "swap",
});

export const fontVars = [display, sans, mono].map((f) => f.variable).join(" ");
