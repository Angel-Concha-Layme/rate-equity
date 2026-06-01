"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LabNav,
  Hero,
  CalculatorPanel,
  ComparisonCards,
  ChartsBlock,
  BreakdownTable,
  AtomsShowcase,
} from "@/components/lab/sections";
import { textureStyle } from "@/components/lab/Texture";
import { MODALITIES, type ModalityKey } from "@/lib/sample";
import type { ThemeKey } from "@/components/lab/theme";

export default function LabPage() {
  const [theme, setTheme] = useState<ThemeKey>("ledger");
  const [modality, setModality] = useState<ModalityKey>("contractor");
  const [hours, setHours] = useState(40);

  const selected = MODALITIES.find((m) => m.key === modality)!;

  return (
    <div
      data-theme={theme}
      style={textureStyle(theme)}
      className="min-h-screen bg-canvas font-sans text-ink selection:bg-accent/25"
    >
      <LabNav theme={theme} onTheme={setTheme} />
      <Hero selected={selected} theme={theme} />

      <main className="mx-auto max-w-6xl space-y-20 px-5 pb-28 pt-6 sm:space-y-24">
        <CalculatorPanel
          modality={modality}
          setModality={setModality}
          hours={hours}
          setHours={setHours}
        />
        <ComparisonCards selected={modality} hours={hours} onSelect={setModality} theme={theme} />
        <ChartsBlock selected={modality} />
        <BreakdownTable hours={hours} />
        <AtomsShowcase />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted">
          <span>
            Rate<span className="text-accent">Equity</span> · laboratorio de estilos
          </span>
          <Link
            href="/a3f9c2/libro-mayor"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            Variantes · El Libro Mayor →
          </Link>
        </div>
      </footer>
    </div>
  );
}
