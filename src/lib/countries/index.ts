/**
 * Registro de estrategias por país (patrón Strategy). El core resuelve la
 * estrategia desde `input.pais`; añadir un país nuevo es crear su carpeta bajo
 * `pe/` (modelo + copy + feriados), registrarla aquí y habilitarla en
 * `PAIS_OPTIONS`.
 */
import type { CountryStrategy, Pais } from "./types";
import { peru } from "./pe";

export type { CountryStrategy, Pais, Rol, Resultado, MesResultado } from "./types";

export const STRATEGIES: Partial<Record<Pais, CountryStrategy>> = {
  pe: peru,
};

/** Estrategia del país (con respaldo a Perú si el código no está habilitado). */
export function getStrategy(pais: string): CountryStrategy {
  return STRATEGIES[pais as Pais] ?? peru;
}

/**
 * Opciones para el selector de país. Incluye jurisdicciones futuras marcadas
 * como `disabled` hasta tener su estrategia: la UI las muestra pero no permite
 * seleccionarlas.
 */
export const PAIS_OPTIONS: {
  value: string;
  label: string;
  flag: string;
  currency: string;
  locale: string;
  disabled: boolean;
}[] = [
  { value: "pe", label: "Perú", flag: "🇵🇪", currency: "PEN", locale: "es-PE", disabled: false },
  { value: "mx", label: "México", flag: "🇲🇽", currency: "MXN", locale: "es-MX", disabled: true },
  { value: "co", label: "Colombia", flag: "🇨🇴", currency: "COP", locale: "es-CO", disabled: true },
  { value: "cl", label: "Chile", flag: "🇨🇱", currency: "CLP", locale: "es-CL", disabled: true },
];
