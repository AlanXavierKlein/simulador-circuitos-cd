"use client";

import { AlertTriangle, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { GuideValidationPanel } from "@/components/guide/GuideValidationPanel";
import type { ValidationReading } from "@/components/guide/GuideValidationPanel";
import {
  defaultAmmeterInput,
  defaultVoltmeterInput,
  solveAmmeter,
  solveVoltmeter,
} from "@/lib/problems/instruments";
import type {
  AmmeterInput,
  InstrumentResistances,
  VoltmeterInput,
} from "@/lib/problems/instruments";

import { InstrumentDiagram } from "./InstrumentDiagram";

type InstrumentKind = "ammeter" | "voltmeter";

type InstrumentStep = {
  title: string;
  explanation: string;
  equations: string[];
};

function formatNumber(value: number, digits = 6): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: digits,
  }).format(value);
}

function buildAmmeterSteps(
  input: AmmeterInput,
  result: InstrumentResistances,
): InstrumentStep[] {
  const [i1, i2, i3] = input.scales;
  const ig = input.galvanometerCurrent;
  const vg = input.rg * ig;
  const ir1 = i1 - ig;
  const ir2 = i2 - ig;
  const ir3 = i3 - ig;

  return [
    {
      title: "1. Tensión del galvanómetro",
      explanation:
        "A fondo de escala, la caída sobre el galvanómetro queda fijada por rg e Ig.",
      equations: [`Vg = rg·Ig = ${formatNumber(vg)} V`],
    },
    {
      title: "2. Corrientes de derivación",
      explanation:
        "En cada escala, la corriente que no atraviesa el galvanómetro circula por la cadena del shunt.",
      equations: [
        `I1r = I1 − Ig = ${formatNumber(ir1)} A`,
        `I2r = I2 − Ig = ${formatNumber(ir2)} A`,
        `I3r = I3 − Ig = ${formatNumber(ir3)} A`,
      ],
    },
    {
      title: "3. Sistema del shunt Ayrton",
      explanation:
        "Igualamos las diferencias de potencial de las ramas para las tres posiciones del selector.",
      equations: [
        "R1 + R2 + R3 = Vg / I1r",
        "I2r·R1 + I2r·R2 − Ig·R3 = Ig·rg",
        "I3r·R1 − Ig·R2 − Ig·R3 = Ig·rg",
      ],
    },
    {
      title: "4. Valores reemplazados",
      explanation:
        "Se sustituyen los datos del enunciado, sin desarrollar la resolución matricial intermedia.",
      equations: [
        `R1 + R2 + R3 = ${formatNumber(vg)} / ${formatNumber(ir1)}`,
        `${formatNumber(ir2)}·R1 + ${formatNumber(ir2)}·R2 − ${formatNumber(ig)}·R3 = ${formatNumber(vg)}`,
        `${formatNumber(ir3)}·R1 − ${formatNumber(ig)}·R2 − ${formatNumber(ig)}·R3 = ${formatNumber(vg)}`,
      ],
    },
    {
      title: "5. Solución",
      explanation:
        "Estas resistencias mantienen Ig en su valor de fondo de escala para cada corriente seleccionada.",
      equations: [
        `R1 = ${formatNumber(result.R1)} Ω`,
        `R2 = ${formatNumber(result.R2)} Ω`,
        `R3 = ${formatNumber(result.R3)} Ω`,
      ],
    },
  ];
}

