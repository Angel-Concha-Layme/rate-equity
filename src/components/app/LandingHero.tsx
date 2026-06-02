"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Eyebrow, ThemeToggle } from "@/components/common";
import { Wordmark } from "@/components/common/Wordmark";
import { useScenario } from "@/lib/useScenario";
import { BRAND } from "@/lib/brand";

const WHAT_IT_DOES = [
  { n: "01", t: "Liquidez real", d: "Lo que de verdad te queda al mes, después de impuestos y aportes." },
  { n: "02", t: "Valor total", d: "Sueldo, bonos y beneficios anualizados a su valor real." },
  { n: "03", t: "Equivalencia", d: "Cuánto debe cobrar la otra modalidad para empatar tu valor." },
];

export function LandingHero() {
  const router = useRouter();
  const { input, loaded, reset } = useScenario();
  // Quien ya hizo una comparación (guardada en localStorage) vuelve a ver el
  // home: lo reconocemos y le ofrecemos retomar, en vez de tratarlo como nuevo.
  const hasSaved = loaded && input.wizardDone;

  return (
    <section className="mx-auto max-w-5xl py-10 sm:py-14">
      <header className="flex items-center justify-between gap-3">
        <Wordmark size="md" />
        <ThemeToggle />
      </header>

      <div className="mt-14 animate-fade-up sm:mt-20">
        <Eyebrow>No compares sueldos de portada</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
          Compara el <span className="text-accent">valor económico real</span> de tu trabajo.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Seas empleado o independiente, el bruto engaña. {BRAND.name} calcula tu liquidez real,
          beneficios, costo para la empresa, impuestos y tu valor por hora, con las reglas
          tributarias del país que elijas.
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

      <div className="mt-9 animate-fade-up [animation-delay:140ms]">
        {hasSaved ? (
          <>
            <p className="mb-3 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-3 py-1 font-mono text-[0.66rem] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-profit" />
              Bienvenido de vuelta. Tienes una comparación guardada.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => router.push("/comparison")}>
                Volver a tu comparación →
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  reset();
                  router.push("/comparison");
                }}
              >
                Empezar de nuevo
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => router.push("/comparison")}>
              Usar la calculadora →
            </Button>
            <Button size="lg" variant="ghost" onClick={() => router.push("/comparison?ejemplo=1")}>
              Ver un ejemplo
            </Button>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-subtle">
        Cálculo transparente y auditable. Cifras referenciales, no asesoría tributaria. Tipo de
        cambio por open.er-api.com.
      </p>
    </section>
  );
}
