import { Card } from "@/components/common";
import { RadarChart } from "@/components/lab/Charts";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import type { Resultado } from "@/lib/calc";
import { cn } from "@/lib/cn";

/** Panel con el radar comparativo por atributo. */
export function RadarPanel({ modalidades, className }: { modalidades: Resultado[]; className?: string }) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <PanelHeader titulo="Perfil por atributo" tipo="Radar" />
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <RadarChart modalidades={modalidades} />
      </div>
    </Card>
  );
}
