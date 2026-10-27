import type { SolveResult } from "../engine/kirchhoff";
import type { Circuit } from "../engine/model";
import { buildReferenceCurrentLayout } from "../engine/reference-currents";
import type { SolutionStep } from "../engine/steps";
import type {
  GuideExplanation,
  GuideExplanationStep,
} from "./guide-explanations";

export type LiveNetworkCase = "p8a" | "p8b" | "p11";

export type LiveNetworkResolution = {
  explanation?: GuideExplanation;
  steps?: SolutionStep[];
  equivalentResistance?: number;
};

function number(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 4,
    ...(value !== 0 && Math.abs(value) < 1e-6
      ? { notation: "scientific" as const, maximumSignificantDigits: 6 }
      : {}),
  })
    .format(Object.is(value, -0) ? 0 : value)
    .replaceAll("-", "−");
}

function resistance(circuit: Circuit, label: string): number {
  const component = circuit.components.find((item) => item.label === label);
  if (component?.type !== "resistor")
    throw new Error(`Falta la resistencia ${label}.`);
  return component.ohms;
}

function nodeLabel(circuit: Circuit, id: string): string {
  return circuit.nodes.find((node) => node.id === id)?.label ?? id;
}

function describeCurrent(
  circuit: Circuit,
  label: string,
  current: number,
  path: string[],
): string {
  const algebraic = `${label} = ${number(current)} A (valor algebraico).`;
  if (current === 0)
    return `${algebraic} Corriente nula; no tiene sentido de circulación.`;
  const opposite = current < 0;
  const realPath = (opposite ? [...path].reverse() : path).map((id) =>
    nodeLabel(circuit, id),
  );
  return `${algebraic} |${label}| ≈ ${number(Math.abs(current))} A de ${realPath.join(" → ")}; sentido real ${opposite ? "opuesto al" : "coincidente con el"} asignado.`;
}

function buildProblem11Steps(
  circuit: Circuit,
  result: SolveResult,
): SolutionStep[] {
  const r1 = resistance(circuit, "R1");
  const r2 = resistance(circuit, "R2");
  const r3 = resistance(circuit, "R3");
  const ie = result.branchCurrents.Ie;
  const is = result.branchCurrents.Is;
  const currents = [
    {
      label: "I0",
      value: result.branchCurrents.R3,
      path: ["0", "b"],
      resistor: "R3",
    },
    {
      label: "I1",
      value: result.branchCurrents.R1,
      path: ["0", "t"],
      resistor: "R1",
    },
    {
      label: "I2",
      value: result.branchCurrents.R2,
      path: ["t", "b"],
      resistor: "R2",
    },
  ];
  const a = nodeLabel(circuit, "0"),
    b = nodeLabel(circuit, "t"),
    c = nodeLabel(circuit, "b");
  return [
    {
      id: "assigned-currents",
      title: "1. Corrientes asignadas",
      content: [
        ...currents.map(
          (current) =>
            `${current.label}: ${current.path.map((id) => nodeLabel(circuit, id)).join(" → ")} por ${current.resistor}.`,
        ),
        `Ie = ${number(ie)} A; referencia ${b} → ${a}.`,
        `Is = ${number(is)} A; referencia ${c} → ${b}.`,
        "Son corrientes de rama. Las referencias se conservan aunque cambie el signo del resultado.",
      ].join("\n"),
    },
    {
      id: "kcl",
      title: "2. Ecuaciones de nodo (KCL)",
      content: `Nodo ${a}: Ie − I0 − I1 = 0\nNodo ${c}: I0 + I2 − Is = 0`,
    },
    {
      id: "kvl",
      title: "3. Ecuación de malla (KVL)",
      content: `M1: ${a} → ${b} → ${c} → ${a}, sentido horario.\n−I1·R1 − I2·R2 + I0·R3 = 0\n−I1·${number(r1)} − I2·${number(r2)} + I0·${number(r3)} = 0`,
    },
    {
      id: "numeric-system",
      title: "4. Sistema con valores reemplazados",
      content: `−I0 − I1 = ${number(-ie)}\nI0 + I2 = ${number(is)}\n${number(r3)}·I0 − ${number(r1)}·I1 − ${number(r2)}·I2 = 0`,
    },
    {
      id: "solution",
      title: "5. Solución",
      content: currents
        .map((current) => `${current.label} ≈ ${number(current.value)} A`)
        .join("\n"),
    },
    {
      id: "signs",
      title: "6. Interpretación de signos",
      content: [
        ...currents.map((current) =>
          describeCurrent(circuit, current.label, current.value, current.path),
        ),
        describeCurrent(circuit, "Ie", ie, ["t", "0"]),
        describeCurrent(circuit, "Is", is, ["b", "t"]),
        "El cálculo conserva toda la precisión; solo se redondean los valores mostrados.",
      ].join("\n"),
    },
  ];
}

/** Reducción de las dos topologías de P8; no depende de la tensión aplicada. */
export function problem8EquivalentResistance(
  circuit: Circuit,
  variant: "p8a" | "p8b",
): number {
  const r = (label: string) => resistance(circuit, label);
  const left = variant === "p8a" ? r("R3") : r("R2");
  const right = variant === "p8a" ? r("R1") + r("R4") + r("R5") : r("R3");
  const parallel = parallelResistance(left, right);
  return variant === "p8a"
    ? r("R2") + parallel + r("R6")
    : r("R1") + parallel + r("R4") + r("R5");
}

function parallelResistance(left: number, right: number): number {
  return left + right === 0 ? 0 : (left * right) / (left + right);
}

