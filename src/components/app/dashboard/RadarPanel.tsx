import { Card } from "@/components/common";
import { RadarChart } from "@/components/app/dashboard/Charts";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import type { Result } from "@/lib/calc";
import type { MoneyFn } from "@/lib/sample";
import { cn } from "@/lib/cn";

/** Panel with the per-attribute comparison radar. */
export function RadarPanel({
  modalities,
  money,
  className,
}: {
  modalities: Result[];
  money: MoneyFn;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <PanelHeader title="Perfil por atributo" type="Radar" />
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <RadarChart modalities={modalities} money={money} />
      </div>
    </Card>
  );
}
