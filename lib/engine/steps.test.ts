import { describe, expect, it } from "vitest";

import { problem9 } from "../problems/phase1-validation";
import { solveCircuit } from "./kirchhoff";
import { buildSolutionSteps } from "./steps";

describe("paso a paso de Kirchhoff", () => {
  it("resume las seis etapas de la resolución del P9", () => {
    const result = solveCircuit(problem9);
    const steps = buildSolutionSteps(problem9, result);

    expect(steps).toHaveLength(6);
    expect(steps[1].content).toContain("KCL(");
    expect(steps[2].content).toContain("M1:");
    expect(steps[3].content).toContain("25·I(R1)");
    expect(steps[4].content).toContain("I(R3) = 0,431 A");
    expect(steps[5].content).toContain("sentido real opuesto");
  });
});
