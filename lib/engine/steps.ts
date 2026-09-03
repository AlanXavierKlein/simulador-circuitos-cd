import { findFundamentalLoops } from "./graph";
import type { CircuitEquation, SolveResult } from "./kirchhoff";
import type { Circuit, Component } from "./model";

export type SolutionStep = {
  id: string;
  title: string;
  content: string;
};

const EPSILON = 1e-9;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 4,
  }).format(Math.abs(value) < EPSILON ? 0 : value);
}

function joinTerms(
  terms: Array<{ coefficient: number; expression: string }>,
): string {
  const significant = terms.filter(
    (term) => Math.abs(term.coefficient) >= EPSILON,
  );
  if (significant.length === 0) return "0";

  return significant
    .map((term, index) => {
      const negative = term.coefficient < 0;
      const magnitude = Math.abs(term.coefficient);
      const factor =
        Math.abs(magnitude - 1) < EPSILON ? "" : `${formatNumber(magnitude)}·`;
      const sign =
        index === 0 ? (negative ? "−" : "") : negative ? " − " : " + ";
      return `${sign}${factor}${term.expression}`;
    })
    .join("");
}

function formatEquation(equation: CircuitEquation): string {
  const terms = Object.entries(equation.coefficients).map(
    ([expression, coefficient]) => ({ coefficient, expression }),
  );
  return `${equation.id}: ${joinTerms(terms)} = ${formatNumber(equation.rhs)}`;
}

function symbolicKvlTerm(
  component: Component,
  orientation: 1 | -1,
): { coefficient: number; expression: string } {
  const coefficient = -orientation;
  if (component.type === "resistor") {
    return {
      coefficient,
      expression: `${component.label}·I(${component.label})`,
    };
  }
  return {
    coefficient,
    expression:
      component.type === "voltageSource"
        ? component.label
        : `V(${component.label})`,
  };
}

function lines(items: string[]): string {
  return items.join("\n");
}

/**
 * Genera la narración del procedimiento de resolución al nivel de detalle de
 * la guía: KCL, KVL, sistema, solución e interpretación de signos.
 */
export function buildSolutionSteps(
  circuit: Circuit,
  result: SolveResult,
): SolutionStep[] {
  const assignedCurrents = circuit.components.map(
    (component) =>
      `I(${component.label}): ${component.nFrom} → ${component.nTo}.`,
  );
  const kclEquations = result.equations.kcl.map(formatEquation);
  const loops = findFundamentalLoops(circuit);
  const kvlEquations = loops.map((loop) => {
    const terms = loop.branches.map((branch) =>
      symbolicKvlTerm(
        circuit.components[branch.branchIndex],
        branch.orientation,
      ),
    );
    return `${loop.id}: ${joinTerms(terms)} = 0`;
  });
  const numericSystem = [...result.equations.kcl, ...result.equations.kvl].map(
    formatEquation,
  );
  const solution = circuit.components.map(
    (component) =>
      `I(${component.label}) = ${formatNumber(result.branchCurrents[component.label])} A`,
  );
  const opposite = circuit.components.filter(
    (component) => result.branchCurrents[component.label] < -EPSILON,
  );
  const interpretation = opposite.length
    ? opposite.map(
        (component) =>
          `${component.label}: ${formatNumber(Math.abs(result.branchCurrents[component.label]))} A de ${component.nTo} → ${component.nFrom}; sentido real opuesto al asignado.`,
      )
    : ["Todas las corrientes circulan en el sentido de referencia asignado."];

  return [
    {
      id: "assigned-currents",
      title: "1. Corrientes asignadas",
      content: lines(assignedCurrents),
    },
    {
      id: "kcl",
      title: "2. Ecuaciones de nodo (KCL)",
      content: lines(kclEquations),
    },
    {
      id: "kvl",
      title: "3. Ecuaciones de malla (KVL)",
      content: lines(kvlEquations),
    },
    {
      id: "numeric-system",
      title: "4. Sistema con valores reemplazados",
      content: lines(numericSystem),
    },
    {
      id: "solution",
      title: "5. Solución",
      content: lines(solution),
    },
    {
      id: "signs",
      title: "6. Interpretación de signos",
      content: lines(interpretation),
    },
  ];
}
