import { describe, expect, it } from "vitest";

import { solveCircuit, voltageBetween } from "../engine/kirchhoff";
import { guideNetworkProblems } from "./guia04";

function relativeErrorPercent(actual: number, expected: number): number {
  return (Math.abs(actual - expected) / Math.abs(expected)) * 100;
}

describe("validaciones oficiales de la Guía 04", () => {
  for (const problem of Object.values(guideNetworkProblems)) {
    for (const problemCase of problem.cases) {
      it(`${problem.id.toUpperCase()} ${problemCase.title} queda dentro de tolerancia`, () => {
        const result = solveCircuit(problemCase.circuit);

        for (const validation of problemCase.validations) {
          const { source } = validation;
          const actual =
            source.kind === "branchCurrent"
              ? result.branchCurrents[source.branchLabel]
              : source.kind === "potentialDifference"
                ? voltageBetween(result, source.nodeA, source.nodeB)
                : Math.abs(
                    source.volts / result.branchCurrents[source.branchLabel],
                  );

          expect(
            relativeErrorPercent(actual, validation.expected),
            validation.label,
          ).toBeLessThanOrEqual(validation.tolerancePercent ?? 2);
        }
      });
    }
  }
});
