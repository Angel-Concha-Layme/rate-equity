import { Eyebrow, Pill } from "@/components/common";

/** Standard panel header: title (eyebrow) + type label (pill). */
export function PanelHeader({ title, type }: { title: string; type: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <Eyebrow>{title}</Eyebrow>
      <Pill>{type}</Pill>
    </div>
  );
}
