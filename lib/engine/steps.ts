import { findFundamentalLoops } from "./graph";
import type { CircuitEquation, SolveResult } from "./kirchhoff";
import type { Circuit, Component } from "./model";
import { buildReferenceCurrentLayout } from "./reference-currents";
import type {
  ComponentCurrentReference,
  ReferenceCurrentLayout,
} from "./reference-currents";

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

function collapseEquation(
  equation: CircuitEquation,
  references: ReferenceCurrentLayout,
): CircuitEquation {
  const coefficients: Record<string, number> = {};

  for (const [variable, coefficient] of Object.entries(equation.coefficients)) {
    const currentMatch = /^I\((.+)\)$/.exec(variable);
    const reference = currentMatch
      ? references.byComponent[currentMatch[1]]
      : undefined;
    const displayVariable = reference?.label ?? variable;
    const displayCoefficient = coefficient * (reference?.direction ?? 1);
    coefficients[displayVariable] =
      (coefficients[displayVariable] ?? 0) + displayCoefficient;
  }

  return { ...equation, coefficients };
}

function isMeaningfulEquation(equation: CircuitEquation): boolean {
  return (
    Math.abs(equation.rhs) >= EPSILON ||
    Object.values(equation.coefficients).some(
      (coefficient) => Math.abs(coefficient) >= EPSILON,
    )
  );
}

function symbolicKvlTerm(
  component: Component,
  orientation: 1 | -1,
  reference?: ComponentCurrentReference,
): { coefficient: number; expression: string } {
  if (component.type === "resistor") {
    return {
      coefficient: -orientation * (reference?.direction ?? 1),
      expression: `${component.label}·${reference?.label ?? `I(${component.label})`}`,
    };
  }
  return {
    coefficient: -orientation,
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
  const references = buildReferenceCurrentLayout(
    circuit,
    result.branchCurrents,
  );
  const assignedCurrents = references.groups.map(
    (group) => `${group.label}: ${group.path.join(" → ")}.`,
  );
  const kclEquations = result.equations.kcl
    .map((equation) => collapseEquation(equation, references))
    .filter(isMeaningfulEquation)
    .map(formatEquation);
  const loops = findFundamentalLoops(circuit);
  const kvlEquations = loops.map((loop) => {
    const terms = loop.branches.map((branch) => {
      const component = circuit.components[branch.branchIndex];
      return symbolicKvlTerm(
        component,
        branch.orientation,
        references.byComponent[component.label],
      );
    });
    return `${loop.id}: ${joinTerms(terms)} = 0`;
  });
  const numericSystem = [...result.equations.kcl, ...result.equations.kvl]
    .map((equation) => collapseEquation(equation, references))
    .filter(isMeaningfulEquation)
    .map(formatEquation);
  const solution = references.groups.map(
    (group) => `${group.label} = ${formatNumber(group.current)} A`,
  );
  const opposite = references.groups.filter(
    (group) => group.isOppositeToReference,
  );
  const interpretation = opposite.length
    ? opposite.map(
        (group) =>
          `${group.label}: ${formatNumber(Math.abs(group.current))} A de ${[...group.path].reverse().join(" → ")}; sentido real opuesto al asignado.`,
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
