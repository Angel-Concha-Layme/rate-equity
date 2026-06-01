import {
  Fraunces,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Hanken_Grotesk,
  JetBrains_Mono,
  Bricolage_Grotesque,
  Lexend,
} from "next/font/google";

// Dirección A: El Libro Mayor (editorial / financiero)
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--f-fraunces",
  display: "swap",
});
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f-plex-sans",
  display: "swap",
});
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-plex-mono",
  display: "swap",
});

// Dirección B: Terminal Nocturno (quant / terminal)
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--f-hanken",
  display: "swap",
});
export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--f-jetbrains",
  display: "swap",
});

// Dirección C: Claro (humano / cercano)
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--f-bricolage",
  display: "swap",
});
export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--f-lexend",
  display: "swap",
});

// Todas las variables aplicadas en <html>. Cada tema escoge cuáles usa.
export const fontVars = [
  fraunces,
  plexSans,
  plexMono,
  hanken,
  jetbrains,
  bricolage,
  lexend,
]
  .map((f) => f.variable)
  .join(" ");
