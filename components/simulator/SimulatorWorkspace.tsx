"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import type { NodePositionMap } from "@/components/circuit/circuit-adapter";
import { ComponentControls } from "@/components/controls/ComponentControls";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { SolutionSteps } from "@/components/steps/SolutionSteps";
import { solveCircuit } from "@/lib/engine/kirchhoff";
import type { Circuit } from "@/lib/engine/model";
import { updateCircuitComponentValue } from "@/lib/engine/circuit-state";
import { buildSolutionSteps } from "@/lib/engine/steps";

type SimulatorWorkspaceProps = {
  initialCircuit: Circuit;
  nodePositions: NodePositionMap;
};

export function SimulatorWorkspace({
  initialCircuit,
  nodePositions,
}: SimulatorWorkspaceProps) {
  const [circuit, setCircuit] = useState(initialCircuit);
  const calculation = useMemo(() => {
    try {
      const result = solveCircuit(circuit);
      return {
        result,
        steps: buildSolutionSteps(circuit, result),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        steps: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudo resolver el circuito.",
      };
    }
  }, [circuit]);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <CircuitCanvas
          circuit={circuit}
          nodePositions={nodePositions}
          branchCurrents={calculation.result?.branchCurrents}
          title="Red de tres mallas"
        />
        <ComponentControls
          circuit={circuit}
          onValueChange={(label, value) =>
            setCircuit((currentCircuit) =>
              updateCircuitComponentValue(currentCircuit, label, value),
            )
          }
        />
      </div>

      {calculation.result ? (
        <>
          <ResultsPanel circuit={circuit} result={calculation.result} />
          <SolutionSteps steps={calculation.steps} />
        </>
      ) : (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-300" />
          <div>
            <p className="font-medium">No se pudo resolver el circuito.</p>
            <p className="mt-1 text-rose-200/75">{calculation.error}</p>
          </div>
        </div>
      )}
    </>
  );
}
