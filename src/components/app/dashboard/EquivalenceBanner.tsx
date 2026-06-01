import { Card, Eyebrow } from "@/components/common";
import { getStrategy, CURRENCY_OPTIONS, type Result, type ScenarioInput } from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

/** Main banner: summarizes the economic-value equivalence between modalities. */
export function EquivalenceBanner({
  yours,
  equivalent,
  input,
  fx,
  className,
}: {
  yours: Result;
  equivalent: Result;
  input: ScenarioInput;
  fx: FxState;
  className?: string;
}) {
  const strategy = getStrategy(input.country);
  const money = strategy.money;
  const yourMeta = strategy.modalities[yours.role];
  const equivMeta = strategy.modalities[equivalent.role];
  const localCurrency = strategy.meta.currency;
  const localLabel = CURRENCY_OPTIONS.find((m) => m.value === localCurrency)?.label ?? localCurrency;

  const averageRises = yours.monthlyAverage - yours.net > yours.net * 0.04;

  return (
    <Card className={cn("p-5", className)}>
      <Eyebrow>Equivalencia · valor económico real</Eyebrow>
      <p className="mt-2 text-xl leading-snug text-ink sm:text-2xl">
        {yourMeta.asPhrase}, tu ingreso bruto es{" "}
        <strong className="text-accent">{money(yours.gross)}</strong>/mes. Para igualar tu valor económico
        total, {equivMeta.subjectPhrase} necesita un ingreso bruto de{" "}
        <strong className="text-accent">{money(equivalent.gross)}</strong>/mes.
      </p>
      <p className="mt-2 text-muted">
        {averageRises ? (
          <>
            En un mes típico recibes <strong className="text-ink">{money(yours.net)}</strong>, pero tu{" "}
            <strong className="text-profit">promedio real es {money(yours.monthlyAverage)}</strong>{" "}
            {yourMeta.averageReason}.{" "}
          </>
        ) : (
          <>Tu ingreso es plano: el promedio ({money(yours.monthlyAverage)}) es casi tu mes típico.{" "}</>
        )}
        {equivalent.net > yours.net ? (
          <>
            Aunque {equivMeta.subjectPhrase} reciba más efectivo cada mes, su{" "}
            <strong className="text-ink">valor económico total es el mismo</strong> que el tuyo.
          </>
        ) : (
          <>
            Recibes más efectivo cada mes, pero {equivMeta.subjectPhrase} alcanza el{" "}
            <strong className="text-ink">mismo valor económico total</strong> {equivMeta.deferredValue}.
          </>
        )}
      </p>
      {input.billingCurrency !== localCurrency && (
        <p className="mt-2 text-xs text-subtle">
          Convertido de {input.billingCurrency} a {localLabel} al tipo de cambio referencial{" "}
          {fx.rate.toFixed(2)}
          {fx.date ? ` (${fx.date})` : ""}.
        </p>
      )}
    </Card>
  );
}
