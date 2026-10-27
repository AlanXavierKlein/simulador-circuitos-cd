import { describe, expect, it } from "vitest";

import { problem9 } from "../problems/phase1-validation";
import { solveCircuit } from "./kirchhoff";
import { buildSolutionSteps } from "./steps";
import { cloneCircuit, updateCircuitComponentValue } from "./circuit-state";

describe("paso a paso de Kirchhoff", () => {
  it("desarrolla las dos mallas internas horarias y el potencial del P9", () => {
    const result = solveCircuit(problem9);
    const steps = buildSolutionSteps(problem9, result);

    expect(steps).toHaveLength(7);
    expect(steps[0].content).toContain("I0: 0 → l → a → A");
    expect(steps[1].content).toBe("KCL(A): I0 + I1 − I2 = 0");
    expect(steps[2].content).toContain("0 → l → a → A → m → 0");
    expect(steps[2].content).toContain("0 → m → A → r → b → 0");
    expect(steps[2].content).toContain(
      "M1: −I0·R4 + E1 − I0·R1 + I1·R3 − E2 = 0",
    );
    expect(steps[2].content).toContain(
      "M2: E2 − I1·R3 − I2·R2 + E3 − I2·R5 = 0",
    );
    expect(steps[2].content).toContain("−(R1 + R4)·I0 + R3·I1 = E2 − E1");
    expect(steps[2].content).toContain("−R3·I1 − (R2 + R5)·I2 = −E2 − E3");
    expect(steps[3].content).toBe(
      "M1: −40·I0 + 10·I1 = 5\nM2: −10·I1 − 50·I2 = −25\nKCL(A): I0 + I1 − I2 = 0",
    );
    expect(steps[4].content).toBe(
      "I0 = −0,0172413793 A\nI1 = 0,4310344828 A\nI2 = 0,4137931034 A",
    );
    expect(steps[5].content).toContain("sentido real opuesto");
    expect(steps[5].content).toContain("|I0| = 0,0172 A de A → a → l → 0");
    expect(steps[6].content).toContain("a → A → r → b por R1, R2, E3");
    expect(steps[6].content).toContain("Vb − Va = −I0·R1 − I2·R2 + E3");
    expect(steps[6].content).toContain("−(−0,0172413793)·25");
    expect(steps[6].content).toContain("2,1551724138 V ≈ 2,1552 V");
  });

  it("actualiza el desarrollo después de clonar y modificar resistencias y fuentes", () => {
    let circuit = cloneCircuit(problem9);
    circuit = updateCircuitComponentValue(circuit, "R1", 35);
    circuit = updateCircuitComponentValue(circuit, "E1", 30);
    const steps = buildSolutionSteps(circuit, solveCircuit(circuit));

    expect(steps[3].content).toContain("M1: −50·I0 + 10·I1 = −15");
    expect(steps[2].content).toContain("− I0·35 + I1·10");
    expect(steps[5].content).not.toContain("sentido real opuesto");
    expect(steps[6].content).toContain("·35");
    expect(steps[6].content).not.toContain("2,1552");
    expect(circuit.analysis).toEqual(problem9.analysis);
    expect(circuit.analysis).not.toBe(problem9.analysis);
    expect(circuit.analysis?.meshes[0].componentLabels).not.toBe(
      problem9.analysis?.meshes[0].componentLabels,
    );
  });

  it("interpreta la inversión de I1 sin cambiar las referencias", () => {
    const circuit = updateCircuitComponentValue(problem9, "E2", -15);
    const steps = buildSolutionSteps(circuit, solveCircuit(circuit));

    expect(steps[0].content).toContain("I1: 0 → m → A");
    expect(steps[5].content).toContain("|I1|");
    expect(steps[5].content).toContain("A → m → 0");
    expect(steps[6].content).toContain("Vb − Va = −I0·R1 − I2·R2 + E3");
  });

  it("muestra corrientes nulas cuando se anulan todas las fuentes", () => {
    let circuit = cloneCircuit(problem9);
    for (const label of ["E1", "E2", "E3"])
      circuit = updateCircuitComponentValue(circuit, label, 0);
    const steps = buildSolutionSteps(circuit, solveCircuit(circuit));
    expect(steps[4].content).toBe("I0 = 0 A\nI1 = 0 A\nI2 = 0 A");
    expect(steps[5].content.match(/Corriente nula/g)).toHaveLength(3);
    expect(steps[6].content).toContain("0 V ≈ 0 V");
  });
});
