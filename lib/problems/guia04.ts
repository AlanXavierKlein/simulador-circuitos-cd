import type { Circuit } from "../engine/model";
import {
  guideNetworkResolutions,
  type GuideResolution,
} from "./guide-explanations";

export type GuideProblemId = "p8" | "p9" | "p11" | "p12" | "p13";

export type GuideTheory = {
  title: string;
  sections: Array<{
    heading: string;
    content?: string;
    formulas?: string[];
  }>;
};

export const guideTheories: Record<GuideProblemId, GuideTheory> = {
  p8: {
    title: "P8 — Resistencias en serie y paralelo",
    sections: [
      {
        heading: "Ley de Ohm",
        content:
          "la tensión sobre una resistencia es proporcional a la corriente que circula por ella.",
      },
      {
        heading: "Resistencias en serie",
        content:
          "cuando están una a continuación de otra en la misma rama, circula la misma corriente por todas y sus resistencias se suman. Las tensiones se reparten.",
      },
      {
        heading: "Resistencias en paralelo",
        content:
          "cuando están conectadas entre los mismos dos nodos, tienen la misma tensión entre sus extremos y las corrientes se reparten. La inversa de la equivalente es la suma de las inversas.",
      },
      {
        heading: "Cómo se resuelve",
        content:
          'se reduce la red por grupos (serie / paralelo) hasta una resistencia equivalente, se calcula la corriente total con la ley de Ohm y se "vuelve hacia atrás" para hallar la corriente por cada resistencia.',
      },
      {
        heading: "Fórmulas",
        formulas: [
          "V = I · R",
          "Serie: R_eq = R₁ + R₂ + … + Rₙ",
          "Paralelo: 1 / R_eq = 1/R₁ + 1/R₂ + … + 1/Rₙ",
          "Potencia: P = V · I = I²·R = V²/R",
        ],
      },
    ],
  },
  p9: {
    title: "P9 — Leyes de Kirchhoff",
    sections: [
      {
        heading: "Ley de nodos (KCL)",
        content:
          "por conservación de la carga, la suma de las corrientes que entran a un nodo es igual a la suma de las que salen (la suma algebraica en un nodo es cero).",
      },
      {
        heading: "Ley de mallas (KVL)",
        content:
          "por conservación de la energía, la suma de las diferencias de potencial a lo largo de una malla cerrada es cero.",
      },
      {
        heading: "Cómo se aplica",
        content:
          "se asigna un sentido arbitrario a cada corriente y se plantean tantas ecuaciones (de nodo y de malla) como incógnitas. Si una corriente da negativa, su sentido real es el opuesto al asumido. Al recorrer una malla, la caída R·I es negativa si se va a favor de la corriente y positiva si se va en contra; una fuente aporta +E si se pasa de su borne − al +, y −E en el caso contrario.",
      },
      {
        heading: "Fórmulas",
        formulas: ["Nodos: Σ I = 0", "Mallas: Σ V = 0", "V = I · R"],
      },
    ],
  },
  p11: {
    title: "P11 — Kirchhoff con fuentes de corriente",
    sections: [
      {
        heading: "Idea",
        content:
          "se resuelve con las leyes de Kirchhoff igual que cualquier red. Cuando hay fuentes de corriente, esas corrientes son datos conocidos (no incógnitas) y entran directamente en las ecuaciones de nodo.",
      },
      {
        heading: "Cómo se aplica",
        content:
          "se plantean ecuaciones de nodo (KCL) y de malla (KVL) hasta igualar la cantidad de incógnitas, y se resuelve el sistema. Las corrientes negativas indican sentido opuesto al asumido.",
      },
      {
        heading: "Fórmulas",
        formulas: [
          "Nodos: Σ I_entran = Σ I_salen",
          "Mallas: Σ V = 0",
          "V = I · R",
        ],
      },
    ],
  },
  p12: {
    title: "P12 — Amperímetro (resistencia shunt)",
    sections: [
      {
        heading: "Idea",
        content:
          "un galvanómetro se desvía a fondo de escala con una corriente muy chica (Ig) y tiene una resistencia interna rg. Para poder medir corrientes grandes, se le conecta en paralelo una resistencia llamada shunt, que deriva el exceso de corriente.",
      },
      {
        heading: "Cómo funciona",
        content:
          "como el galvanómetro y el shunt están en paralelo, tienen la misma tensión: Vg = rg · Ig. Del total que entra, Ig pasa por el galvanómetro y el resto (I − Ig) pasa por el shunt. En un shunt Ayrton (universal), varias resistencias en cadena permiten tener varias escalas con el mismo galvanómetro.",
      },
      {
        heading: "Fórmulas",
        formulas: [
          "Vg = rg · Ig",
          "Corriente por el shunt: I_shunt = I − Ig",
          "Misma tensión en paralelo: rg · Ig = R_shunt · (I − Ig)",
        ],
      },
    ],
  },
  p13: {
    title: "P13 — Voltímetro (resistencia multiplicadora)",
    sections: [
      {
        heading: "Idea",
        content:
          "para medir tensión, el galvanómetro se conecta en serie con una resistencia grande llamada multiplicadora, que limita la corriente a Ig justo cuando se aplica la tensión de fondo de escala.",
      },
      {
        heading: "Cómo funciona",
        content:
          "toda la tensión medida cae en la multiplicadora más la resistencia interna del galvanómetro: V = Ig · (rg + R). Para tener varias escalas se agregan resistencias en serie (en cascada): cada escala mayor suma una resistencia más.",
      },
      {
        heading: "Fórmulas",
        formulas: [
          "V = Ig · (rg + R)",
          "Resistencia multiplicadora: R = V / Ig − rg",
        ],
      },
    ],
  },
};

