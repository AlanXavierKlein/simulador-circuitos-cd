import type { Metadata } from "next";

import {
  problem9CurrentLabelPlacements,
  problem9Positions,
} from "@/components/circuit/example-layouts";
import { SimulatorWorkspace } from "@/components/simulator/SimulatorWorkspace";
import { problem9 } from "@/lib/problems/phase1-validation";

export const metadata: Metadata = { title: "Simulador" };

export default function SimulatorPage() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-8 sm:py-9">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
              Problema 9
            </span>
            <span className="text-sm text-slate-500">
              Guía de Electrodinámica
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Circuito de ejemplo
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400 lg:text-right">
          Explorá la red con zoom y desplazamiento. Los componentes se generan
          directamente desde la netlist utilizada por el motor de Kirchhoff.
        </p>
      </div>

      <SimulatorWorkspace
        initialCircuit={problem9}
        nodePositions={problem9Positions}
        currentLabelPlacements={problem9CurrentLabelPlacements}
      />
    </section>
  );
}
