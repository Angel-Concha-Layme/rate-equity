"use client";

import Link from "next/link";
import { textureStyle } from "@/components/lab/Texture";
import { MODALITY_VARIANTS, EQUIV_VARIANTS } from "@/components/lab/ledger-variants";

function VariantFrame({
  id,
  name,
  note,
  children,
}: {
  id: string;
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs tabular-nums text-accent">{id}</span>
        <h3 className="font-display text-lg font-semibold text-ink">{name}</h3>
      </div>
      <p className="min-h-10 text-sm text-muted">{note}</p>
      {children}
    </div>
  );
}

export default function LedgerPage() {
  return (
    <div data-theme="ledger" style={textureStyle("ledger")} className="min-h-screen bg-canvas font-sans text-ink selection:bg-accent/25">
      <header className="sticky top-0 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Rate<span className="text-accent">Equity</span>
            <span className="ml-2 text-xs font-normal text-subtle">variantes · El Libro Mayor</span>
          </span>
          <Link href="/a3f9c2" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
            ← volver al laboratorio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-28 pt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">El Libro Mayor</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Elige el diseño de tarjeta
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Varias propuestas, todas alineadas con el estilo editorial-contable. Cada
          una tiene nombre. Dime cuál te gusta (o combina ideas) y la aplico al tema.
        </p>

        {/* --------------------------- Modality --------------------------- */}
        <section className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-strong pb-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tarjeta de modalidad
            </h2>
            <p className="text-sm text-muted">
              Ejemplo: <span className="text-ink">Freelance</span> · haz clic para ver el estado seleccionado
            </p>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {MODALITY_VARIANTS.map((v) => (
              <VariantFrame key={v.id} id={v.id} name={v.name} note={v.note}>
                <v.Comp />
              </VariantFrame>
            ))}
          </div>
        </section>

        {/* ------------------------- Equivalence ------------------------- */}
        <section className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-strong pb-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tarjeta de equivalencia
            </h2>
            <p className="text-sm text-muted">bruto de portada → líquido real</p>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-10 lg:grid-cols-2">
            {EQUIV_VARIANTS.map((v) => (
              <VariantFrame key={v.id} id={v.id} name={v.name} note={v.note}>
                <v.Comp />
              </VariantFrame>
            ))}
          </div>
        </section>

        <p className="mt-20 border-t border-line pt-6 text-sm text-muted">
          ¿Te gusta una mezcla? Por ejemplo «modalidad <span className="text-ink">V2 Margen</span> +
          equivalencia <span className="text-ink">E3 Titular</span>». Dímelo y lo dejo aplicado en el tema.
        </p>
      </main>
    </div>
  );
}
