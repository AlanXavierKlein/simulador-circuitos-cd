"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import type {
  ComponentPositionMap,
  CurrentLabelPlacementMap,
  NodePositionMap,
} from "@/components/circuit/circuit-adapter";
import { ComponentControls } from "@/components/controls/ComponentControls";
import { GuideExplanation } from "@/components/guide/GuideExplanation";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { SolutionSteps } from "@/components/steps/SolutionSteps";
import { solveCircuit, voltageBetween } from "@/lib/engine/kirchhoff";
import type { SolveResult } from "@/lib/engine/kirchhoff";
import type { Circuit } from "@/lib/engine/model";
import {
  cloneCircuit,
  hasOriginalCircuitValues,
  updateCircuitComponentValue,
} from "@/lib/engine/circuit-state";
import { buildSolutionSteps } from "@/lib/engine/steps";
import { buildLiveNetworkResolution } from "@/lib/problems/live-network-resolution";
import type { GuideValidationDefinition } from "@/lib/problems/guia04";
import type { GuideResolution } from "@/lib/problems/guide-explanations";
import type { PrimaryResultReading } from "@/components/results/ResultsPanel";

function getValidationValue(
  validation: GuideValidationDefinition,
  circuit: Circuit,
  result: SolveResult,
  equivalentResistance?: number,
): number | null {
  const { source } = validation;
  if (source.kind === "branchCurrent") {
    return result.branchCurrents[source.branchLabel] ?? 0;
  }
  if (source.kind === "potentialDifference") {
    return voltageBetween(result, source.nodeA, source.nodeB);
  }
  if (equivalentResistance !== undefined) return equivalentResistance;

  const current = result.branchCurrents[source.branchLabel] ?? 0;
  if (Math.abs(current) < 1e-12) return null;

  const supplyVoltage =
    circuit.components.find((component) => component.type === "voltageSource")
      ?.volts ?? source.volts;
  return Math.abs(supplyVoltage / current);
}

type GuideWorkspaceOptions = {
  stepExplanations: Record<string, string>;
  resolution: GuideResolution;
  allowZeroResistance?: boolean;
  validations?: GuideValidationDefinition[];
};

type SimulatorWorkspaceProps = {
  initialCircuit: Circuit;
  nodePositions: NodePositionMap;
  componentPositions?: ComponentPositionMap;
  currentLabelPlacements?: CurrentLabelPlacementMap;
  title?: string;
  guide?: GuideWorkspaceOptions;
};

export function SimulatorWorkspace({
  initialCircuit,
  nodePositions,
  componentPositions,
  currentLabelPlacements,
  title = "Red de tres ramas",
  guide,
}: SimulatorWorkspaceProps) {
  const [originalCircuit] = useState<Circuit>(() =>
    cloneCircuit(initialCircuit),
  );
  const [circuit, setCircuit] = useState(() => cloneCircuit(initialCircuit));
  const allowZeroResistance = guide?.allowZeroResistance ?? false;
  const hasOriginalValues = hasOriginalCircuitValues(circuit, originalCircuit);
  const liveCase = guide?.resolution.liveCase;
  const calculation = useMemo(() => {
    try {
      const result = solveCircuit(circuit, {
        allowZeroResistance,
      });
      const live = liveCase
        ? buildLiveNetworkResolution(liveCase, circuit, result)
        : undefined;
      return {
        result,
        steps: live?.steps ?? buildSolutionSteps(circuit, result),
        live,
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        steps: [],
        live: undefined,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo resolver el circuito.",
      };
    }
  }, [allowZeroResistance, circuit, liveCase]);

  const primaryReadings: PrimaryResultReading[] | undefined =
    calculation.result && guide?.validations
      ? guide.validations.map((validation) => ({
          id: validation.id,
          label: validation.label,
          unit: validation.unit,
          value: getValidationValue(
            validation,
            circuit,
            calculation.result,
            calculation.live?.equivalentResistance,
          ),
        }))
      : undefined;

  const controls = (
    <ComponentControls
      circuit={circuit}
      allowZeroResistance={allowZeroResistance}
      onReset={
        guide ? () => setCircuit(cloneCircuit(originalCircuit)) : undefined
      }
      onValueChange={(label, value) =>
        setCircuit((currentCircuit) =>
          updateCircuitComponentValue(currentCircuit, label, value, {
            allowZeroResistance,
          }),
        )
      }
    />
  );

  const canvas = (
    <CircuitCanvas
      circuit={circuit}
      nodePositions={nodePositions}
      componentPositions={componentPositions}
      branchCurrents={calculation.result?.branchCurrents}
      currentLabelPlacements={currentLabelPlacements}
      title={title}
    />
  );

  return (
    <>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        {canvas}
        {controls}
      </div>

      {calculation.result ? (
        <>
          {guide ? (
            <>
              {guide.resolution.mode === "prepend-analysis" ? (
                <GuideExplanation
                  explanation={guide.resolution.explanation}
                  hasOriginalValues={hasOriginalValues}
                  className="mt-6"
                />
              ) : null}
              {guide.resolution.mode === "replace-kirchhoff" ? (
                <GuideExplanation
                  explanation={{
                    ...guide.resolution.explanation,
                    ...calculation.live?.explanation,
                  }}
                  hasOriginalValues={hasOriginalValues}
                  isLive={Boolean(calculation.live?.explanation)}
                  className="mt-6"
                />
              ) : (
                <SolutionSteps
                  steps={calculation.steps}
                  explanations={guide.stepExplanations}
                  defaultOpen
                />
              )}
              <ResultsPanel
                circuit={circuit}
                result={calculation.result}
                primaryReadings={primaryReadings}
              />
            </>
          ) : (
            <>
              <ResultsPanel circuit={circuit} result={calculation.result} />
              <SolutionSteps steps={calculation.steps} />
            </>
          )}
        </>
      ) : (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-300" />
          <div>
            <p className="font-medium">
              No se puede resolver el circuito con estos valores.
            </p>
            <p className="mt-1 leading-6 text-rose-100/85">
              {calculation.error}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
