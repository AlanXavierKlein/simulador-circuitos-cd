"use client";

import { SlidersHorizontal } from "lucide-react";

import type { Circuit, Component } from "@/lib/engine/model";

type ComponentControlsProps = {
  circuit: Circuit;
  onValueChange: (label: string, value: number) => void;
};

type ControlRange = {
  min: number;
  max: number;
  step: number;
  unit: string;
  value: number;
  kind: string;
};

function controlRange(component: Component): ControlRange {
  if (component.type === "resistor") {
    return {
      min: 0.1,
      max: Math.max(100, Math.ceil(component.ohms * 2)),
      step: 0.1,
      unit: "Ω",
      value: component.ohms,
      kind: "Resistencia",
    };
  }

  const value =
    component.type === "voltageSource" ? component.volts : component.amps;
  const unit = component.type === "voltageSource" ? "V" : "A";
  return {
    min: -Math.max(30, Math.ceil(Math.abs(value) * 2)),
    max: Math.max(30, Math.ceil(Math.abs(value) * 2)),
    step: 0.1,
    unit,
    value,
    kind:
      component.type === "voltageSource"
        ? "Fuente de tensión"
        : "Fuente de corriente",
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
}: ComponentControlsProps) {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="mb-5 flex items-start gap-3">
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

      <div className="space-y-3">
        {circuit.components.map((component) => {
          const range = controlRange(component);
          const inputId = `component-${component.label}`;

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
                aria-label={`Control deslizante de ${component.label}`}
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={range.value}
                onChange={(event) =>
                  onValueChange(
                    component.label,
                    Number(event.currentTarget.value),
                  )
                }
                className="h-2 w-full cursor-pointer accent-cyan-400"
              />

              <div className="mt-3 flex items-center gap-2">
                <input
                  id={inputId}
                  aria-label={`Valor de ${component.label}`}
                  type="number"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={range.value}
                  onChange={(event) => {
                    if (event.currentTarget.value === "") return;
                    const value = Number(event.currentTarget.value);
                    if (
                      Number.isFinite(value) &&
                      (component.type !== "resistor" || value > 0)
                    ) {
                      onValueChange(component.label, value);
                    }
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
