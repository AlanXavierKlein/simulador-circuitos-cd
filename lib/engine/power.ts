import type { Circuit, Component } from "./model";

export type PowerByBranch = Record<string, number>;

/**
 * Potencia con convención pasiva: positiva si la rama absorbe energía y
 * negativa si la entrega. En una resistencia equivale a I²R.
 */
export function calculateComponentPower(
  component: Component,
  current: number,
  branchVoltage: number,
): number {
  if (component.type === "resistor") {
    return current * current * component.ohms;
  }
  return branchVoltage * current;
}

/** Calcula la potencia de todas las ramas del circuito. */
export function calculatePowers(
  circuit: Circuit,
  branchCurrents: Record<string, number>,
  branchVoltages: Record<string, number>,
): PowerByBranch {
  return Object.fromEntries(
    circuit.components.map((component) => [
      component.label,
      calculateComponentPower(
        component,
        branchCurrents[component.label],
        branchVoltages[component.label],
      ),
    ]),
  );
}

/** La suma debe ser aproximadamente cero en un circuito resuelto. */
export function netPower(powers: PowerByBranch): number {
  return Object.values(powers).reduce((total, power) => total + power, 0);
}
