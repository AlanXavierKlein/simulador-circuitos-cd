"use client";

import { AlertTriangle, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { GuideExplanation } from "@/components/guide/GuideExplanation";
import { GuideValidationPanel } from "@/components/guide/GuideValidationPanel";
import type { ValidationReading } from "@/components/guide/GuideValidationPanel";
import { guideInstrumentExplanations } from "@/lib/problems/guide-explanations";
import {
  defaultAmmeterInput,
  defaultVoltmeterInput,
  solveAmmeter,
  solveVoltmeter,
} from "@/lib/problems/instruments";
import type { AmmeterInput, VoltmeterInput } from "@/lib/problems/instruments";

import { InstrumentDiagram } from "./InstrumentDiagram";

type InstrumentKind = "ammeter" | "voltmeter";

export function InstrumentDesigner({ kind }: { kind: InstrumentKind }) {
  const defaults =
    kind === "ammeter" ? defaultAmmeterInput : defaultVoltmeterInput;
  const originalValuesRef = useRef({
    rg: defaults.rg,
    galvanometerCurrent: defaults.galvanometerCurrent,
    scales: [...defaults.scales] as [number, number, number],
  });
  const [rg, setRg] = useState(defaults.rg);
  const [ig, setIg] = useState(defaults.galvanometerCurrent);
  const [scales, setScales] = useState<[number, number, number]>(() => [
    ...defaults.scales,
  ]);
  const calculation = useMemo(() => {
    try {
      const input = { rg, galvanometerCurrent: ig, scales };
      const result =
        kind === "ammeter"
          ? solveAmmeter(input as AmmeterInput)
          : solveVoltmeter(input as VoltmeterInput);
      return { result, error: null };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "No se pudo calcular.",
      };
    }
  }, [ig, kind, rg, scales]);

  const official =
    kind === "ammeter"
      ? { R1: 1 / 90, R2: 0.1, R3: 1 }
      : { R1: 2990, R2: 12000, R3: 135000 };
  const readings: ValidationReading[] = calculation.result
    ? (["R1", "R2", "R3"] as const).map((label) => ({
        id: label,
        label,
        actual: calculation.result[label],
        expected: official[label],
        unit: "Ω",
        tolerancePercent: 0.1,
      }))
    : [];

  const reset = () => {
    setRg(originalValuesRef.current.rg);
    setIg(originalValuesRef.current.galvanometerCurrent);
    setScales([...originalValuesRef.current.scales]);
  };

  return (
    <div className="min-w-0 space-y-6">
      <InstrumentDiagram kind={kind} scales={scales} />

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
        <aside className="min-w-0 max-w-full rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <SlidersHorizontal className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-100">Datos</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                El cálculo se actualiza al instante.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <RotateCcw className="size-4" />
            Restablecer valores
          </button>

          <div className="mt-5 space-y-4">
            <NumberField
              label="rg"
              value={rg}
              unit="Ω"
              step={0.001}
              onChange={setRg}
            />
            <NumberField
              label="Ig"
              value={ig}
              unit="A"
              step={0.001}
              onChange={setIg}
            />
            {scales.map((scale, index) => (
              <NumberField
                key={index}
                label={`${kind === "ammeter" ? "I" : "V"}${index + 1}`}
                value={scale}
                unit={kind === "ammeter" ? "A" : "V"}
                step={kind === "ammeter" ? 0.1 : 1}
                onChange={(value) =>
                  setScales((current) => {
                    const next = [...current] as [number, number, number];
                    next[index] = value;
                    return next;
                  })
                }
              />
            ))}
          </div>
        </aside>

        {calculation.result ? (
          <GuideValidationPanel readings={readings} />
        ) : (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
            <div>
              <p className="font-medium">Revisá los datos ingresados.</p>
              <p className="mt-1 leading-6 text-amber-100/85">
                {calculation.error}
              </p>
            </div>
          </div>
        )}
      </div>

      {calculation.result ? (
        <GuideExplanation explanation={guideInstrumentExplanations[kind]} />
      ) : null}
    </div>
  );
}

function NumberField({
  label,
  value,
  unit,
  step,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-slate-800 bg-slate-900/65 p-3.5">
      <span className="font-mono text-xs font-semibold text-cyan-100">
        {label}
      </span>
      <span className="mt-2 flex items-center gap-2">
        <input
          suppressHydrationWarning
          aria-label={`Valor de ${label}`}
          type="number"
          min={step}
          step={step}
          value={value}
          onChange={(event) => {
            const next = Number(event.currentTarget.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        />
        <span className="w-6 font-mono text-xs text-slate-500">{unit}</span>
      </span>
    </label>
  );
}
