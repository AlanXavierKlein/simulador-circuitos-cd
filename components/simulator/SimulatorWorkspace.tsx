"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import type {
  ComponentPositionMap,
  CurrentLabelPlacementMap,
  NodePositionMap,
} from "@/components/circuit/circuit-adapter";
import { ComponentControls } from "@/components/controls/ComponentControls";
import { GuideExplanation } from "@/components/guide/GuideExplanation";
import { GuideValidationPanel } from "@/components/guide/GuideValidationPanel";
import type { ValidationReading } from "@/components/guide/GuideValidationPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { SolutionSteps } from "@/components/steps/SolutionSteps";
import { solveCircuit, voltageBetween } from "@/lib/engine/kirchhoff";
import type { Circuit } from "@/lib/engine/model";
import {
  cloneCircuit,
  updateCircuitComponentValue,
} from "@/lib/engine/circuit-state";
import { buildSolutionSteps } from "@/lib/engine/steps";
import type { GuideValidationDefinition } from "@/lib/problems/guia04";
import type { GuideResolution } from "@/lib/problems/guide-explanations";

type GuideWorkspaceOptions = {
  stepExplanations: Record<string, string>;
  stepContentOverrides?: Record<string, string>;
  resolution: GuideResolution;
  validations: GuideValidationDefinition[];
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
  title = "Red de tres mallas",
  guide,
}: SimulatorWorkspaceProps) {
  const originalCircuitRef = useRef<Circuit>(cloneCircuit(initialCircuit));
  const [circuit, setCircuit] = useState(() => cloneCircuit(initialCircuit));
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

  const validationReadings = useMemo<ValidationReading[]>(() => {
    if (!guide || !calculation.result) return [];

    return guide.validations.map((validation) => {
      const { source } = validation;
      let actual: number;
      if (source.kind === "branchCurrent") {
        actual = calculation.result.branchCurrents[source.branchLabel] ?? 0;
      } else if (source.kind === "potentialDifference") {
        actual = voltageBetween(calculation.result, source.nodeA, source.nodeB);
      } else {
        const current =
          calculation.result.branchCurrents[source.branchLabel] ?? 0;
        actual = Math.abs(source.volts / current);
      }

      return { ...validation, actual };
    });
  }, [calculation.result, guide]);

  const controls = (
    <ComponentControls
      circuit={circuit}
      compact={Boolean(guide)}
      onReset={
        guide
          ? () => setCircuit(cloneCircuit(originalCircuitRef.current))
          : undefined
      }
      onValueChange={(label, value) =>
        setCircuit((currentCircuit) =>
          updateCircuitComponentValue(currentCircuit, label, value),
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
      {guide ? (
        <div className="space-y-6">
          {canvas}
          <div className="grid gap-6">
            {controls}
            {calculation.result ? (
              <GuideValidationPanel readings={validationReadings} />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
          {canvas}
          {controls}
        </div>
      )}

      {calculation.result ? (
        <>
          {guide ? (
            <>
              {guide.resolution.mode === "prepend-analysis" ? (
                <GuideExplanation explanation={guide.resolution.explanation} />
              ) : null}
              {guide.resolution.mode === "replace-kirchhoff" ? (
                <GuideExplanation explanation={guide.resolution.explanation} />
              ) : (
                <SolutionSteps
                  steps={calculation.steps.map((step) => ({
                    ...step,
                    content:
                      guide.stepContentOverrides?.[step.id] ?? step.content,
                  }))}
                  explanations={guide.stepExplanations}
                  defaultOpen
                />
              )}
              <ResultsPanel circuit={circuit} result={calculation.result} />
            </>
          ) : (
            <>
              <ResultsPanel circuit={circuit} result={calculation.result} />
              <SolutionSteps steps={calculation.steps} />
            </>
          )}
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
