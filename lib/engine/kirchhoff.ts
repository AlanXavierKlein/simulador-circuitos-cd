import { lusolve } from "mathjs";

import {
  buildCircuitGraph,
  findFundamentalLoops,
  findPathBetweenNodes,
} from "./graph";
import type { FundamentalLoop } from "./graph";
import { isCurrentSource, isResistor, isVoltageSource } from "./model";
import type { Circuit, Component, NodeId } from "./model";
import { calculatePowers } from "./power";

const NUMERICAL_TOLERANCE = 1e-9;

export type EquationKind = "kcl" | "kvl";

export type CircuitEquation = {
  id: string;
  kind: EquationKind;
  description: string;
  coefficients: Record<string, number>;
  rhs: number;
};

export type EquationSystem = {
  variables: string[];
  matrix: number[][];
  rhs: number[];
  kcl: CircuitEquation[];
  kvl: CircuitEquation[];
};

export type CurrentDirectionResult = {
  nFrom: NodeId;
  nTo: NodeId;
  isOppositeToReference: boolean;
};

export type SolveResult = {
  branchCurrents: Record<string, number>;
  /** V(nFrom) - V(nTo) para cada rama. */
  branchVoltages: Record<string, number>;
  nodePotentials: Record<NodeId, number>;
  /** Potencia positiva = absorbida; potencia negativa = entregada. */
  powers: Record<string, number>;
  currentDirections: Record<string, CurrentDirectionResult>;
  equations: EquationSystem;
};

function currentVariable(label: string): string {
  return `I(${label})`;
}

function currentSourceVoltageVariable(label: string): string {
  return `V(${label})`;
}

function addCoefficient(
  coefficients: Record<string, number>,
  variable: string,
  value: number,
): void {
  coefficients[variable] = (coefficients[variable] ?? 0) + value;
}

function validateCircuit(circuit: Circuit): void {
  if (circuit.nodes.length === 0) {
    throw new Error("El circuito debe contener al menos un nodo.");
  }

  const nodeIds = circuit.nodes.map((node) => node.id);
  if (new Set(nodeIds).size !== nodeIds.length) {
    throw new Error("Los ids de los nodos deben ser únicos.");
  }
  if (!nodeIds.includes("0")) {
    throw new Error('El circuito debe incluir el nodo de referencia "0".');
  }

  const labels = circuit.components.map((component) => component.label);
  if (new Set(labels).size !== labels.length) {
    throw new Error("Las etiquetas de las ramas deben ser únicas.");
  }
  if (circuit.components.length === 0) {
    throw new Error("El circuito debe contener al menos una rama.");
  }

  for (const component of circuit.components) {
    const value = isResistor(component)
      ? component.ohms
      : isVoltageSource(component)
        ? component.volts
        : component.amps;

    if (!Number.isFinite(value)) {
      throw new Error(`El valor de ${component.label} debe ser finito.`);
    }
    if (isResistor(component) && component.ohms <= 0) {
      throw new Error(`La resistencia ${component.label} debe ser positiva.`);
    }
  }

  const graph = buildCircuitGraph(circuit);
  const visited = new Set<NodeId>();
  const queue = [graph.nodeIds[0]];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (nodeId === undefined || visited.has(nodeId)) continue;
    visited.add(nodeId);
    for (const adjacent of graph.adjacency.get(nodeId) ?? []) {
      if (!visited.has(adjacent.nodeId)) queue.push(adjacent.nodeId);
    }
  }
  if (visited.size !== graph.nodeIds.length) {
    throw new Error("El circuito debe formar un grafo conectado.");
  }
}

function buildVariables(circuit: Circuit): string[] {
  const currentVariables = circuit.components
    .filter((component) => !isCurrentSource(component))
    .map((component) => currentVariable(component.label));
  const currentSourceVoltages = circuit.components
    .filter(isCurrentSource)
    .map((component) => currentSourceVoltageVariable(component.label));

  return [...currentVariables, ...currentSourceVoltages];
}

