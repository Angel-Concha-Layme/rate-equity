"use client";

import { Button, Card, Eyebrow } from "@/components/common";
import { getStrategy } from "@/lib/calc";

const WHAT_IT_DOES = [
  { n: "01", t: "Liquidez real", d: "Lo que de verdad te queda al mes, después de impuestos y aportes." },
  { n: "02", t: "Valor total", d: "Sueldo + gratificaciones + CTS + salud, anualizado a su valor real." },
  { n: "03", t: "Equivalencia", d: "Cuánto debe cobrar la otra modalidad para empatar tu valor." },
];

export function LandingHero({ onStart, onExample }: { onStart: () => void; onExample: () => void }) {
  const strategy = getStrategy("pe");
  return (
    <section className="mx-auto max-w-5xl py-16 sm:py-24">
      <div className="animate-fade-up">
        <Eyebrow>No compares sueldos de portada</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
          Compara el <span className="text-accent">valor económico real</span> de tu trabajo.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          {strategy.copy.landingTagline}: el bruto engaña. RateEquity calcula tu liquidez real,
          beneficios, costo para la empresa, impuestos y tu valor por hora, para {strategy.meta.label}{" "}
          con tasas 2026.
        </p>
      </div>

      <div className="mt-8 grid animate-fade-up gap-4 [animation-delay:80ms] sm:grid-cols-3">
        {WHAT_IT_DOES.map((q) => (
          <Card key={q.n} className="p-5">
            <p className="font-mono text-sm font-semibold text-accent">{q.n}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-ink">{q.t}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{q.d}</p>
          </Card>
        ))}
      </div>

      <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:140ms]">
        <Button size="lg" onClick={onStart}>
          Usar la calculadora →
        </Button>
        <Button size="lg" variant="ghost" onClick={onExample}>
          Ver un ejemplo
        </Button>
      </div>

      <p className="mt-5 text-xs text-subtle">
        Cálculo transparente y auditable. Cifras referenciales, no asesoría tributaria. Tipo de
        cambio por open.er-api.com.
      </p>
    </section>
  );
}