function buildVoltmeterSteps(
  input: VoltmeterInput,
  result: InstrumentResistances,
): InstrumentStep[] {
  const [v1, v2, v3] = input.scales;
  const ig = input.galvanometerCurrent;
  const vg = input.rg * ig;

  return [
    {
      title: "1. Condición de fondo de escala",
      explanation:
        "En las tres entradas debe circular la misma Ig por el galvanómetro y por las resistencias conectadas en serie.",
      equations: [`Vg = Ig·rg = ${formatNumber(vg)} V`],
    },
    {
      title: "2. Diferencias de potencial acumuladas",
      explanation:
        "Cada nueva escala agrega una resistencia multiplicadora a las anteriores.",
      equations: [
        "Ig·rg + Ig·R1 = V1",
        "Ig·rg + Ig·R1 + Ig·R2 = V2",
        "Ig·rg + Ig·R1 + Ig·R2 + Ig·R3 = V3",
      ],
    },
    {
      title: "3. Sistema con datos",
      explanation:
        "Despejamos la contribución del galvanómetro y reemplazamos las tensiones de cada escala.",
      equations: [
        `${formatNumber(ig)}·R1 = ${formatNumber(v1 - vg)} V`,
        `${formatNumber(ig)}·R1 + ${formatNumber(ig)}·R2 = ${formatNumber(v2 - vg)} V`,
        `${formatNumber(ig)}·R1 + ${formatNumber(ig)}·R2 + ${formatNumber(ig)}·R3 = ${formatNumber(v3 - vg)} V`,
      ],
    },
    {
      title: "4. Resistencias incrementales",
      explanation:
        "R1 completa la primera escala; R2 aporta el salto de V1 a V2 y R3 el salto de V2 a V3.",
      equations: ["R1 = V1/Ig − rg", "R2 = (V2 − V1)/Ig", "R3 = (V3 − V2)/Ig"],
    },
    {
      title: "5. Solución",
      explanation:
        "Al elegir un borne se conecta la resistencia total necesaria para la tensión máxima indicada.",
      equations: [
        `R1 = ${formatNumber(result.R1)} Ω`,
        `R2 = ${formatNumber(result.R2)} Ω`,
        `R3 = ${formatNumber(result.R3)} Ω`,
      ],
    },
  ];
}

export function InstrumentDesigner({ kind }: { kind: InstrumentKind }) {
  const defaults =
    kind === "ammeter" ? defaultAmmeterInput : defaultVoltmeterInput;
  const [rg, setRg] = useState(defaults.rg);
  const [ig, setIg] = useState(defaults.galvanometerCurrent);
  const [scales, setScales] = useState<[number, number, number]>(
    defaults.scales,
  );
  const calculation = useMemo(() => {
    try {
      const input = { rg, galvanometerCurrent: ig, scales };
      const result =
        kind === "ammeter"
          ? solveAmmeter(input as AmmeterInput)
          : solveVoltmeter(input as VoltmeterInput);
      const steps =
        kind === "ammeter"
          ? buildAmmeterSteps(input as AmmeterInput, result)
          : buildVoltmeterSteps(input as VoltmeterInput, result);
      return { result, steps, error: null };
    } catch (error) {
      return {
        result: null,
        steps: [],
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
    setRg(defaults.rg);
    setIg(defaults.galvanometerCurrent);
    setScales(defaults.scales);
  };

  return (
    <div className="space-y-6">
      <InstrumentDiagram kind={kind} scales={scales} />

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
        <aside className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-3">
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
              aria-label="Restablecer valores oficiales"
              className="grid size-9 place-items-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

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
          <div className="flex items-start gap-3 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" />
            <div>
              <p className="font-medium">Revisá los datos ingresados.</p>
              <p className="mt-1 text-amber-200/75">{calculation.error}</p>
            </div>
          </div>
        )}
      </div>

      {calculation.result ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-lime-300">
            Resolución de cátedra
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Paso a paso
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Se conserva la deducción de la resolución oficial, sin agregar
            desarrollo algebraico innecesario.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {calculation.steps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4"
              >
                <h3 className="font-medium text-cyan-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.explanation}
                </p>
                <div className="mt-3 space-y-2">
                  {step.equations.map((equation) => (
                    <code
                      key={equation}
                      className="block overflow-x-auto rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-xs leading-5 text-slate-300"
                    >
                      {equation}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
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
