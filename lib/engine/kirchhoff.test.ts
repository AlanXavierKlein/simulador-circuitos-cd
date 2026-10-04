import { describe, expect, it } from "vitest";

import { problem8a, problem8b, problem9, problem11 } from "../problems/guia04";
import {
  calculatePotentialDifference,
  solveCircuit,
  voltageBetween,
} from "./kirchhoff";
import { netPower } from "./power";

describe("motor de Kirchhoff por corrientes de rama", () => {
  it("resuelve el Problema 11 y conserva el signo opuesto de I2", () => {
    const result = solveCircuit(problem11);

    expect(result.branchCurrents.R3).toBeCloseTo(0.34, 2);
    expect(result.branchCurrents.R1).toBeCloseTo(0.66, 2);
    expect(result.branchCurrents.R2).toBeCloseTo(-0.09, 2);
    expect(result.currentDirections.R2.isOppositeToReference).toBe(true);
    expect(result.equations.kcl).toHaveLength(problem11.nodes.length - 1);
    expect(result.equations.kvl).toHaveLength(
      problem11.components.length - problem11.nodes.length + 1,
    );
    expect(netPower(result.powers)).toBeCloseTo(0, 8);
  });

  it("resuelve el Problema 9 y calcula Vb - Va", () => {
    const result = solveCircuit(problem9);
    const pathDifference = calculatePotentialDifference(
      problem9,
      result.branchVoltages,
      "a",
      "b",
    );

    expect(result.branchCurrents.R1).toBeCloseTo(-0.0172, 3);
    expect(result.branchCurrents.R3).toBeCloseTo(0.431, 3);
    expect(result.branchCurrents.R2).toBeCloseTo(0.4138, 3);
    expect(result.currentDirections.R1.isOppositeToReference).toBe(true);
    expect(pathDifference).toBeCloseTo(2.154, 2);
    expect(voltageBetween(result, "a", "b")).toBeCloseTo(pathDifference, 8);
    expect(netPower(result.powers)).toBeCloseTo(0, 8);
  });

  it("resuelve el Problema 8(a) y obtiene la resistencia equivalente", () => {
    const result = solveCircuit(problem8a);
    const totalCurrent = result.branchCurrents.R2;
    const equivalentResistance = 9 / totalCurrent;

    expect(equivalentResistance).toBeCloseTo(27.5, 6);
    expect(totalCurrent).toBeCloseTo(0.327, 2);
    expect(result.branchCurrents.R3).toBeCloseTo(0.245, 2);
    expect(result.branchCurrents.R1).toBeCloseTo(0.0818, 3);
    expect(netPower(result.powers)).toBeCloseTo(0, 8);
  });

  it("rechaza un circuito desconectado antes de resolverlo", () => {
    expect(() =>
      solveCircuit({
        nodes: [{ id: "0" }, { id: "1" }, { id: "2" }],
        components: [
          {
            type: "resistor",
            label: "R1",
            nFrom: "0",
            nTo: "1",
            ohms: 10,
          },
        ],
      }),
    ).toThrow("conectado");
  });

  it("resuelve P8 con una resistencia ideal de 0 Ω cuando el caso lo permite", () => {
    const circuit = {
      ...problem8a,
      components: problem8a.components.map((component) =>
        component.label === "R1" && component.type === "resistor"
          ? { ...component, ohms: 0 }
          : component,
      ),
    };

    expect(() => solveCircuit(circuit)).toThrow("positiva");

    const result = solveCircuit(circuit, { allowZeroResistance: true });
    expect(result.branchVoltages.R1).toBe(0);
    expect(result.powers.R1).toBe(0);
    expect(Number.isFinite(result.branchCurrents.R1)).toBe(true);
  });

  it("explica cuándo un cortocircuito ideal no tiene corriente única", () => {
    const circuit = {
      ...problem8b,
      components: problem8b.components.map((component) =>
        (component.label === "R2" || component.label === "R3") &&
        component.type === "resistor"
          ? { ...component, ohms: 0 }
          : component,
      ),
    };

    expect(() =>
      solveCircuit(circuit, { allowZeroResistance: true }),
    ).toThrow("distribución de corrientes es indeterminada");
  });

  it("explica cuándo un cable ideal cortocircuita una fuente", () => {
    const circuit = {
      ...problem8b,
      components: problem8b.components.map((component) =>
        component.type === "resistor" ? { ...component, ohms: 0 } : component,
      ),
    };

    expect(() =>
      solveCircuit(circuit, { allowZeroResistance: true }),
    ).toThrow("conecta ambos bornes de V");
  });
});
