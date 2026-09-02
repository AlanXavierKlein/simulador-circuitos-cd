import type { Circuit } from "./model";

export type CircuitSolution = {
  branchCurrents: Record<string, number>;
  nodeVoltages: Record<string, number>;
};

/**
 * Resuelve un circuito mediante corrientes de rama: KCL en los nodos y KVL en
 * las mallas. La implementación se incorporará en una fase posterior.
 */
export function solveCircuit(_circuit: Circuit): CircuitSolution {
  void _circuit;
  throw new Error("Not implemented");
}
