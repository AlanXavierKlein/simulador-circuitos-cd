import type { Circuit } from "./model";

export type ComponentPower = {
  componentId: string;
  power: number;
};

/**
 * Calcula la potencia absorbida o entregada por cada componente del circuito.
 * Se implementará cuando el solver produzca corrientes y tensiones.
 */
export function calculatePower(
  _circuit: Circuit,
  _branchCurrents: Record<string, number>,
): ComponentPower[] {
  void _circuit;
  void _branchCurrents;
  throw new Error("Not implemented");
}
