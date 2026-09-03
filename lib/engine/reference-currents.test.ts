import { describe, expect, it } from "vitest";

import { problem9 } from "../problems/phase1-validation";
import { problem11 } from "../problems/guia04";
import { solveCircuit } from "./kirchhoff";
import { buildReferenceCurrentLayout } from "./reference-currents";

describe("referencias de corriente por rama física", () => {
  it("agrupa el P9 en I0, I1 e I2 con sus sentidos asumidos", () => {
    const result = solveCircuit(problem9);
    const layout = buildReferenceCurrentLayout(problem9, result.branchCurrents);

    expect(layout.groups.map((group) => group.label)).toEqual([
      "I0",
      "I1",
      "I2",
    ]);
    expect(
      layout.groups[0].segments.map((segment) => segment.componentLabel),
    ).toEqual(["R4", "E1", "R1"]);
    expect(layout.groups[0].current).toBeCloseTo(-0.0172, 3);
    expect(layout.groups[0].isOppositeToReference).toBe(true);
    expect(layout.groups[1].current).toBeCloseTo(0.431, 3);
    expect(layout.groups[2].current).toBeCloseTo(0.4138, 3);
    expect(layout.byComponent.E2).toMatchObject({
      label: "I1",
      direction: -1,
      isLabelHost: true,
    });
  });

  it("conserva Ie/Is como corrientes conocidas y numera solo las incógnitas", () => {
    const result = solveCircuit(problem11);
    const layout = buildReferenceCurrentLayout(
      problem11,
      result.branchCurrents,
    );

    expect(layout.groups.map((group) => group.label)).toEqual([
      "I0",
      "I1",
      "I2",
      "Ie",
      "Is",
    ]);
    expect(layout.byComponent.R3.label).toBe("I0");
    expect(layout.byComponent.R1.label).toBe("I1");
    expect(layout.byComponent.R2.label).toBe("I2");
  });
});