function buildKclEquations(circuit: Circuit): CircuitEquation[] {
  return circuit.nodes
    .filter((node) => node.id !== "0")
    .map((node) => {
      const coefficients: Record<string, number> = {};
      let knownCurrent = 0;

      for (const component of circuit.components) {
        const sign =
          component.nFrom === node.id ? 1 : component.nTo === node.id ? -1 : 0;
        if (sign === 0) continue;

        if (isCurrentSource(component)) {
          knownCurrent += sign * component.amps;
        } else {
          addCoefficient(coefficients, currentVariable(component.label), sign);
        }
      }

      return {
        id: `KCL(${node.id})`,
        kind: "kcl" as const,
        description: `Suma de corrientes salientes del nodo ${node.id}.`,
        coefficients,
        rhs: -knownCurrent,
      };
    });
}

function buildKvlEquation(
  circuit: Circuit,
  loop: FundamentalLoop,
): CircuitEquation {
  const coefficients: Record<string, number> = {};
  let knownVoltageChange = 0;

  for (const orientedBranch of loop.branches) {
    const component = circuit.components[orientedBranch.branchIndex];
    const orientation = orientedBranch.orientation;

    if (isResistor(component)) {
      // Al recorrer a favor de I: caída -R·I; en contra: +R·I.
      addCoefficient(
        coefficients,
        currentVariable(component.label),
        -orientation * component.ohms,
      );
    } else if (isVoltageSource(component)) {
      // volts = V(nFrom)-V(nTo): a favor se cruza de + a -.
      knownVoltageChange += -orientation * component.volts;
    } else {
      // La corriente de la fuente es conocida; su tensión es auxiliar.
      addCoefficient(
        coefficients,
        currentSourceVoltageVariable(component.label),
        -orientation,
      );
    }
  }

  return {
    id: loop.id,
    kind: "kvl",
    description: `Suma de cambios de tensión en la malla ${loop.id}.`,
    coefficients,
    rhs: -knownVoltageChange,
  };
}

function equationRow(equation: CircuitEquation, variables: string[]): number[] {
  return variables.map((variable) => equation.coefficients[variable] ?? 0);
}

function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  try {
    const rawSolution = lusolve(matrix, rhs) as unknown;
    const arraySolution =
      typeof rawSolution === "object" &&
      rawSolution !== null &&
      "toArray" in rawSolution &&
      typeof rawSolution.toArray === "function"
        ? rawSolution.toArray()
        : rawSolution;

    if (!Array.isArray(arraySolution)) {
      throw new Error("mathjs devolvió una solución inesperada.");
    }

    return arraySolution.map((row) => {
      const value = Array.isArray(row) ? row[0] : row;
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        throw new Error("El sistema no produjo una solución finita.");
      }
      return Math.abs(numericValue) < NUMERICAL_TOLERANCE ? 0 : numericValue;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`No se pudo resolver el sistema de Kirchhoff: ${message}`);
  }
}

function buildBranchVoltages(
  circuit: Circuit,
  branchCurrents: Record<string, number>,
  solutionByVariable: Record<string, number>,
): Record<string, number> {
  return Object.fromEntries(
    circuit.components.map((component) => {
      let voltage: number;
      if (isResistor(component)) {
        voltage = component.ohms * branchCurrents[component.label];
      } else if (isVoltageSource(component)) {
        voltage = component.volts;
      } else {
        voltage =
          solutionByVariable[currentSourceVoltageVariable(component.label)];
      }
      return [component.label, voltage];
    }),
  );
}

