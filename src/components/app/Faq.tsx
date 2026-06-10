import { Card, Eyebrow } from "@/components/common";

/** Single source for the FAQ: feeds both the visible accordion and FAQPage JSON-LD. */
const FAQS = [
  {
    q: "¿Por qué el sueldo bruto no dice cuánto ganas de verdad?",
    a: "El bruto es solo el titular. Tu valor real depende de impuestos, aportes, beneficios y de cuántas horas trabajas. RateEquity calcula lo que de verdad te queda y lo que vale tu trabajo, más allá del número de portada.",
  },
  {
    q: "¿Qué es el valor económico total?",
    a: "Es tu líquido del mes más los beneficios valorizados (bonos, fondo de pensión, seguro de salud) según las reglas de tu país. Es la forma justa de comparar dos modalidades que parecen distintas.",
  },
  {
    q: "¿Cómo se compara estar en planilla con ser independiente?",
    a: "RateEquity busca el ingreso de la otra modalidad que iguala tu valor económico total y te muestra dónde está la diferencia: liquidez mensual, beneficios, costo para la empresa y valor por hora.",
  },
  {
    q: "¿Cuánto cuesta usar RateEquity?",
    a: "Es gratis y no requiere registro. Eliges tu país, ingresas tu monto y ves la comparación al instante.",
  },
  {
    q: "¿Los resultados son asesoría tributaria?",
    a: "No. Son cifras referenciales con fines informativos, calculadas con tasas vigentes. Para decisiones formales consulta a un contador o asesor.",
  },
];

export function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl py-16 sm:py-20">
      <Eyebrow>Preguntas frecuentes</Eyebrow>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Lo que la gente pregunta
      </h2>
      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((f) => (
          <Card as="details" key={f.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="shrink-0 text-2xl font-normal leading-none text-subtle transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
          </Card>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