function buildProblem8Resolution(
  circuit: Circuit,
  result: SolveResult,
  variant: "p8a" | "p8b",
): LiveNetworkResolution {
  const r = (label: string) => resistance(circuit, label);
  const f = (label: string) => number(r(label));
  const source = circuit.components.find((item) => item.label === "V");
  if (source?.type !== "voltageSource") throw new Error("Falta la fuente V.");
  const isA = variant === "p8a";
  const totalLabel = isA ? "R2" : "R1";
  const branch1 = isA ? "R3" : "R2";
  const branch2 = isA ? "R1" : "R3";
  const total = result.branchCurrents[totalLabel];
  const current1 = result.branchCurrents[branch1];
  const current2 = result.branchCurrents[branch2];
  const series = r("R1") + r("R4") + r("R5");
  const equivalentResistance = problem8EquivalentResistance(circuit, variant);
  const parallel = isA
    ? parallelResistance(r("R3"), series)
    : parallelResistance(r("R2"), r("R3"));
  const parallelVoltage = result.branchVoltages[branch1];
  const references = buildReferenceCurrentLayout(
    circuit,
    result.branchCurrents,
  );
  const referenceFor = (label: string) => {
    const reference = references.byComponent[label];
    return `${reference.direction === -1 ? "−" : ""}${reference.label}`;
  };
  const branch2Name = isA ? "I_serie" : "I(R3)";
  const steps: GuideExplanationStep[] = [
    {
      title: "1. Sentidos de referencia",
      content: `I_total se toma desde a hacia la red por ${totalLabel}. Las corrientes del paralelo se toman desde x hacia ${isA ? "z" : "y"}.`,
      equations: [
        `I_total = ${referenceFor(totalLabel)}; I(${branch1}) = ${referenceFor(branch1)}; ${branch2Name} = ${referenceFor(branch2)} (referencias del dibujo).`,
      ],
    },
    ...(isA
      ? [
          {
            title: "2. R1, R4 y R5 en serie",
            equations: [
              `R145 = R1 + R4 + R5 = ${f("R1")} + ${f("R4")} + ${f("R5")} ≈ ${number(series)} Ω`,
            ],
          },
        ]
      : []),
    {
      title: `${isA ? 3 : 2}. Asociación en paralelo`,
      equations: [
        isA
          ? `Rp = R3·R145 / (R3 + R145) ≈ ${f("R3")}·${number(series)} / (${f("R3")} + ${number(series)}) ≈ ${number(parallel)} Ω`
          : `Rp = R2·R3 / (R2 + R3) ≈ ${f("R2")}·${f("R3")} / (${f("R2")} + ${f("R3")}) ≈ ${number(parallel)} Ω`,
      ],
    },
    {
      title: `${isA ? 4 : 3}. Resistencia equivalente`,
      equations: [
        isA
          ? `Req = R2 + Rp + R6 ≈ ${f("R2")} + ${number(parallel)} + ${f("R6")} ≈ ${number(equivalentResistance)} Ω`
          : `Req = R1 + Rp + R4 + R5 ≈ ${f("R1")} + ${number(parallel)} + ${f("R4")} + ${f("R5")} ≈ ${number(equivalentResistance)} Ω`,
      ],
    },
    {
      title: `${isA ? 5 : 4}. Corriente total`,
      equations: [
        `I_total = V / Req ≈ (${number(source.volts)}) / ${number(equivalentResistance)} ≈ ${number(total)} A`,
      ],
    },
    {
      title: `${isA ? 6 : 5}. Tensión y corrientes del paralelo`,
      equations: [
        `Vp = I_total·Rp ≈ (${number(total)})·${number(parallel)} ≈ ${number(parallelVoltage)} V`,
        r(branch1) === 0
          ? `V(${branch1}) = 0 V; I(${branch1}) ≈ ${number(current1)} A, obtenida por KCL.`
          : `I(${branch1}) = Vp / ${branch1} ≈ (${number(parallelVoltage)}) / ${f(branch1)} ≈ ${number(current1)} A`,
        (isA ? series : r(branch2)) === 0
          ? `Vp = 0 V; ${branch2Name} ≈ ${number(current2)} A, obtenida por KCL.`
          : `${branch2Name} = Vp / ${isA ? "R145" : "R3"} ≈ (${number(parallelVoltage)}) / ${number(isA ? series : r(branch2))} ≈ ${number(current2)} A`,
      ],
    },
    {
      title: `${isA ? 7 : 6}. Verificación del nodo`,
      equations: [
        `I_total = I(${branch1}) + ${branch2Name} ≈ (${number(current1)}) + (${number(current2)}) ≈ ${number(total)} A`,
      ],
      content:
        "Se verifica con los valores completos; los números mostrados son aproximaciones.",
    },
    {
      title: `${isA ? 8 : 7}. Interpretación de signos`,
      equations: references.groups.map((group) =>
        describeCurrent(circuit, group.label, group.current, group.path),
      ),
      content:
        "Las flechas rotuladas conservan las referencias. El signo algebraico indica el sentido real. Solo se redondea al mostrar los valores.",
    },
  ];
  return {
    equivalentResistance,
    explanation: {
      heading: "Resolución por reducción serie/paralelo",
      sections: [
        { title: `Figura 5(${isA ? "a" : "b"}) · valores actuales`, steps },
      ],
    },
  };
}

export function buildLiveNetworkResolution(
  kind: LiveNetworkCase,
  circuit: Circuit,
  result: SolveResult,
): LiveNetworkResolution {
  return kind === "p11"
    ? { steps: buildProblem11Steps(circuit, result) }
    : buildProblem8Resolution(circuit, result, kind);
}
