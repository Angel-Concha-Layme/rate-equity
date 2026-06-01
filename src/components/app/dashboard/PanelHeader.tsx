import { Eyebrow, Pill } from "@/components/common";

/** Cabecera estándar de un panel: título (eyebrow) + etiqueta de tipo (pill). */
export function PanelHeader({ titulo, tipo }: { titulo: string; tipo: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <Eyebrow>{titulo}</Eyebrow>
      <Pill>{tipo}</Pill>
    </div>
  );
}