export type GuideListItem = {
  id: GuideProblemId | "constructor";
  number: string;
  title: string;
  type: string;
  description: string;
  image?: string;
  href: string;
};

export type ValidationSource =
  | { kind: "branchCurrent"; branchLabel: string }
  | {
      kind: "potentialDifference";
      nodeA: string;
      nodeB: string;
    }
  | {
      kind: "equivalentResistance";
      volts: number;
      branchLabel: string;
    };

export type GuideValidationDefinition = {
  id: string;
  label: string;
  expected: number;
  unit: string;
  source: ValidationSource;
  tolerancePercent?: number;
};

export type GuideCircuitCase = {
  id: string;
  title: string;
  description: string;
  circuit: Circuit;
  stepExplanations: Record<string, string>;
  stepContentOverrides?: Record<string, string>;
  resolution: GuideResolution;
  validations: GuideValidationDefinition[];
};

export type GuideNetworkProblem = {
  id: "p8" | "p9" | "p11";
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  theory: GuideTheory;
  cases: GuideCircuitCase[];
};

/** Figura 5(a): R2 y R6 en serie con R3 || (R1 + R4 + R5). */
export const problem8a: Circuit = {
  nodes: ["0", "a", "x", "y", "w", "z"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R2", nFrom: "a", nTo: "x", ohms: 10 },
    { type: "resistor", label: "R1", nFrom: "x", nTo: "y", ohms: 10 },
    { type: "resistor", label: "R4", nFrom: "y", nTo: "w", ohms: 10 },
    { type: "resistor", label: "R5", nFrom: "w", nTo: "z", ohms: 10 },
    { type: "resistor", label: "R3", nFrom: "x", nTo: "z", ohms: 10 },
    { type: "resistor", label: "R6", nFrom: "z", nTo: "0", ohms: 10 },
    {
      type: "voltageSource",
      label: "V",
      nFrom: "a",
      nTo: "0",
      volts: 9,
    },
  ],
};

/** Figura 5(b): R2 || R3 en serie con R1, R4 y R5. */
export const problem8b: Circuit = {
  nodes: ["0", "a", "x", "y", "z"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R1", nFrom: "a", nTo: "x", ohms: 10 },
    { type: "resistor", label: "R2", nFrom: "x", nTo: "y", ohms: 10 },
    { type: "resistor", label: "R3", nFrom: "x", nTo: "y", ohms: 10 },
    { type: "resistor", label: "R4", nFrom: "y", nTo: "z", ohms: 10 },
    { type: "resistor", label: "R5", nFrom: "z", nTo: "0", ohms: 10 },
    {
      type: "voltageSource",
      label: "V",
      nFrom: "a",
      nTo: "0",
      volts: 9,
    },
  ],
};

