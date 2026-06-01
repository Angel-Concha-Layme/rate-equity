"use client";

import { useState } from "react";
import { Card, SegmentedControl, FlagSelect, MoneyInput, InfoDot, Eyebrow, Divider, Toggle, Modal } from "@/components/common";
import { toast } from "@/components/common/Toast";
import { HorarioField } from "@/components/app/HorarioField";
import {
  CATEGORIA_OPTIONS,
  MONEDA_OPTIONS,
  PAIS_OPTIONS,
  type ScenarioInput,
  type Categoria,
  type TipoCobro,
  type Moneda,
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

/**
 * Panel lateral del workspace: marca + controles del escenario. Ocupa toda la
 * altura del viewport en pantallas grandes (sticky) con padding externo
 * simétrico arriba y abajo, y mantiene min-w-0 para no desbordar el layout.
 */
export function Sidebar({
  input,
  patch,
  fx,
  seguroSugerido,
  onReabrirWizard,
  onReset,
}: {
  input: ScenarioInput;
  patch: (p: Partial<ScenarioInput>) => void;
  fx: FxState;
  seguroSugerido: number;
  onReabrirWizard: () => void;
  onReset: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [ajustesOpen, setAjustesOpen] = useState(false);
  const usaHora = input.tipoCobro === "hora";
  const esIndep = input.categoria === "independiente";
  const symbol = MONEDA_OPTIONS.find((m) => m.value === input.monedaCobro)?.symbol ?? "S/";
  const catLabel = CATEGORIA_OPTIONS.find((c) => c.value === input.categoria)?.label ?? "";
  const paisLabel = PAIS_OPTIONS.find((p) => p.value === input.pais)?.label ?? "Perú";
  const horasSemana = input.horario.reduce((a, b) => a + b, 0);
  const resumen = `${catLabel} · ${symbol} ${input.monto.toLocaleString("es-PE")} ${input.modo} · ${horasSemana} h/sem`;

  return (
    <aside className="min-w-0 lg:sticky lg:top-0 lg:h-screen lg:py-5">
      <Card className="flex h-full min-h-0 flex-col overflow-y-auto p-5">
        <div className="mb-5 flex items-baseline justify-between gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            Rate<span className="text-accent">Equity</span>
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-subtle">{paisLabel}</span>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Eyebrow>Tu situación</Eyebrow>
            <p className="mt-1 hidden text-xs text-subtle lg:block">Edita y todo se recalcula al instante.</p>
            <p className="mt-1 truncate text-xs text-muted lg:hidden">{resumen}</p>
          </div>
          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            aria-label={abierto ? "Ocultar campos" : "Editar campos"}
            className="shrink-0 text-xs font-semibold text-accent underline-offset-4 hover:underline lg:hidden"
          >
            {abierto ? "Ocultar" : "Editar"}
          </button>
        </div>

        <div className={cn("mt-5 flex-1 flex-col gap-4", abierto ? "flex" : "hidden lg:flex")}>
          <Ctrl
            label="Situación"
            info="5ta = planilla (dependiente, con grati/CTS/EsSalud). 4ta = honorarios (independiente, más líquido, sin beneficios)."
          >
            <SegmentedControl
              aria-label="Categoría"
              value={input.categoria}
              onChange={(v: Categoria) =>
                patch(v === "independiente" ? { categoria: v, modo: "bruto" } : { categoria: v })
              }
              options={CATEGORIA_OPTIONS.map((c) => ({ value: c.value, label: c.label.replace(/\s*\(.*?\)/, "") }))}
            />
          </Ctrl>

          <Ctrl label="¿Cómo cobras?">
            <SegmentedControl
              aria-label="Tipo de cobro"
              value={input.tipoCobro}
              onChange={(v: TipoCobro) => patch({ tipoCobro: v, monto: v === "hora" ? 50 : 4500 })}
              options={[
                { value: "mensual", label: "Mensual" },
                { value: "hora", label: "Por hora" },
              ]}
            />
          </Ctrl>

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Ctrl
                label={usaHora ? "Tarifa por hora" : "Monto mensual"}
                info={
                  input.monedaCobro === "PEN"
                    ? "Cobras en Soles, sin conversión."
                    : `Conviertes de ${input.monedaCobro} a Soles al tipo de cambio referencial S/ ${fx.rate.toFixed(2)}. Es indicativo.`
                }
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    {symbol}
                  </span>
                  <MoneyInput
                    className="pl-9"
                    value={input.monto}
                    onChange={(monto) => patch({ monto })}
                  />
                </div>
              </Ctrl>
            </div>
            <div className="min-w-0 flex-1">
              <Ctrl label="Moneda">
                <FlagSelect
                  aria-label="Moneda"
                  value={input.monedaCobro}
                  onChange={(v: Moneda) => patch({ monedaCobro: v })}
                  options={MONEDA_OPTIONS.map((m) => ({ value: m.value, label: m.value, flag: m.flag }))}
                />
              </Ctrl>
            </div>
          </div>

          <Ctrl
            label="Neto / bruto"
            info="Bruto = lo que figura en el contrato o recibo, antes de descuentos. Neto = lo que te llega a la cuenta. Por defecto usamos bruto."
          >
            <SegmentedControl
              aria-label="Neto o bruto"
              value={input.modo}
              onChange={(v) => patch({ modo: v })}
              options={[
                {
                  value: "neto",
                  label: "Neto",
                  disabled: esIndep,
                  hint: esIndep
                    ? "Un independiente factura en bruto; el impuesto se regulariza al final del año."
                    : undefined,
                },
                { value: "bruto", label: "Bruto" },
              ]}
            />
          </Ctrl>

          <Ctrl
            label="Horario"
            info="Tus horas reales definen tu valor por hora. Los días y horas laborables se calculan sobre el calendario del año en curso."
          >
            <HorarioField
              horario={input.horario}
              onChange={(h) => patch({ horario: h })}
            />
          </Ctrl>

          {input.categoria === "independiente" && (
            <Ctrl
              label="Feriados"
              info="Solo aplica a independientes (4ta): si lo activas, se descuentan los feriados nacionales de Perú de los días laborables del año. En planilla el sueldo es fijo y no se ve afectado."
            >
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5">
                <span className="text-[0.95rem] text-muted">Descontar feriados</span>
                <Toggle
                  checked={!!input.descontarFeriados}
                  onChange={(v) => {
                    patch({ descontarFeriados: v });
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
            </Ctrl>
          )}

          {input.categoria === "independiente" && (
            <Ctrl
              label="Seguro privado"
              info="Solo 4ta: a diferencia de planilla (EsSalud), el independiente costea su salud. Si lo activas, el costo se descuenta de tu liquidez y se valoriza como cobertura de salud."
            >
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5">
                <span className="text-[0.95rem] text-muted">Pago seguro privado</span>
                <Toggle
                  checked={!!input.seguroPrivado}
                  onChange={(v) =>
                    patch(
                      v
                        ? { seguroPrivado: true, seguroPrivadoMonto: seguroSugerido || input.seguroPrivadoMonto }
                        : { seguroPrivado: false },
                    )
                  }
                  label="Pago seguro privado"
                />
              </label>
              {input.seguroPrivado && (
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    S/
                  </span>
                  <MoneyInput
                    className="pl-9"
                    aria-label="Costo mensual del seguro privado en soles"
                    value={input.seguroPrivadoMonto ?? 0}
                    onChange={(seguroPrivadoMonto) => patch({ seguroPrivadoMonto })}
                  />
                </div>
              )}
            </Ctrl>
          )}

          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={() => setAjustesOpen(true)}
              aria-label="Abrir ajustes avanzados"
              className="mb-3 flex w-full items-center justify-between gap-2 rounded-input border border-line-strong bg-surface-2 px-3 py-2.5 text-left text-[0.95rem] text-muted transition hover:border-ring/60 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/25"
            >
              <span>Ajustes avanzados</span>
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="size-4 shrink-0 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <Divider className="mb-3" />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onReabrirWizard}
                className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
              >
                Rehacer wizard
              </button>
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Modal open={ajustesOpen} onClose={() => setAjustesOpen(false)} title="Ajustes avanzados">
        <Ctrl label="País">
          <FlagSelect
            aria-label="País"
            value={input.pais}
            onChange={(pais) => patch({ pais })}
            options={PAIS_OPTIONS.map((p) => ({
              value: p.value,
              label: p.label,
              flag: p.flag,
              disabled: p.disabled,
            }))}
          />
        </Ctrl>
        <p className="mt-3 text-xs text-subtle">Más países próximamente.</p>
      </Modal>
    </aside>
  );
}
