export type ThemeKey = "ledger" | "ledger-v2" | "terminal" | "clarity";

export const THEMES: { key: ThemeKey; name: string; short: string; tagline: string }[] = [
  { key: "ledger", name: "El Libro Mayor", short: "Libro Mayor", tagline: "Editorial · institucional" },
  { key: "ledger-v2", name: "El Libro Mayor V2", short: "Libro Mayor V2", tagline: "Editorial · tipografía Claro" },
  { key: "terminal", name: "Terminal Nocturno", short: "Terminal", tagline: "Oscuro · quant" },
  { key: "clarity", name: "Claro", short: "Claro", tagline: "Humano · cercano" },
];