function buildNodePotentials(
  circuit: Circuit,
  branchVoltages: Record<string, number>,
): Record<NodeId, number> {
  const graph = buildCircuitGraph(circuit);
  const potentials: Record<NodeId, number> = { "0": 0 };
  const queue: NodeId[] = ["0"];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (nodeId === undefined) break;

    for (const adjacent of graph.adjacency.get(nodeId) ?? []) {
      const branch = graph.branches[adjacent.branchIndex];
      const drop = branchVoltages[branch.label];
      const nextPotential = potentials[nodeId] - adjacent.orientation * drop;
      const knownPotential = potentials[adjacent.nodeId];

      if (knownPotential === undefined) {
        potentials[adjacent.nodeId] = nextPotential;
        queue.push(adjacent.nodeId);
      } else if (
        Math.abs(knownPotential - nextPotential) >
        NUMERICAL_TOLERANCE * 100
      ) {
        throw new Error(
          `Las tensiones calculadas son inconsistentes en el nodo ${adjacent.nodeId}.`,
        );
      }
    }
  }

  return potentials;
}

/**
 * Resuelve un circuito por corrientes de rama: n-1 ecuaciones KCL y una KVL
 * por malla fundamental. mathjs se usa únicamente para A·x=b.
 */
export function solveCircuit(circuit: Circuit): SolveResult {
  validateCircuit(circuit);

  const variables = buildVariables(circuit);
  const kcl = buildKclEquations(circuit);
  const kvl = findFundamentalLoops(circuit).map((loop) =>
    buildKvlEquation(circuit, loop),
  );
  const equations = [...kcl, ...kvl];
  const matrix = equations.map((equation) => equationRow(equation, variables));
  const rhs = equations.map((equation) => equation.rhs);

  if (matrix.length !== variables.length) {
    throw new Error(
      `Sistema no cuadrado: ${matrix.length} ecuaciones para ${variables.length} incógnitas.`,
    );
  }

  const solution = solveLinearSystem(matrix, rhs);
  const solutionByVariable = Object.fromEntries(
    variables.map((variable, index) => [variable, solution[index]]),
  );
  const branchCurrents = Object.fromEntries(
    circuit.components.map((component) => [
      component.label,
      isCurrentSource(component)
        ? component.amps
        : solutionByVariable[currentVariable(component.label)],
    ]),
  );
  const branchVoltages = buildBranchVoltages(
    circuit,
    branchCurrents,
    solutionByVariable,
  );
  const nodePotentials = buildNodePotentials(circuit, branchVoltages);
  const powers = calculatePowers(circuit, branchCurrents, branchVoltages);
  const currentDirections = Object.fromEntries(
    circuit.components.map((component) => [
      component.label,
      {
        nFrom: component.nFrom,
        nTo: component.nTo,
        isOppositeToReference:
          branchCurrents[component.label] < -NUMERICAL_TOLERANCE,
      },
    ]),
  );

  return {
    branchCurrents,
    branchVoltages,
    nodePotentials,
    powers,
    currentDirections,
    equations: { variables, matrix, rhs, kcl, kvl },
  };
}

/**
 * Calcula V(nodoB)-V(nodoA) sumando los cambios de tensión a lo largo de un
 * camino del circuito.
 */
export function calculatePotentialDifference(
  circuit: Circuit,
  branchVoltages: Record<string, number>,
  nodeA: NodeId,
  nodeB: NodeId,
): number {
  const path = findPathBetweenNodes(circuit, nodeA, nodeB);
  return path.reduce(
    (difference, branch) =>
      difference - branch.orientation * branchVoltages[branch.label],
    0,
  );
}

export function voltageBetween(
  result: SolveResult,
  nodeA: NodeId,
  nodeB: NodeId,
): number {
  const potentialA = result.nodePotentials[nodeA];
  const potentialB = result.nodePotentials[nodeB];
  if (potentialA === undefined || potentialB === undefined) {
    throw new Error(`No se encontró el potencial de ${nodeA} o ${nodeB}.`);
  }
  return potentialB - potentialA;
}

/** Expone la caída de tensión de una rama según su tipo. */
export function componentVoltage(
  component: Component,
  current: number,
  currentSourceVoltage?: number,
): number {
  if (isResistor(component)) return component.ohms * current;
  if (isVoltageSource(component)) return component.volts;
  if (currentSourceVoltage === undefined) {
    throw new Error(`Falta la tensión de la fuente ${component.label}.`);
  }
  return currentSourceVoltage;
}
