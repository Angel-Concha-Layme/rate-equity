import { Card, Eyebrow } from "@/components/common";
import { getStrategy, MONEDA_OPTIONS, type Resultado, type ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

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
  const strat = getStrategy(input.pais);
  const money = strat.money;
  const tuya = strat.modalidades[tuyo.rol];
  const equiv = strat.modalidades[equivalente.rol];
  const localCurrency = strat.meta.currency;
  const localLabel = MONEDA_OPTIONS.find((m) => m.value === localCurrency)?.label ?? localCurrency;

  const subePromedio = tuyo.promedioMensual - tuyo.liquido > tuyo.liquido * 0.04;

  return (
    <Card className={cn("p-5", className)}>
      <Eyebrow>Equivalencia · valor económico real</Eyebrow>
      <p className="mt-2 text-xl leading-snug text-ink sm:text-2xl">
        {tuya.comoFrase}, tu ingreso bruto es{" "}
        <strong className="text-accent">{money(tuyo.bruto)}</strong>/mes. Para igualar tu valor económico
        total, {equiv.sujetoFrase} necesita un ingreso bruto de{" "}
        <strong className="text-accent">{money(equivalente.bruto)}</strong>/mes.
      </p>
      <p className="mt-2 text-muted">
        {subePromedio ? (
          <>
            En un mes típico recibes <strong className="text-ink">{money(tuyo.liquido)}</strong>, pero tu{" "}
            <strong className="text-profit">promedio real es {money(tuyo.promedioMensual)}</strong>{" "}
            {tuya.razonPromedio}.{" "}
          </>
        ) : (
          <>Tu ingreso es plano: el promedio ({money(tuyo.promedioMensual)}) es casi tu mes típico.{" "}</>
        )}
        {equivalente.liquido > tuyo.liquido ? (
          <>
            Aunque {equiv.sujetoFrase} reciba más efectivo cada mes, su{" "}
            <strong className="text-ink">valor económico total es el mismo</strong> que el tuyo.
          </>
        ) : (
          <>
            Recibes más efectivo cada mes, pero {equiv.sujetoFrase} alcanza el{" "}
            <strong className="text-ink">mismo valor económico total</strong> {equiv.valorDiferido}.
          </>
        )}
      </p>
      {input.monedaCobro !== localCurrency && (
        <p className="mt-2 text-xs text-subtle">
          Convertido de {input.monedaCobro} a {localLabel} al tipo de cambio referencial{" "}
          {fx.rate.toFixed(2)}
          {fx.fecha ? ` (${fx.fecha})` : ""}.
        </p>
      )}
    </Card>
  );
}
