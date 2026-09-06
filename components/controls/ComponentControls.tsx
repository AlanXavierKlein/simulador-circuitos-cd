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
  sliderMin: number;
  sliderMax: number;
  step: number;
  unit: string;
  value: number;
  kind: string;
};

const MAX_RESISTANCE_OHMS = 1000;
const MAX_VOLTAGE_VOLTS = 1000;
const MAX_SLIDER_VALUE = 500;

function controlRange(component: Component): ControlRange {
  if (component.type === "resistor") {
    return {
      min: 0.1,
      max: MAX_RESISTANCE_OHMS,
      sliderMin: 0.1,
      sliderMax: MAX_SLIDER_VALUE,
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
      sliderMin: -MAX_SLIDER_VALUE,
      sliderMax: MAX_SLIDER_VALUE,
      step: 0.1,
      unit,
      value,
      kind: "Fuente de tensión",
    };
  }

  const currentSourceLimit = Math.max(30, Math.ceil(Math.abs(value) * 2));
  return {
    min: -currentSourceLimit,
    max: currentSourceLimit,
    sliderMin: -Math.min(MAX_SLIDER_VALUE, currentSourceLimit),
    sliderMax: Math.min(MAX_SLIDER_VALUE, currentSourceLimit),
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

function componentOrder(left: Component, right: Component): number {
  const typePriority = {
    resistor: 0,
    voltageSource: 1,
    currentSource: 2,
  } as const;
  const priorityDifference = typePriority[left.type] - typePriority[right.type];

  return priorityDifference !== 0
    ? priorityDifference
    : left.label.localeCompare(right.label, "es", {
        numeric: true,
        sensitivity: "base",
      });
}

export function ComponentControls({
  circuit,
  onValueChange,
  onReset,
  compact = false,
}: ComponentControlsProps) {
  const orderedComponents = [...circuit.components].sort(componentOrder);

  return (
    <aside
      className={`app-surface min-w-0 max-w-full p-5 ${
        compact
          ? ""
          : "xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
      }`}
    >
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="app-icon size-10">
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
            className="app-button-secondary inline-flex h-10 w-fit items-center justify-center gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
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
        {orderedComponents.map((component) => {
          const range = controlRange(component);
          const inputId = `component-${component.label}`;
          const sliderValue = Math.min(
            range.sliderMax,
            Math.max(range.sliderMin, range.value),
          );
          const updateValue = (value: number) => {
            if (!Number.isFinite(value)) return;
            const limitedValue = Math.min(
              range.max,
              Math.max(range.min, value),
            );
            onValueChange(component.label, Number(limitedValue.toFixed(3)));
          };

          return (
            <div key={component.label} className="app-surface-inset p-3.5">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <label
                    htmlFor={inputId}
                    className="font-mono text-sm font-semibold text-cyan-100"
                  >
                    {component.label}
                  </label>
                  <p className="mt-0.5 text-[11px] text-slate-400">
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
                min={range.sliderMin}
                max={range.sliderMax}
                step={range.step}
                value={sliderValue}
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
                  className="app-input h-9 min-w-0 flex-1 px-2.5 font-mono text-sm"
                />
                <span className="w-5 font-mono text-xs text-slate-400">
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
