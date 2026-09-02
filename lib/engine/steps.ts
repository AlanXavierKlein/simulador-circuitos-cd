import type { Circuit } from "./model";

export type SolutionStep = {
  id: string;
  title: string;
  content: string;
};

/**
 * Genera la narración del procedimiento de resolución al nivel de detalle de
 * la guía: KCL, KVL, sistema, solución e interpretación de signos.
 */
export function buildSolutionSteps(_circuit: Circuit): SolutionStep[] {
  void _circuit;
  throw new Error("Not implemented");
}
