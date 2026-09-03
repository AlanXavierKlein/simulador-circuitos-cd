import { describe, expect, it } from "vitest";

import { problem9 } from "../problems/phase1-validation";
import { solveCircuit } from "./kirchhoff";
import { updateCircuitComponentValue } from "./circuit-state";

describe("estado editable del circuito", () => {
  it("actualiza una rama sin mutar la netlist de origen", () => {
    const modified = updateCircuitComponentValue(problem9, "R1", 50);

    expect(
      problem9.components.find((component) => component.label === "R1"),
    ).toMatchObject({
      ohms: 25,
    });
    expect(
      modified.components.find((component) => component.label === "R1"),
    ).toMatchObject({
      ohms: 50,
    });
    expect(solveCircuit(modified).branchCurrents.R1).not.toBeCloseTo(
      solveCircuit(problem9).branchCurrents.R1,
      6,
    );
  });
});
