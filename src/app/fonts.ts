import {
  Fraunces,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Hanken_Grotesk,
  JetBrains_Mono,
  Bricolage_Grotesque,
  Lexend,
} from "next/font/google";

// Direction A: El Libro Mayor (editorial / financial)
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

// Direction B: Terminal Nocturno (quant / terminal)
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

// Direction C: Claro (human / approachable)
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

// All variables applied on <html>. Each theme picks which ones it uses.
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
