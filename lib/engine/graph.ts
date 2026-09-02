import type { Circuit } from "./model";

export type FundamentalLoop = {
  id: string;
  componentIds: string[];
};

/**
 * Detecta las mallas fundamentales del grafo de un circuito a partir de un
 * árbol de expansión. Se implementará junto con el motor de cálculo.
 */
export function findFundamentalLoops(_circuit: Circuit): FundamentalLoop[] {
  void _circuit;
  throw new Error("Not implemented");
}
