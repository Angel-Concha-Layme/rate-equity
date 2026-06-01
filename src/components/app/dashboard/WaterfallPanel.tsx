import { Card } from "@/components/common";
import { WaterfallChart } from "@/components/lab/Charts";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import type { Resultado } from "@/lib/calc";
import { cn } from "@/lib/cn";

/** Panel con el desglose en cascada (waterfall) de una modalidad. */
export function WaterfallPanel({ res, className }: { res: Resultado; className?: string }) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <PanelHeader titulo={`Del bruto al valor total · ${res.nombre}`} tipo="Waterfall" />
      {/* relative + svg absoluto: el chart llena la altura de la fila (que define
          el ModalityCard) sin aportar altura propia al cálculo del layout. */}
      <div className="relative min-h-0 flex-1">
        <WaterfallChart steps={res.breakdown} className="absolute inset-0 h-full w-full" />
      </div>
    </Card>
  );
}
