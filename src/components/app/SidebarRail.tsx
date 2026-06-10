"use client";

import { useEffect, useState } from "react";
import { Card, ThemeToggle, Divider, Tooltip } from "@/components/common";
import { BrandMark } from "@/components/common/BrandMark";
import { cn } from "@/lib/cn";

type IconName =
  | "chevron"
  | "briefcase"
  | "tag"
  | "coin"
  | "swap"
  | "clock"
  | "calendar"
  | "wallet"
  | "sliders"
  | "wand"
  | "reset";

const ICON_PATHS: Record<IconName, string> = {
  chevron: "M8 5l5 5-5 5",
  briefcase: "M3 7h14v9H3z M7 7V5.5A1.5 1.5 0 018.5 4h3A1.5 1.5 0 0113 5.5V7 M3 11h14",
  tag: "M4 4h6l6 6-6 6-6-6V4z M7 7h.01",
  coin: "M10 4a6 6 0 100 12 6 6 0 000-12z M8 8.5h3.2 M8.8 11.5H12 M10 6.8v6.4",
  swap: "M7 4v12 M4.5 13.5L7 16l2.5-2.5 M13 16V4 M10.5 6.5L13 4l2.5 2.5",
  clock: "M10 4a6 6 0 100 12 6 6 0 000-12z M10 6.5V10l2.5 1.7",
  calendar: "M4 5h12v11H4z M4 8.5h12 M7 3v3 M13 3v3",
  wallet: "M3 6.5h12a1 1 0 011 1v6a1 1 0 01-1 1H3z M3 6.5l9-2v2 M13.5 10.5h.01",
  sliders: "M4 6h5 M12 6h4 M4 13h2 M9 13h7 M10.5 6a1.5 1.5 0 100-3 M7.5 13a1.5 1.5 0 100 3",
  wand: "M13 3l1.1 2.4 2.4 1.1-2.4 1.1L13 10l-1.1-2.4L9.5 6.5l2.4-1.1z M4 16l5-5",
  reset: "M15.5 10a5.5 5.5 0 11-1.6-3.9 M15.5 3.5v3h-3",
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn("size-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name].split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}

/**
 * Edge handle that toggles the sidebar: vertically centered, straddling the
 * panel's right border. Shared by the collapsed rail (expand) and the expanded
 * panel (collapse) so it keeps the same position in both states. Desktop only.
 */
export function SidebarToggle({
  dir,
  label,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip
      content={label}
      className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 lg:block"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="grid size-7 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface text-muted shadow-card transition hover:border-ring/60 hover:text-ink focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
      >
        <Icon name="chevron" className={dir === "left" ? "rotate-180" : undefined} />
      </button>
    </Tooltip>
  );
}

export interface SidebarSection {
  id: string;
  label: string;
  info?: string;
  icon: Exclude<IconName, "chevron">;
  node: React.ReactNode;
}

export interface SidebarAction {
  id: string;
  label: string;
  icon: IconName;
  onClick: () => void;
  accent?: boolean;
}

/** Closes the active popover on outside click or Escape. */
function useDismiss(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest("[data-sidebar-layer]")) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [active, onClose]);
}

const RAIL_BTN =
  "grid size-8 cursor-pointer place-items-center rounded-input border bg-surface-2 transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25";

function RailButton({
  icon,
  label,
  active,
  accent,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  accent?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          RAIL_BTN,
          active ? "border-ring text-ink" : accent ? "border-line-strong text-accent" : "border-line-strong text-muted",
        )}
      >
        <Icon name={icon} />
      </button>
    </Tooltip>
  );
}

/**
 * Collapsed sidebar (desktop): a slim icon rail topped by the platform mark.
 * Clicking a section opens just that control in a popover anchored to the icon;
 * the edge handle (vertically centered, straddling the right border) restores
 * the full inline panel.
 */
export function CollapsedSidebar({
  sections,
  actions,
  onExpand,
}: {
  sections: SidebarSection[];
  actions: SidebarAction[];
  onExpand: () => void;
}) {
  const [popover, setPopover] = useState<{ id: string; top: number } | null>(null);
  useDismiss(!!popover, () => setPopover(null));

  const popoverSection = sections.find((s) => s.id === popover?.id) ?? null;
  const togglePopover = (id: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const top = e.currentTarget.offsetTop;
    setPopover((cur) => (cur?.id === id ? null : { id, top }));
  };

  return (
    <div data-sidebar-layer className="relative hidden h-full lg:block">
      <Card className="flex h-full min-h-0 w-full flex-col items-center gap-2 p-2.5">
        <BrandMark />
        <Divider className="w-6" />
        {sections.map((s) => (
          <RailButton
            key={s.id}
            icon={s.icon}
            label={s.label}
            active={popover?.id === s.id}
            onClick={togglePopover(s.id)}
          />
        ))}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2">
          {actions.map((a) => (
            <RailButton key={a.id} icon={a.icon} label={a.label} accent={a.accent} onClick={a.onClick} />
          ))}
          <ThemeToggle />
        </div>
      </Card>

      <SidebarToggle dir="right" label="Expandir panel" onClick={onExpand} />

      {popoverSection && (
        <div data-sidebar-layer className="absolute left-full z-30 ml-2 w-72" style={{ top: popover?.top }}>
          <Card className="animate-scale-in origin-top-left p-4 shadow-pop">
            <p className="mb-2 text-xs font-medium text-muted">{popoverSection.label}</p>
            {popoverSection.node}
          </Card>
        </div>
      )}
    </div>
  );
}
