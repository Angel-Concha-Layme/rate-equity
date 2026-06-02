"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

/** Storage key shared with the inline boot script in layout.tsx. */
export const THEME_KEY = "re-theme";

/**
 * Reads the active theme from <html data-theme> (set before paint by the boot
 * script) and lets the UI toggle between the light (Solvente) and dark (Foco)
 * modes, persisting the choice in localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") setTheme(current);
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* almacenamiento no disponible: el cambio vale solo en memoria */
      }
      return next;
    });
  }

  return { theme, toggle };
}
