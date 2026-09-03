import { describe, expect, it } from "vitest";

import {
  defaultAmmeterInput,
  defaultVoltmeterInput,
  solveAmmeter,
  solveVoltmeter,
} from "./instruments";

describe("módulos de diseño de instrumentos", () => {
  it("resuelve el shunt Ayrton del Problema 12", () => {
    const result = solveAmmeter(defaultAmmeterInput);

    expect(result.R1).toBeCloseTo(1 / 90, 8);
    expect(result.R2).toBeCloseTo(0.1, 8);
    expect(result.R3).toBeCloseTo(1, 8);
  });

  it("resuelve las multiplicadoras del Problema 13", () => {
    const result = solveVoltmeter(defaultVoltmeterInput);

    expect(result).toEqual({ R1: 2990, R2: 12000, R3: 135000 });
  });

  it("rechaza escalas desordenadas", () => {
    expect(() =>
      solveVoltmeter({
        ...defaultVoltmeterInput,
        scales: [15, 3, 150],
      }),
    ).toThrow("ordenadas");
  });
});