/** Figura 6. Las referencias de R1/R4, R3 y R2/R5 son I0, I1 e I2. */
export const problem9: Circuit = {
  nodes: ["0", "A", "a", "l", "m", "r", "b"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R4", nFrom: "0", nTo: "l", ohms: 15 },
    {
      type: "voltageSource",
      label: "E1",
      nFrom: "a",
      nTo: "l",
      volts: 10,
    },
    { type: "resistor", label: "R1", nFrom: "a", nTo: "A", ohms: 25 },
    {
      type: "voltageSource",
      label: "E2",
      nFrom: "m",
      nTo: "0",
      volts: 15,
    },
    { type: "resistor", label: "R3", nFrom: "m", nTo: "A", ohms: 10 },
    { type: "resistor", label: "R2", nFrom: "A", nTo: "r", ohms: 20 },
    {
      type: "voltageSource",
      label: "E3",
      nFrom: "b",
      nTo: "r",
      volts: 10,
    },
    { type: "resistor", label: "R5", nFrom: "b", nTo: "0", ohms: 30 },
  ],
};

/** Ie entra a la red e Is sale de ella, como en la resolución oficial. */
export const problem11: Circuit = {
  nodes: ["0", "t", "b"].map((id) => ({ id })),
  components: [
    { type: "resistor", label: "R3", nFrom: "0", nTo: "b", ohms: 9 },
    { type: "resistor", label: "R1", nFrom: "0", nTo: "t", ohms: 6 },
    { type: "resistor", label: "R2", nFrom: "t", nTo: "b", ohms: 10 },
    {
      type: "currentSource",
      label: "Ie",
      nFrom: "t",
      nTo: "0",
      amps: 1,
    },
    {
      type: "currentSource",
      label: "Is",
      nFrom: "b",
      nTo: "t",
      amps: 0.25,
    },
  ],
};

const commonKirchhoffExplanation = {
  "assigned-currents":
    "Los sentidos se eligen de forma arbitraria antes de plantear las ecuaciones. El signo del resultado indicará si esa elección coincidió con el sentido real.",
  kcl: "Aplicamos conservación de la carga: la suma algebraica de las corrientes que convergen en cada nodo es cero.",
  kvl: "Recorremos las mallas y aplicamos conservación de la energía. Una resistencia produce una caída al recorrerla a favor de la corriente; una fuente eleva el potencial al pasar de su borne negativo al positivo.",
  "numeric-system":
    "Reemplazamos los valores del enunciado y agrupamos las incógnitas. El motor resuelve este sistema sin mostrar aritmética matricial intermedia.",
  solution:
    "La solución entrega las corrientes con el signo correspondiente a los sentidos de referencia dibujados sobre el circuito.",
  signs:
    "Un valor negativo no representa una corriente físicamente negativa: significa que circula en el sentido opuesto al supuesto.",
};

export const guideNetworkProblems: Record<
  GuideNetworkProblem["id"],
  GuideNetworkProblem
