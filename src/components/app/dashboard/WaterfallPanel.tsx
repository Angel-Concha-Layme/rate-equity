import { Card } from "@/components/common";
import { WaterfallChart } from "@/components/app/dashboard/Charts";
import { PanelHeader } from "@/components/app/dashboard/PanelHeader";
import type { Result } from "@/lib/calc";
import type { MoneyFn } from "@/lib/sample";
import { cn } from "@/lib/cn";

/** Panel with the waterfall breakdown of a modality. */
export function WaterfallPanel({
  res,
  money,
  className,
}: {
  res: Result;
  money: MoneyFn;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <PanelHeader title={`Del bruto al valor total · ${res.name}`} type="Waterfall" />
      {/* The chart takes only the horizontal space it needs (so labels don't
          overlap), centered within the card. */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <WaterfallChart steps={res.breakdown} money={money} />
      </div>
    </Card>
  );
}
