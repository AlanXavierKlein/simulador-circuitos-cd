import { describe, expect, it } from "vitest";

import { updateCircuitComponentValue } from "../engine/circuit-state";
import { solveCircuit } from "../engine/kirchhoff";
import {
  guideNetworkProblems,
  problem8a,
  problem8b,
  problem11,
} from "./guia04";
import {
  buildLiveNetworkResolution,
  problem8EquivalentResistance,
} from "./live-network-resolution";

describe("resoluciones con los valores actuales de P8 y P11", () => {
  it("conecta cada ejercicio con su desarrollo calculado", () => {
    for (const problemCase of [
      ...guideNetworkProblems.p8.cases,
      ...guideNetworkProblems.p11.cases,
    ]) {
      expect(problemCase.resolution.liveCase).toBe(problemCase.id);
      expect(problemCase).not.toHaveProperty("stepContentOverrides");
      expect(problemCase.resolution.explanation).not.toHaveProperty("sections");
    }
  });

  it("mantiene los valores originales de P8 y muestra aproximaciones coherentes", () => {
    const a = buildLiveNetworkResolution(
      "p8a",
      problem8a,
      solveCircuit(problem8a),
    );
    const b = buildLiveNetworkResolution(
      "p8b",
      problem8b,
      solveCircuit(problem8b),
    );
    expect(a.equivalentResistance).toBe(27.5);
    expect(b.equivalentResistance).toBe(35);
    const text = JSON.stringify(a.explanation);
    expect(text).toContain("I_total = −I0");
    expect(text).toContain("0,0818 A");
    expect(text).toContain(
      "I_total = I(R3) + I_serie ≈ (0,2455) + (0,0818) ≈ 0,3273 A",
    );
  });

  it("actualiza P8(a) al cambiar R1 a 20 Ω", () => {
    const circuit = updateCircuitComponentValue(problem8a, "R1", 20);
    const live = buildLiveNetworkResolution(
      "p8a",
      circuit,
      solveCircuit(circuit),
    );
    const text = JSON.stringify(live.explanation);
    expect(live.equivalentResistance).toBe(28);
    expect(text).toContain("20 + 10 + 10 ≈ 40 Ω");
    expect(text).toContain("10 + 8 + 10 ≈ 28 Ω");
    expect(text).toContain("0,3214 A");
    expect(text).not.toContain("27,5");
  });

  it("reparte corrientes distintas en P8(b) cuando R2 y R3 son distintas", () => {
    const circuit = updateCircuitComponentValue(problem8b, "R2", 20);
    const live = buildLiveNetworkResolution(
      "p8b",
      circuit,
      solveCircuit(circuit),
    );
    const text = JSON.stringify(live.explanation);
    expect(live.equivalentResistance).toBeCloseTo(110 / 3, 12);
    expect(text).toContain("I(R2) = Vp / R2 ≈ (1,6364) / 20 ≈ 0,0818 A");
    expect(text).toContain("I(R3) = Vp / R3 ≈ (1,6364) / 10 ≈ 0,1636 A");
    expect(text).not.toContain("partes iguales");
  });

  for (const [kind, original] of [
    ["p8a", problem8a],
    ["p8b", problem8b],
  ] as const) {
    for (const component of original.components) {
      it(`${kind} actualiza el desarrollo al modificar ${component.label}`, () => {
        const previousValue =
          component.type === "resistor" ? component.ohms : 9;
        const circuit = updateCircuitComponentValue(
          original,
          component.label,
          previousValue * 2,
        );
        const result = solveCircuit(circuit);
        const live = buildLiveNetworkResolution(kind, circuit, result);
        const previous = buildLiveNetworkResolution(
          kind,
          original,
          solveCircuit(original),
        );
        expect(live.explanation).not.toEqual(previous.explanation);
        const source = circuit.components.find(
          (item) => item.type === "voltageSource",
        )!;
        const current = result.branchCurrents[kind === "p8a" ? "R2" : "R1"];
        if (source.type === "voltageSource")
          expect(live.equivalentResistance).toBeCloseTo(
            source.volts / current,
            10,
          );
      });
    }

    it(`${kind} conserva Req con V = 0 y describe las corrientes nulas`, () => {
      const circuit = updateCircuitComponentValue(original, "V", 0);
      const live = buildLiveNetworkResolution(
        kind,
        circuit,
        solveCircuit(circuit),
      );
      expect(live.equivalentResistance).toBe(
        problem8EquivalentResistance(original, kind),
      );
      const text = JSON.stringify(live.explanation);
      expect(text).toContain("(0) /");
      expect(text).toContain("Corriente nula");
      expect(text).not.toMatch(/NaN|Infinity/);
    });

    it(`${kind} conserva las referencias con tensión negativa`, () => {
      const circuit = updateCircuitComponentValue(original, "V", -9);
      const live = buildLiveNetworkResolution(
        kind,
        circuit,
        solveCircuit(circuit),
      );
      const text = JSON.stringify(live.explanation);
      expect(live.equivalentResistance).toBeGreaterThan(0);
      expect(text).toContain("(−9) /");
      expect(text).toContain("sentido real opuesto");
    });
  }

  it.each(["p8a", "p8b"] as const)(
    "%s explica una rama de 0 Ω sin dividir por cero",
    (kind) => {
      const circuit = updateCircuitComponentValue(
        kind === "p8a" ? problem8a : problem8b,
        kind === "p8a" ? "R3" : "R2",
        0,
        { allowZeroResistance: true },
      );
      const live = buildLiveNetworkResolution(
        kind,
        circuit,
        solveCircuit(circuit, { allowZeroResistance: true }),
      );
      expect(live.equivalentResistance).toBe(kind === "p8a" ? 20 : 30);
      const text = JSON.stringify(live.explanation);
      expect(text).toContain("obtenida por KCL");
      expect(text).not.toMatch(/NaN|Infinity|\/ 0 ≈/);
    },
  );

  it("muestra P11 con los mismos nodos que el dibujo y los resultados originales", () => {
    const live = buildLiveNetworkResolution(
      "p11",
      problem11,
      solveCircuit(problem11),
    );
    expect(problem11.nodes.map((node) => node.label)).toEqual(["a", "b", "c"]);
    expect(live.steps?.[0].content).toContain("I0: a → c por R3");
    expect(live.steps?.[1].content).toBe(
      "Nodo a: Ie − I0 − I1 = 0\nNodo c: I0 + I2 − Is = 0",
    );
    expect(live.steps?.[3].content).toBe(
      "−I0 − I1 = −1\nI0 + I2 = 0,25\n9·I0 − 6·I1 − 10·I2 = 0",
    );
    expect(live.steps?.[4].content).toBe(
      "I0 ≈ 0,34 A\nI1 ≈ 0,66 A\nI2 ≈ −0,09 A",
    );
    expect(live.steps?.[5].content).toContain(
      "0,09 A de c → b; sentido real opuesto",
    );
  });

  it("P11 cambia la interpretación de I2 al cambiar Is a 0,8 A", () => {
    const circuit = updateCircuitComponentValue(problem11, "Is", 0.8);
    const live = buildLiveNetworkResolution(
      "p11",
      circuit,
      solveCircuit(circuit),
    );
    expect(live.steps?.[0].content).toContain("Is = 0,8 A");
    expect(live.steps?.[3].content).toContain("I0 + I2 = 0,8");
    expect(live.steps?.[4].content).toBe(
      "I0 ≈ 0,56 A\nI1 ≈ 0,44 A\nI2 ≈ 0,24 A",
    );
    const interpretation = live.steps?.[5].content
      .split("\n")
      .find((line) => line.startsWith("I2 ="));
    expect(interpretation).toContain(
      "0,24 A de b → c; sentido real coincidente",
    );
  });

  it.each([
    ["R1", 12],
    ["R2", 20],
    ["R3", 18],
    ["Ie", -1],
    ["Is", -0.25],
  ] as const)(
    "P11 usa %s = %s en el sistema y coincide con una solución independiente",
    (label, value) => {
      const circuit = updateCircuitComponentValue(problem11, label, value);
      const result = solveCircuit(circuit);
      const live = buildLiveNetworkResolution("p11", circuit, result);
      const values = Object.fromEntries(
        circuit.components.map((item) => [
          item.label,
          item.type === "resistor"
            ? item.ohms
            : item.type === "currentSource"
              ? item.amps
              : item.volts,
        ]),
      );
      const i0 =
        (values.R1 * values.Ie + values.R2 * values.Is) /
        (values.R1 + values.R2 + values.R3);
      expect(result.branchCurrents.R3).toBeCloseTo(i0, 12);
      expect(result.branchCurrents.R1).toBeCloseTo(values.Ie - i0, 12);
      expect(result.branchCurrents.R2).toBeCloseTo(values.Is - i0, 12);
      expect(live.steps).not.toEqual(
        buildLiveNetworkResolution("p11", problem11, solveCircuit(problem11))
          .steps,
      );
      expect(live.steps?.[3].content).toContain(
        `${values.R3}·I0 − ${values.R1}·I1 − ${values.R2}·I2 = 0`,
      );
    },
  );

  it("P11 describe corrientes nulas cuando las fuentes valen cero", () => {
    const circuit = updateCircuitComponentValue(
      updateCircuitComponentValue(problem11, "Ie", 0),
      "Is",
      0,
    );
    const live = buildLiveNetworkResolution(
      "p11",
      circuit,
      solveCircuit(circuit),
    );
    expect(live.steps?.[4].content).toBe("I0 ≈ 0 A\nI1 ≈ 0 A\nI2 ≈ 0 A");
    expect(live.steps?.[5].content.match(/Corriente nula/g)).toHaveLength(5);
  });
});