> = {
  p8: {
    id: "p8",
    eyebrow: "Problema 8 · Asociaciones",
    title: "Resistencia equivalente y corrientes",
    description:
      "Determine el valor de la resistencia equivalente de los circuitos de la figura 5. Si en el caso (a) se conecta una batería de 9 voltios, calcular la corriente que circula por cada resistencia.",
    image: "/problemas/p8.png",
    theory: guideTheories.p8,
    cases: [
      {
        id: "p8a",
        title: "Figura 5(a)",
        description:
          "R1, R4 y R5 forman una serie de 30 Ω, en paralelo con R3. Ese bloque queda en serie con R2 y R6.",
        circuit: problem8a,
        stepExplanations: {
          ...commonKirchhoffExplanation,
          "assigned-currents":
            "La resolución de cátedra reconoce primero R1 + R4 + R5 = 30 Ω y luego R3 || R145 = 7,5 Ω. Con R2 y R6 en serie resulta Req = 27,5 Ω. El motor conserva esas mismas corrientes de rama en el esquema completo.",
          solution:
            "La corriente total atraviesa R2 y R6. En el paralelo se divide entre R3 y la rama formada por R1, R4 y R5.",
        },
        resolution: guideNetworkResolutions.p8a,
        validations: [
          {
            id: "req",
            label: "Req",
            expected: 27.5,
            unit: "Ω",
            source: {
              kind: "equivalentResistance",
              volts: 9,
              branchLabel: "R2",
            },
          },
          {
            id: "total",
            label: "I(R2, R6)",
            expected: 0.327,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R2" },
          },
          {
            id: "r3",
            label: "I(R3)",
            expected: 0.245,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R3" },
          },
          {
            id: "series",
            label: "I(R1, R4, R5)",
            expected: 0.081,
            unit: "A",
            tolerancePercent: 2,
            source: { kind: "branchCurrent", branchLabel: "R1" },
          },
        ],
      },
      {
        id: "p8b",
        title: "Figura 5(b)",
        description:
          "R2 y R3 están en paralelo y su equivalente de 5 Ω queda en serie con R1, R4 y R5.",
        circuit: problem8b,
        stepExplanations: {
          ...commonKirchhoffExplanation,
          "assigned-currents":
            "La cátedra reduce R2 || R3 a 5 Ω. Al sumarlo con R1, R4 y R5 se obtiene Req = 35 Ω; el motor representa explícitamente la bifurcación de corriente.",
          solution:
            "La corriente total atraviesa R1, R4 y R5. Como R2 y R3 son iguales, la corriente se divide por partes iguales en el paralelo.",
        },
        resolution: guideNetworkResolutions.p8b,
        validations: [
          {
            id: "req",
            label: "Req",
            expected: 35,
            unit: "Ω",
            source: {
              kind: "equivalentResistance",
              volts: 9,
              branchLabel: "R1",
            },
          },
          {
            id: "total",
            label: "I(R1, R4, R5)",
            expected: 0.257,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R1" },
          },
          {
            id: "r2",
            label: "I(R2)",
            expected: 0.128,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R2" },
          },
          {
            id: "r3",
            label: "I(R3)",
            expected: 0.128,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R3" },
          },
        ],
      },
    ],
  },
  p9: {
    id: "p9",
    eyebrow: "Problema 9 · Kirchhoff",
    title: "Red de tres mallas",
    description:
      "En el circuito de la figura 6, determinar las corrientes y la diferencia de potencial Vb − Va. Los valores de las resistencias, en Ω, son R1 = 25, R2 = 20, R3 = 10, R4 = 15, R5 = 30. Los valores de las fuentes son E1 = 10 V, E2 = 15 V y E3 = 10 V.",
    image: "/problemas/p9.png",
    theory: guideTheories.p9,
    cases: [
      {
        id: "p9",
        title: "Circuito completo",
        description:
          "Se plantean tres ecuaciones: KCL en el nodo A y una KVL para cada una de las dos mallas independientes.",
        circuit: problem9,
        stepExplanations: commonKirchhoffExplanation,
        resolution: guideNetworkResolutions.p9,
        validations: [
          {
            id: "i0",
            label: "I0",
            expected: -0.0172,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R1" },
          },
          {
            id: "i1",
            label: "I1",
            expected: 0.431,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R3" },
          },
          {
            id: "i2",
            label: "I2",
            expected: 0.4138,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R2" },
          },
          {
            id: "vba",
            label: "Vb − Va",
            expected: 2.154,
            unit: "V",
            source: {
              kind: "potentialDifference",
              nodeA: "a",
              nodeB: "b",
            },
          },
        ],
      },
    ],
  },
  p11: {
    id: "p11",
    eyebrow: "Problema 11 · Corrientes de rama",
    title: "Distribución de una corriente entrante",
    description:
      "Determine las corrientes en cada resistencia, para el circuito de la figura 8.",
    image: "/problemas/p11.png",
    theory: guideTheories.p11,
    cases: [
      {
        id: "p11",
        title: "Circuito completo",
        description:
          "Se aplican KCL en los nodos a y c, y KVL en la única malla resistiva.",
        circuit: problem11,
        stepExplanations: {
          ...commonKirchhoffExplanation,
          kcl: "La corriente entrante Ie se bifurca en I0 e I1. En el nodo inferior, I0 e I2 se relacionan con la corriente saliente Is.",
          kvl: "Al recorrer la malla en sentido horario, la suma de las caídas sobre R1, R2 y R3 debe ser cero.",
        },
        stepContentOverrides: {
          "assigned-currents":
            "I0: a → c por R3.\nI1: a → b por R1.\nI2: b → c por R2.\nIe = 1 A entrante; Is = 0,25 A saliente.",
          kcl: "Nodo a: Ie − I0 − I1 = 0\nNodo c: I0 + I2 − Is = 0",
          kvl: "M1: −I1·R1 − I2·R2 + I0·R3 = 0",
          "numeric-system":
            "−I0 − I1 = −1 A\nI0 + I2 = 0,25 A\n9·I0 − 6·I1 − 10·I2 = 0",
          solution: "I0 = 0,34 A\nI1 = 0,66 A\nI2 = −0,09 A",
          signs:
            "I2 = 0,09 A en el sentido c → b; opuesto al sentido asignado.",
        },
        resolution: guideNetworkResolutions.p11,
        validations: [
          {
            id: "i0",
            label: "I0",
            expected: 0.34,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R3" },
          },
          {
            id: "i1",
            label: "I1",
            expected: 0.66,
            unit: "A",
            source: { kind: "branchCurrent", branchLabel: "R1" },
          },
          {
            id: "i2",
            label: "I2",
            expected: -0.09,
            unit: "A",
            tolerancePercent: 2,
            source: { kind: "branchCurrent", branchLabel: "R2" },
          },
        ],
      },
    ],
  },
};

