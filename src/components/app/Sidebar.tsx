"use client";

import { useState } from "react";
import { Card, SegmentedControl, FlagSelect, MoneyInput, InfoDot, Eyebrow, Divider, Toggle, ThemeToggle, Modal } from "@/components/common";
import { Wordmark } from "@/components/common/Wordmark";
import { toast } from "@/components/common/Toast";
import { ScheduleField } from "@/components/app/ScheduleField";
import { ExpensesField } from "@/components/app/ExpensesField";
import { CollapsedSidebar, SidebarToggle, type SidebarSection, type SidebarAction } from "@/components/app/SidebarRail";
import { defaultExpenses } from "@/lib/expenses";
import {
  getStrategy,
  CURRENCY_OPTIONS,
  COUNTRY_OPTIONS,
  type ScenarioInput,
  type Role,
  type BillingType,
  type CurrencyCode,
} from "@/lib/calc";
import type { FxState } from "@/lib/useFxRate";
import { cn } from "@/lib/cn";

function Ctrl({ label, info, children }: { label: string; info?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 text-xs font-medium text-muted">
        {label}
        {info && <InfoDot content={info} />}
      </span>
      {children}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d={dir === "right" ? "M8 5l5 5-5 5" : "M12 5l-5 5 5 5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Workspace side panel: brand + scenario controls. Spans the full viewport
 * height on large screens (sticky) with symmetric outer padding top and bottom,
 * and keeps min-w-0 so it does not overflow the layout. When collapsed on
 * desktop it delegates to CollapsedSidebar (an icon rail with per-control popovers).
 */
export function Sidebar({
  input,
  patch,
  fx,
  collapsed = false,
  onToggleCollapse,
  onReopenWizard,
  onReset,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  fx: FxState;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onReopenWizard: () => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const strategy = getStrategy(input.country);
  const usesHourly = input.billingType === "hourly";
  const isInformal = input.category === "informal";
  const symbol = CURRENCY_OPTIONS.find((m) => m.value === input.billingCurrency)?.symbol ?? "S/";
  const localSymbol = CURRENCY_OPTIONS.find((m) => m.value === strategy.meta.currency)?.symbol ?? "S/";
  const categoryLabel = strategy.modalities[input.category].name;
  const countryLabel = strategy.meta.label;
  const weekHours = input.schedule.reduce((a, b) => a + b, 0);
  const modeLabel = input.mode === "net" ? "neto" : "bruto";
  const summary = `${categoryLabel} · ${symbol} ${input.amount.toLocaleString("es-PE")} ${modeLabel} · ${weekHours} h/sem`;

  const sections: SidebarSection[] = [
    {
      id: "situacion",
      label: "Situación",
      info: strategy.copy.situationInfo,
      icon: "briefcase",
      node: (
        <SegmentedControl
          aria-label="Categoría"
          value={input.category}
          onChange={(v: Role) => patch(v === "informal" ? { category: v, mode: "gross" } : { category: v })}
          options={[strategy.modalities.formal, strategy.modalities.informal].map((m) => ({
            value: m.role,
            label: m.name,
          }))}
        />
      ),
    },
    {
      id: "cobro",
      label: "¿Cómo cobras?",
      icon: "tag",
      node: (
        <SegmentedControl
          aria-label="Tipo de cobro"
          value={input.billingType}
          onChange={(v: BillingType) => patch({ billingType: v, amount: v === "hourly" ? 50 : 4500 })}
          options={[
            { value: "monthly", label: "Mensual" },
            { value: "hourly", label: "Por hora" },
          ]}
        />
      ),
    },
    {
      id: "monto",
      label: usesHourly ? "Tarifa y moneda" : "Monto y moneda",
      info:
        input.billingCurrency === "PEN"
          ? "Cobras en Soles, sin conversión."
          : `Conviertes de ${input.billingCurrency} a Soles al tipo de cambio referencial S/ ${fx.rate.toFixed(2)}. Es indicativo.`,
      icon: "coin",
      node: (
        <div className="flex items-start gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              {symbol}
            </span>
            <MoneyInput className="pl-9" value={input.amount} onChange={(amount) => patch({ amount })} />
          </div>
          <div className="min-w-0 flex-1">
            <FlagSelect
              aria-label="Moneda"
              value={input.billingCurrency}
              onChange={(v: CurrencyCode) => patch({ billingCurrency: v })}
              options={CURRENCY_OPTIONS.map((m) => ({ value: m.value, label: m.value, flag: m.flag }))}
            />
          </div>
        </div>
      ),
    },
    {
      id: "modo",
      label: "Neto / bruto",
      info: "Bruto = lo que figura en el contrato o recibo, antes de descuentos. Neto = lo que te llega a la cuenta. Por defecto usamos bruto.",
      icon: "swap",
      node: (
        <SegmentedControl
          aria-label="Neto o bruto"
          value={input.mode}
          onChange={(v) => patch({ mode: v })}
          options={[
            {
              value: "net",
              label: "Neto",
              disabled: isInformal,
              hint: isInformal
                ? "Un independiente factura en bruto; el impuesto se regulariza al final del año."
                : undefined,
            },
            { value: "gross", label: "Bruto" },
          ]}
        />
      ),
    },
    {
      id: "horario",
      label: "Horario",
      info: "Tus horas reales definen tu valor por hora. Los días y horas laborables se calculan sobre el calendario del año en curso.",
      icon: "clock",
      node: <ScheduleField schedule={input.schedule} onChange={(h) => patch({ schedule: h })} />,
    },
    ...(isInformal
      ? [
          {
            id: "feriados",
            label: "Feriados",
            info: strategy.copy.holidaysInfo,
            icon: "calendar" as const,
            node: (
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5">
                <span className="text-[0.95rem] text-muted">Descontar feriados</span>
                <Toggle
                  checked={!!input.deductHolidays}
                  onChange={(v) => {
                    patch({ deductHolidays: v });
                    toast(
                      v
                        ? "Feriados descontados: la comparación se recalcula sobre menos horas facturadas este año."
                        : "Feriados incluidos: comparación sobre el año completo.",
                      { tone: "info" },
                    );
                  }}
                  label="Descontar feriados"
                />
              </label>
            ),
          },
        ]
      : []),
    {
      id: "gastos",
      label: "Gastos mensuales",
      info: `Tus gastos fijos del mes en moneda local (${localSymbol}). Reducen tu liquidez disponible; el valor económico total no cambia.`,
      icon: "wallet",
      node: (
        <>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5">
            <span className="text-[0.95rem] text-muted">Incluir mis gastos</span>
            <Toggle
              checked={!!input.expensesOn}
              onChange={(v) => patch({ expensesOn: v })}
              label="Incluir gastos mensuales"
            />
          </label>
          {input.expensesOn && (
            <div className="mt-2">
              <ExpensesField
                expenses={input.expenses ?? defaultExpenses()}
                onChange={(expenses) => patch({ expenses })}
                currencySymbol={localSymbol}
              />
            </div>
          )}
        </>
      ),
    },
  ];

  const actions: SidebarAction[] = [
    { id: "ajustes", label: "Ajustes avanzados", icon: "sliders", onClick: () => setSettingsOpen(true) },
    { id: "wizard", label: "Rehacer wizard", icon: "wand", accent: true, onClick: onReopenWizard },
    { id: "reset", label: "Restablecer", icon: "reset", onClick: onReset },
  ];

  const renderControls = () => (
    <>
      {sections.map((s) => (
        <Ctrl key={s.id} label={s.label} info={s.info}>
          {s.node}
        </Ctrl>
      ))}

      <div className="mt-auto pt-3">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Abrir ajustes avanzados"
          className="mb-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-left text-[0.95rem] text-muted transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
        >
          <span>Ajustes avanzados</span>
          <Chevron dir="right" />
        </button>
        <Divider className="mb-3" />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReopenWizard}
            className="cursor-pointer text-xs font-semibold text-accent underline-offset-4 hover:underline"
          >
            Rehacer wizard
          </button>
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Restablecer
          </button>
        </div>
      </div>
    </>
  );

  return (
    <aside className="min-w-0 lg:sticky lg:top-0 lg:h-screen lg:py-5">
      {collapsed && (
        <CollapsedSidebar sections={sections} actions={actions} onExpand={() => onToggleCollapse?.()} />
      )}

      {!collapsed && <SidebarToggle dir="left" label="Colapsar panel" onClick={onToggleCollapse} />}

      <Card className={cn("flex h-full min-h-0 flex-col overflow-y-auto p-5", collapsed && "lg:hidden")}>
        <div className="mb-5 flex items-center justify-between gap-2">
          <Wordmark size="sm" />
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-subtle">{countryLabel}</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Eyebrow>Tu situación</Eyebrow>
            <p className="mt-1 hidden text-xs text-subtle lg:block">Edita y todo se recalcula al instante.</p>
            <p className="mt-1 truncate text-xs text-muted lg:hidden">{summary}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((a) => !a)}
            aria-expanded={open}
            aria-label={open ? "Ocultar campos" : "Editar campos"}
            className="shrink-0 cursor-pointer text-xs font-semibold text-accent underline-offset-4 hover:underline lg:hidden"
          >
            {open ? "Ocultar" : "Editar"}
          </button>
        </div>

        <div className={cn("mt-5 min-h-0 flex-1 flex-col gap-4", open ? "flex" : "hidden lg:flex")}>
          {renderControls()}
        </div>
      </Card>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Ajustes avanzados">
        <div className="flex flex-col gap-4">
          <Ctrl label="País">
            <FlagSelect
              aria-label="País"
              value={input.country}
              onChange={(country) => patch({ country })}
              options={COUNTRY_OPTIONS.map((p) => ({
                value: p.value,
                label: p.label,
                flag: p.flag,
                disabled: p.disabled,
              }))}
            />
            <p className="mt-1.5 text-xs text-subtle">Más países próximamente.</p>
          </Ctrl>

          <Ctrl
            label="Base de comparación"
            info="Valor total: el equivalente iguala tu valor económico total (recomendado). Bruto: iguala el sueldo bruto de la planilla con el valor total del independiente; el valor total de la planilla queda por encima, por sus gratificaciones, CTS y EsSalud."
          >
            <SegmentedControl
              aria-label="Base de comparación"
              value={input.compareBasis ?? "valor"}
              onChange={(v) => patch({ compareBasis: v })}
              options={[
                { value: "valor", label: "Valor total" },
                { value: "bruto", label: "Bruto" },
              ]}
            />
          </Ctrl>
        </div>
      </Modal>
    </aside>
  );
}
