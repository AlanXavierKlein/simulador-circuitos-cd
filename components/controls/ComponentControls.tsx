"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";

import type { Circuit, Component } from "@/lib/engine/model";

type ComponentControlsProps = {
  circuit: Circuit;
  onValueChange: (label: string, value: number) => void;
  onReset?: () => void;
  compact?: boolean;
};

type ControlRange = {
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
  kind: string;
};

const MAX_RESISTANCE_OHMS = 1000;
const MAX_VOLTAGE_VOLTS = 1000;

function controlRange(component: Component): ControlRange {
  if (component.type === "resistor") {
    return {
      min: 0.1,
      max: MAX_RESISTANCE_OHMS,
      step: 0.1,
      unit: "Ω",
      value: component.ohms,
      kind: "Resistencia",
    };
  }

  const value =
    component.type === "voltageSource" ? component.volts : component.amps;
  const unit = component.type === "voltageSource" ? "V" : "A";
  if (component.type === "voltageSource") {
    return {
      min: -MAX_VOLTAGE_VOLTS,
      max: MAX_VOLTAGE_VOLTS,
      step: 0.1,
      unit,
      value,
      kind: "Fuente de tensión",
    };
  }

  return {
    min: -Math.max(30, Math.ceil(Math.abs(value) * 2)),
    max: Math.max(30, Math.ceil(Math.abs(value) * 2)),
    step: 0.1,
    unit,
    value,
    kind: "Fuente de corriente",
  };
}

function formatValue(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 3,
  }).format(value);
}

export function ComponentControls({
  circuit,
  onValueChange,
  onReset,
  compact = false,
}: ComponentControlsProps) {
  return (
    <aside
      className={`min-w-0 max-w-full rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 ${
        compact
          ? ""
          : "xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
      }`}
    >
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <SlidersHorizontal className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-100">Parámetros</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Cambiá un valor: el circuito se resuelve al instante.
            </p>
          </div>
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <RotateCcw className="size-4" />
            Restablecer valores
          </button>
        ) : null}
      </div>

      <div
        className={
          compact ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "space-y-3"
        }
      >
        {circuit.components.map((component) => {
          const range = controlRange(component);
          const inputId = `component-${component.label}`;
          const updateValue = (value: number) => {
            if (!Number.isFinite(value)) return;
            const limitedValue = Math.min(
              range.max,
              Math.max(range.min, value),
            );
            onValueChange(component.label, limitedValue);
          };

          return (
            <div
              key={component.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/65 p-3.5"
            >
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <label
                    htmlFor={inputId}
                    className="font-mono text-sm font-semibold text-cyan-100"
                  >
                    {component.label}
                  </label>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {range.kind}
                  </p>
                </div>
                <span className="font-mono text-sm text-cyan-300">
                  {formatValue(range.value)} {range.unit}
                </span>
              </div>

              <input
                suppressHydrationWarning
                aria-label={`Control deslizante de ${component.label}`}
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={range.value}
                onChange={(event) =>
                  updateValue(Number(event.currentTarget.value))
                }
                className="h-8 w-full cursor-pointer accent-cyan-400"
              />

              <div className="mt-3 flex items-center gap-2">
                <input
                  suppressHydrationWarning
                  id={inputId}
                  aria-label={`Valor de ${component.label}`}
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={range.value}
                  onChange={(event) => {
                    if (event.currentTarget.value === "") return;
                    updateValue(Number(event.currentTarget.value));
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                />
                <span className="w-5 font-mono text-xs text-slate-500">
                  {range.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
