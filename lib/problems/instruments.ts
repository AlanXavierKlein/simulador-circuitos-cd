export type AmmeterInput = {
  rg: number;
  galvanometerCurrent: number;
  scales: [number, number, number];
};

export type VoltmeterInput = {
  rg: number;
  galvanometerCurrent: number;
  scales: [number, number, number];
};

export type InstrumentResistances = {
  R1: number;
  R2: number;
  R3: number;
};

export const defaultAmmeterInput: AmmeterInput = {
  rg: 10,
  galvanometerCurrent: 0.01,
  scales: [0.1, 1, 10],
};

export const defaultVoltmeterInput: VoltmeterInput = {
  rg: 10,
  galvanometerCurrent: 0.001,
  scales: [3, 15, 150],
};

function validatePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} debe ser mayor que cero.`);
  }
}

function validateAscendingScales(
  scales: [number, number, number],
  label: string,
): void {
  scales.forEach((scale, index) =>
    validatePositive(scale, `${label} ${index + 1}`),
  );
  if (!(scales[0] < scales[1] && scales[1] < scales[2])) {
    throw new Error(`Las ${label.toLowerCase()} deben estar ordenadas.`);
  }
}

/** Resuelve el sistema del shunt Ayrton usado en la resolución oficial. */
export function solveAmmeter(input: AmmeterInput): InstrumentResistances {
  validatePositive(input.rg, "rg");
  validatePositive(input.galvanometerCurrent, "Ig");
  validateAscendingScales(input.scales, "Escala");

  const [scale1, scale2, scale3] = input.scales;
  const ig = input.galvanometerCurrent;
  if (scale1 <= ig) {
    throw new Error("La primera escala debe ser mayor que Ig.");
  }

  const vg = input.rg * ig;
  const totalSeriesResistance = vg / (scale1 - ig);
  const R1 = (vg + ig * totalSeriesResistance) / scale3;
  const R3 = ((scale2 - ig) * totalSeriesResistance - vg) / scale2;
  const R2 = totalSeriesResistance - R1 - R3;

  if ([R1, R2, R3].some((value) => value <= 0)) {
    throw new Error("Las escalas elegidas no producen resistencias positivas.");
  }

  return { R1, R2, R3 };
}

/** Resuelve las resistencias multiplicadoras acumuladas del voltímetro. */
export function solveVoltmeter(input: VoltmeterInput): InstrumentResistances {
  validatePositive(input.rg, "rg");
  validatePositive(input.galvanometerCurrent, "Ig");
  validateAscendingScales(input.scales, "Escala");

  const [scale1, scale2, scale3] = input.scales;
  const ig = input.galvanometerCurrent;
  const R1 = scale1 / ig - input.rg;
  const R2 = (scale2 - scale1) / ig;
  const R3 = (scale3 - scale2) / ig;

  if ([R1, R2, R3].some((value) => value <= 0)) {
    throw new Error("Las escalas elegidas no producen resistencias positivas.");
  }

  return { R1, R2, R3 };
}
