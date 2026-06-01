import { Card, Eyebrow } from "@/components/common";
import { money } from "@/lib/sample";
import type { Resultado, ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

// Las etiquetas de UI ("Planilla"/"Independiente") no funcionan dentro de una
// oración: "Planilla" es una cosa (la hoja de pago), no una persona. En prosa
// se expanden a una frase nominal de verdad y en minúscula.

/** Inicio de oración: "Como independiente" / "En planilla". */
function comoFrase(cat: string): string {
  return cat === "independiente" ? "Como independiente" : "En planilla";
}

/** Sujeto dentro de la oración: "un independiente" / "alguien en planilla". */
function sujetoFrase(cat: string): string {
  return cat === "independiente" ? "un independiente" : "alguien en planilla";
}

/** Por qué el promedio real supera al líquido del mes típico (según categoría). */
function razonPromedio(cat: string): string {
  return cat === "independiente"
    ? "al sumar la devolución de impuestos que se regulariza al cierre del año"
    : "al sumar gratificaciones, CTS y EsSalud";
}

/** De dónde sale el valor que NO se ve como efectivo mensual (según categoría). */
function valorDiferido(cat: string): string {
  return cat === "independiente"
    ? "gracias a la devolución de impuestos que recibe al cierre del año"
    : "gracias a sus gratificaciones, CTS y EsSalud";
}

/** Banner principal: resume la equivalencia de valor económico entre modalidades. */
export function EquivalenceBanner({
  tuyo,
  equivalente,
  input,
  fx,
  className,
}: {
  tuyo: Resultado;
  equivalente: Resultado;
  input: ScenarioInput;
  fx: FxState;
  className?: string;
}) {
  const subePromedio = tuyo.promedioMensual - tuyo.liquido > tuyo.liquido * 0.04;

  return (
    <Card className={cn("p-5", className)}>
      <Eyebrow>Equivalencia · valor económico real</Eyebrow>
      <p className="mt-2 text-xl leading-snug text-ink sm:text-2xl">
        {comoFrase(tuyo.key)}, tu ingreso bruto es{" "}
        <strong className="text-accent">{money(tuyo.bruto)}</strong>/mes. Para igualar tu valor económico
        total, {sujetoFrase(equivalente.key)} necesita un ingreso bruto de{" "}
        <strong className="text-accent">{money(equivalente.bruto)}</strong>/mes.
      </p>
      <p className="mt-2 text-muted">
        {subePromedio ? (
          <>
            En un mes típico recibes <strong className="text-ink">{money(tuyo.liquido)}</strong>, pero tu{" "}
            <strong className="text-profit">promedio real es {money(tuyo.promedioMensual)}</strong>{" "}
            {razonPromedio(tuyo.key)}.{" "}
          </>
        ) : (
          <>Tu ingreso es plano: el promedio ({money(tuyo.promedioMensual)}) es casi tu mes típico.{" "}</>
        )}
        {equivalente.liquido > tuyo.liquido ? (
          <>
            Aunque {sujetoFrase(equivalente.key)} reciba más efectivo cada mes, su{" "}
            <strong className="text-ink">valor económico total es el mismo</strong> que el tuyo.
          </>
        ) : (
          <>
            Recibes más efectivo cada mes, pero {sujetoFrase(equivalente.key)} alcanza el{" "}
            <strong className="text-ink">mismo valor económico total</strong> {valorDiferido(equivalente.key)}.
          </>
        )}
      </p>
      {input.monedaCobro !== "PEN" && (
        <p className="mt-2 text-xs text-subtle">
          Convertido de {input.monedaCobro} a Soles al tipo de cambio referencial S/ {fx.rate.toFixed(2)}
          {fx.fecha ? ` (${fx.fecha})` : ""}.
        </p>
      )}
    </Card>
  );
}