export const guideItems: GuideListItem[] = [
  {
    id: "p8",
    number: "08",
    title: "Resistencia equivalente",
    type: "Red resistiva",
    description: guideNetworkProblems.p8.description,
    image: guideNetworkProblems.p8.image,
    href: "/guia/p8",
  },
  {
    id: "p9",
    number: "09",
    title: "Leyes de Kirchhoff",
    type: "Red resistiva",
    description: guideNetworkProblems.p9.description,
    image: guideNetworkProblems.p9.image,
    href: "/guia/p9",
  },
  {
    id: "p11",
    number: "11",
    title: "Distribución de corrientes",
    type: "Red resistiva",
    description: guideNetworkProblems.p11.description,
    image: guideNetworkProblems.p11.image,
    href: "/guia/p11",
  },
  {
    id: "p12",
    number: "12",
    title: "Amperímetro multiescala",
    type: "Diseño de instrumento",
    description:
      "Un circuito básico de un amperímetro está mostrado en la figura 9. El galvanómetro de bobina móvil empleado tiene una resistencia rg = 10 Ω y para una corriente de 0,01 A se desvía a fondo de escala. Hallar los valores de resistencias necesarias para que se desvíe a fondo de escala con una corriente de 10 A, 1 A y 0,1 A.",
    image: "/problemas/p12.png",
    href: "/guia/p12",
  },
  {
    id: "p13",
    number: "13",
    title: "Voltímetro multiescala",
    type: "Diseño de instrumento",
    description:
      "La figura 10 muestra un circuito típico de un voltímetro de tres escalas cuyas entradas podrán medir hasta 3 V, 15 V y 150 V. El galvanómetro de bobina móvil empleado tiene una resistencia de 10 Ω y para una corriente de 0,001 A se desvía a fondo de escala. Hallar los valores de las resistencias indicadas para que, en cada caso, se desvíe a fondo de la escala.",
    image: "/problemas/p13.png",
    href: "/guia/p13",
  },
  {
    id: "constructor",
    number: "+",
    title: "Crear circuito propio",
    type: "Constructor libre",
    description:
      "Armá una red desde cero con resistencias y fuentes. El acceso ya está preparado para la pantalla de construcción de la próxima fase.",
    href: "/constructor",
  },
];
