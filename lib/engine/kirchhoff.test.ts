import { describe, expect, it } from "vitest";

import { problem8a, problem8b, problem9, problem11 } from "../problems/guia04";
import {
  calculatePotentialDifference,
  solveCircuit,
  voltageBetween,
} from "./kirchhoff";
import { netPower } from "./power";
import { updateCircuitComponentValue } from "./circuit-state";
import { findCircuitLoops, findPathBetweenNodes } from "./graph";

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

    expect(result.branchCurrents.R1).toBeCloseTo(-1 / 58, 12);
    expect(result.branchCurrents.R3).toBeCloseTo(25 / 58, 12);
    expect(result.branchCurrents.R2).toBeCloseTo(12 / 29, 12);
    expect(result.currentDirections.R1.isOppositeToReference).toBe(true);
    expect(pathDifference).toBeCloseTo(125 / 58, 12);
    expect(pathDifference).not.toBeCloseTo(2.154, 4);
    expect(voltageBetween(result, "a", "b")).toBeCloseTo(pathDifference, 8);
    expect(netPower(result.powers)).toBeCloseTo(0, 8);
  });

  it("calcula con las dos mallas internas y el nodo A con entradas positivas", () => {
    const result = solveCircuit(problem9);
    expect(result.equations.kvl).toMatchObject([
      {
        id: "M1",
        coefficients: { "I(R4)": -15, "I(R1)": -25, "I(R3)": 10 },
        rhs: 5,
      },
      {
        id: "M2",
        coefficients: { "I(R3)": -10, "I(R2)": -20, "I(R5)": -30 },
        rhs: -25,
      },
    ]);
    expect(
      result.equations.kcl.find((equation) => equation.id === "KCL(A)")
        ?.coefficients,
    ).toEqual({ "I(R1)": 1, "I(R3)": 1, "I(R2)": -1 });
    expect(
      findCircuitLoops(problem9).map((loop) =>
        loop.branches.map((branch) => [branch.label, branch.orientation]),
      ),
    ).toEqual([
      [
        ["R4", 1],
        ["E1", -1],
        ["R1", 1],
        ["R3", -1],
        ["E2", 1],
      ],
      [
        ["E2", -1],
        ["R3", 1],
        ["R2", 1],
        ["E3", -1],
        ["R5", 1],
      ],
    ]);
    expect(
      findPathBetweenNodes(problem9, "a", "b").map((branch) => branch.label),
    ).toEqual(["R1", "R2", "E3"]);
    expect(
      calculatePotentialDifference(problem9, result.branchVoltages, "b", "a"),
    ).toBeCloseTo(-125 / 58, 12);
  });

  it.each([
    ["R1", 60],
    ["R2", 40],
    ["R3", 5],
    ["R4", 75],
    ["R5", 10],
    ["E1", 30],
    ["E2", -15],
    ["E3", -50],
    ["E1", 12.5],
  ])(
    "actualiza %s = %s y coincide con una solución nodal independiente",
    (label, value) => {
      const circuit = updateCircuitComponentValue(
        problem9,
        label as string,
        value as number,
      );
      const result = solveCircuit(circuit);
      const values = Object.fromEntries(
        circuit.components.map((component) => [
          component.label,
          component.type === "resistor"
            ? component.ohms
            : component.type === "voltageSource"
              ? component.volts
              : component.amps,
        ]),
      );
      const left = values.R1 + values.R4;
      const right = values.R2 + values.R5;
      const top =
        (values.E1 / left + values.E2 / values.R3 - values.E3 / right) /
        (1 / left + 1 / values.R3 + 1 / right);
      expect(result.branchCurrents.R1).toBeCloseTo(
        (values.E1 - top) / left,
        12,
      );
      expect(result.branchCurrents.R3).toBeCloseTo(
        (values.E2 - top) / values.R3,
        12,
      );
      expect(result.branchCurrents.R2).toBeCloseTo(
        (top + values.E3) / right,
        12,
      );
      expect(
        result.branchCurrents.R1 +
          result.branchCurrents.R3 -
          result.branchCurrents.R2,
      ).toBeCloseTo(0, 12);
      const difference =
        -result.branchCurrents.R1 * values.R1 -
        result.branchCurrents.R2 * values.R2 +
        values.E3;
      expect(
        calculatePotentialDifference(circuit, result.branchVoltages, "a", "b"),
      ).toBeCloseTo(difference, 12);
      expect(voltageBetween(result, "a", "b")).toBeCloseTo(difference, 12);
      expect(netPower(result.powers)).toBeCloseTo(0, 10);
    },
  );

  it("conserva corrientes menores que la tolerancia de comprobación", () => {
    const factor = 1e-10;
    const circuit = {
      ...problem9,
      components: problem9.components.map((component) =>
        component.type === "voltageSource"
          ? { ...component, volts: component.volts * factor }
          : component,
      ),
    };
    const result = solveCircuit(circuit);
    expect(result.branchCurrents.R1).not.toBe(0);
    expect(result.branchCurrents.R1 / factor).toBeCloseTo(-1 / 58, 12);
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

    expect(() => solveCircuit(circuit, { allowZeroResistance: true })).toThrow(
      "distribución de corrientes es indeterminada",
    );
  });

  it("explica cuándo un cable ideal cortocircuita una fuente", () => {
    const circuit = {
      ...problem8b,
      components: problem8b.components.map((component) =>
        component.type === "resistor" ? { ...component, ohms: 0 } : component,
      ),
    };

    expect(() => solveCircuit(circuit, { allowZeroResistance: true })).toThrow(
      "conecta ambos bornes de V",
    );
  });
});
