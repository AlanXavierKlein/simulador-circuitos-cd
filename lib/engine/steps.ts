import { findCircuitLoops, findPathBetweenNodes } from "./graph";
import type { CircuitLoop } from "./graph";
import { calculatePotentialDifference } from "./kirchhoff";
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

function formatNumber(value: number, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits,
    ...(value !== 0 && Math.abs(value) < 1e-6
      ? { notation: "scientific" as const, maximumSignificantDigits: 8 }
      : {}),
  })
    .format(Object.is(value, -0) ? 0 : value)
    .replaceAll("-", "−");
}

function joinTerms(
  terms: Array<{ coefficient: number; expression: string }>,
): string {
  const significant = terms.filter((term) => term.coefficient !== 0);
  if (significant.length === 0) return "0";

  return significant
    .map((term, index) => {
      const negative = term.coefficient < 0;
      const magnitude = Math.abs(term.coefficient);
      const factor =
        term.expression === ""
          ? formatNumber(magnitude)
          : magnitude === 1
            ? ""
            : `${formatNumber(magnitude)}·`;
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
    equation.rhs !== 0 ||
    Object.values(equation.coefficients).some(
      (coefficient) => coefficient !== 0,
    )
  );
}

function symbolicKvlTerm(
  component: Component,
  orientation: 1 | -1,
  reference?: ComponentCurrentReference,
  currentFirst = false,
): { coefficient: number; expression: string } {
  if (component.type === "resistor") {
    return {
      coefficient: -orientation * (reference?.direction ?? 1),
      expression: currentFirst
        ? `${reference?.label ?? `I(${component.label})`}·${component.label}`
        : `${component.label}·${reference?.label ?? `I(${component.label})`}`,
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

function groupedSymbolicKvl(
  circuit: Circuit,
  loop: CircuitLoop,
  references: ReferenceCurrentLayout,
): string {
  const resistors = new Map<
    string,
    Array<{ coefficient: number; expression: string }>
  >();
  const sources: Array<{ coefficient: number; expression: string }> = [];
  for (const branch of loop.branches) {
    const component = circuit.components[branch.branchIndex];
    if (component.type === "resistor") {
      const reference = references.byComponent[component.label];
      const terms = resistors.get(reference.label) ?? [];
      terms.push({
        coefficient: -branch.orientation * reference.direction,
        expression: component.label,
      });
      resistors.set(reference.label, terms);
    } else {
      sources.push({
        coefficient: branch.orientation,
        expression:
          component.type === "voltageSource"
            ? component.label
            : `V(${component.label})`,
      });
    }
  }
  const terms = [...resistors].map(([current, factors]) => {
    factors.sort((left, right) =>
      left.expression.localeCompare(right.expression),
    );
    const sign = factors[0].coefficient;
    const factor = joinTerms(
      factors.map((term) => ({
        ...term,
        coefficient: term.coefficient * sign,
      })),
    );
    return {
      coefficient: sign,
      expression: `${factors.length > 1 ? `(${factor})` : factor}·${current}`,
    };
  });
  // Fuentes positivas primero: E2 − E1 para la malla izquierda.
  sources.sort((left, right) => right.coefficient - left.coefficient);
  return `${loop.id} agrupada: ${joinTerms(terms)} = ${joinTerms(sources)}`;
}

function potentialDifferenceStep(
  circuit: Circuit,
  result: SolveResult,
  references: ReferenceCurrentLayout,
): SolutionStep[] {
  const measurement = circuit.analysis?.potentialDifference;
  if (!measurement) return [];
  const { nodeA, nodeB } = measurement;
  const path = findPathBetweenNodes(circuit, nodeA, nodeB);
  const symbolic = path.map((branch) =>
    symbolicKvlTerm(
      circuit.components[branch.branchIndex],
      branch.orientation,
      references.byComponent[branch.label],
      true,
    ),
  );
  const numeric = path.map((branch) => {
    const component = circuit.components[branch.branchIndex];
    if (component.type === "resistor") {
      const reference = references.byComponent[component.label];
      return {
        coefficient: -branch.orientation * reference.direction,
        expression: `(${formatNumber(reference.current, 10)})·${formatNumber(component.ohms)}`,
      };
    }
    return {
      coefficient: 1,
      expression: `(${formatNumber(-branch.orientation * result.branchVoltages[component.label], 10)})`,
    };
  });
  const difference = calculatePotentialDifference(
    circuit,
    result.branchVoltages,
    nodeA,
    nodeB,
  );
  const label = `V${nodeB} − V${nodeA}`;
  return [
    {
      id: "potential-difference",
      title: "7. Diferencia de potencial",
      content: lines([
        `Recorrido: ${[nodeA, ...path.map((branch) => branch.to)].join(" → ")} por ${path.map((branch) => branch.label).join(", ")}.`,
        `${label} = ${joinTerms(symbolic)}`,
        `${label} ≈ ${joinTerms(numeric)} ≈ ${formatNumber(difference, 10)} V ≈ ${formatNumber(difference)} V`,
        "Se usan las corrientes algebraicas, sin valor absoluto. El cálculo conserva toda la precisión; solo se redondean los valores mostrados.",
      ]),
    },
  ];
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
  if (circuit.analysis)
    assignedCurrents.push(
      "Son corrientes de rama, no corrientes de malla.",
      "Las flechas rotuladas indican los sentidos de referencia; la animación sigue los sentidos reales.",
    );
  const kclEquations = result.equations.kcl
    .map((equation) => collapseEquation(equation, references))
    .filter(isMeaningfulEquation)
    .map(formatEquation);
  const loops = findCircuitLoops(circuit);
  const kvlEquations = loops.flatMap((loop) => {
    const terms = loop.branches.map((branch) => {
      const component = circuit.components[branch.branchIndex];
      return symbolicKvlTerm(
        component,
        branch.orientation,
        references.byComponent[component.label],
        Boolean(circuit.analysis),
      );
    });
    const equation = `${loop.id}: ${joinTerms(terms)} = 0`;
    const substituted = loop.branches.map((branch) => {
      const component = circuit.components[branch.branchIndex];
      const reference = references.byComponent[component.label];
      return component.type === "resistor"
        ? {
            coefficient: -branch.orientation * reference.direction,
            expression: `${reference.label}·${formatNumber(component.ohms)}`,
          }
        : component.type === "voltageSource"
          ? {
              coefficient: -branch.orientation * component.volts,
              expression: "",
            }
          : {
              coefficient: -branch.orientation,
              expression: `V(${component.label})`,
            };
    });
    return circuit.analysis
      ? [
          `${loop.id}: ${loop.description} Sentido horario.`,
          `Recorrido: ${[loop.branches[0].from, ...loop.branches.map((branch) => branch.to)].join(" → ")}.`,
          equation,
          groupedSymbolicKvl(circuit, loop, references),
          `${loop.id} con valores (Ω, V): ${joinTerms(substituted)} = 0`,
        ]
      : [equation];
  });
  const numericSystem = (
    circuit.analysis
      ? [...result.equations.kvl, ...result.equations.kcl]
      : [...result.equations.kcl, ...result.equations.kvl]
  )
    .map((equation) => collapseEquation(equation, references))
    .filter(isMeaningfulEquation)
    .map(formatEquation);
  const solution = references.groups.map(
    (group) =>
      `${group.label} = ${formatNumber(group.current, circuit.analysis ? 10 : 4)} A`,
  );
  const interpretation = references.groups.map((group) => {
    const algebraic = `${group.label} = ${formatNumber(group.current, circuit.analysis ? 10 : 4)} A (valor algebraico).`;
    if (group.current === 0)
      return `${algebraic} Corriente nula; no tiene sentido de circulación.`;
    const opposite = group.current < 0;
    const path = opposite ? [...group.path].reverse() : group.path;
    return `${algebraic} |${group.label}| = ${formatNumber(Math.abs(group.current))} A de ${path.join(" → ")}; ${opposite ? "sentido real opuesto al asignado" : "sentido real coincidente con el asignado"}.`;
  });

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
    ...potentialDifferenceStep(circuit, result, references),
  ];
}
