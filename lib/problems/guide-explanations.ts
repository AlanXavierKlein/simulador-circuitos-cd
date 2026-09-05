export type GuideExplanationStep = {
  title: string;
  content?: string;
  equations?: string[];
};

export type GuideExplanationSection = {
  title: string;
  content?: string;
  steps?: GuideExplanationStep[];
  equations?: string[];
};

export type GuideExplanation = {
  heading: string;
  analysis?: string;
  sections?: GuideExplanationSection[];
  result?: string;
};

export type GuideResolution = {
  mode: "replace-kirchhoff" | "prepend-analysis";
  explanation: GuideExplanation;
};

const p8Analysis =
  'Se resuelve reconociendo qué resistencias están en serie (cuando están en la misma rama y circula la misma corriente por ellas) y cuáles en paralelo (cuando están conectadas entre los mismos dos nodos, con la misma tensión entre sus extremos). Se reduce el circuito por grupos hasta obtener una resistencia equivalente, se calcula la corriente total con la ley de Ohm y, por último, se "vuelve hacia atrás" (retro-sustitución) para hallar la corriente que circula por cada resistencia.';

export const guideNetworkResolutions: Record<
  "p8a" | "p8b" | "p9" | "p11",
  GuideResolution
> = {
  p8a: {
    mode: "replace-kirchhoff",
    explanation: {
      heading: "Resolución por reducción serie/paralelo",
      analysis: p8Analysis,
      sections: [
        {
          title: "Caso (a) — con la batería de 9 V",
          steps: [
            {
              title: "1. R1, R4 y R5 en serie.",
              content:
                "Están una a continuación de la otra en la misma rama, así que circula la misma corriente por las tres y sus resistencias se suman:",
              equations: ["R145 = R1 + R4 + R5 = 10 + 10 + 10 = 30 Ω."],
            },
            {
              title: "2. R3 en paralelo con R145.",
              content:
                "Ese conjunto queda conectado entre los mismos dos nodos que R3, por lo que comparten la misma tensión:",
              equations: [
                "R3145 = (1/R3 + 1/R145)⁻¹ = (1/10 + 1/30)⁻¹ = 7,5 Ω.",
              ],
            },
            {
              title: "3. R2, R3145 y R6 en serie.",
              content: "Ahora todo el circuito es una sola rama:",
              equations: ["Req = R2 + R3145 + R6 = 10 + 7,5 + 10 = 27,5 Ω."],
            },
            {
              title: "4. Corriente total.",
              content:
                "Es la que entrega la batería y circula por R2 y R6 (que están en serie con el resto). Por Ohm:",
              equations: ["I₁ = V / Req = 9 / 27,5 = 0,327 A."],
            },
            {
              title: "5. Tensión sobre el grupo en paralelo.",
              content:
                "Para saber cómo se reparte la corriente dentro del paralelo necesitamos la tensión común a ese grupo:",
              equations: ["V3145 = I₁ · R3145 = 0,327 · 7,5 = 2,45 V."],
            },
            {
              title: "6. Corriente por R3.",
              content: "R3 tiene esa tensión en sus extremos, así que por Ohm:",
              equations: ["I₂ = V3145 / R3 = 2,45 / 10 = 0,245 A."],
            },
            {
              title: "7. Corriente por R1, R4, R5.",
              content:
                "Esa rama tiene la misma tensión (2,45 V) sobre sus 30 Ω:",
              equations: ["I₃ = V3145 / R145 = 2,45 / 30 = 0,081 A."],
            },
            {
              title: "8. Verificación.",
              content:
                "En un paralelo, la corriente que entra se reparte entre las ramas y debe sumar la total:",
              equations: ["I₁ = I₂ + I₃ = 0,245 + 0,081 = 0,327 A ✓"],
            },
          ],
        },
      ],
    },
  },
  p8b: {
    mode: "replace-kirchhoff",
    explanation: {
      heading: "Resolución por reducción serie/paralelo",
      sections: [
        {
          title: "Caso (b)",
          steps: [
            {
              title: "1. R2 y R3 en paralelo",
              content: "(entre los mismos dos nodos):",
              equations: ["R23 = (1/10 + 1/10)⁻¹ = 5 Ω."],
            },
            {
              title: "2. R1, R23, R4 y R5 en serie:",
              equations: ["Req = 10 + 5 + 10 + 10 = 35 Ω."],
            },
            {
              title: "3. Corriente total:",
              equations: ["I₁ = V / Req = 9 / 35 = 0,257 A."],
            },
            {
              title: "4. Tensión sobre el paralelo:",
              equations: ["V23 = I₁ · R23 = 0,257 · 5 = 1,28 V."],
            },
            {
              title: "5. Corrientes por R2 y R3 (misma tensión):",
              content:
                "I₂ = V23 / R2 = 0,128 A ; I₃ = V23 / R3 = 0,128 A. Verificación: I₁ = I₂ + I₃ = 0,257 A ✓",
            },
          ],
        },
      ],
    },
  },
  p9: {
    mode: "prepend-analysis",
    explanation: {
      heading: "Análisis",
      analysis:
        "Se resuelve con las leyes de Kirchhoff. Hay 3 corrientes incógnita (I0, I1, I2), así que se plantean 3 ecuaciones: una de nodo (KCL en el nodo A) y dos de malla (KVL). Se asigna un sentido arbitrario a cada corriente. Al recorrer las mallas en sentido horario, la caída R·I es negativa si el recorrido va a favor de la corriente y positiva si va en contra; una fuente aporta +E si se pasa del borne − al + y −E en el caso contrario. Si una corriente da negativa (acá le pasa a I0), su sentido real es el opuesto al asumido. Para Vb − Va se elige un camino entre a y b y se suman las diferencias de potencial de los elementos del recorrido.",
    },
  },
  p11: {
    mode: "prepend-analysis",
    explanation: {
      heading: "Análisis",
      analysis:
        "La corriente entrante Ie se bifurca dentro del circuito en I0 e I1. Hay 3 incógnitas (I0, I1, I2), así que se plantean 3 ecuaciones: nodo a, nodo c y una malla. Las fuentes de corriente (Ie, Is) son datos conocidos y no son incógnitas. Se asigna un sentido arbitrario a las corrientes; I2 da negativa, así que su sentido real es el opuesto al asumido.",
    },
  },
};

export const guideInstrumentExplanations: Record<
  "ammeter" | "voltmeter",
  GuideExplanation
> = {
  ammeter: {
    heading: "Resolución propia · Amperímetro con shunt Ayrton",
    analysis:
      "Es un problema de diseño: hay que calcular las resistencias del shunt para que el amperímetro marque a fondo de escala en cada rango. El galvanómetro se desvía a fondo con Ig = 0,01 A y tiene rg = 10 Ω, así que la tensión sobre él es Vg = rg · Ig = 0,1 V. Es un shunt Ayrton (universal): R1, R2 y R3 están en cadena y el galvanómetro se conecta en distintos puntos según la escala. Se analiza escala por escala, mirando por dónde circula la corriente en cada caso.",
    sections: [
      {
        title: "Escala 0,1 A",
        content:
          "Del total, 0,01 A se van por el galvanómetro y el resto por las resistencias, así que la corriente por las resistencias es I1r = I1 − Ig = 0,09 A. En esta escala las tres resistencias quedan en paralelo con el galvanómetro, por lo que tienen la misma tensión que él: V = Vg = I1r · (R1 + R2 + R3). De ahí sale la primera ecuación:",
        equations: ["R1 + R2 + R3 = Vg / I1r = 0,1 / 0,09  (1)"],
      },
      {
        title: "Escala 1 A",
        content:
          "Ahora la corriente por las resistencias es I2r = I2 − Ig = 0,99 A. El galvanómetro queda en serie con R3, y R1 + R2 hacen de shunt. Recorriendo esa malla:",
        equations: ["I2r · R1 + I2r · R2 − Ig · R3 = Ig · Rg  (2)"],
      },
      {
        title: "Escala 10 A",
        content:
          "La corriente por las resistencias es I3r = I3 − Ig = 9,99 A. Ahora solo R1 hace de shunt, y R2 + R3 quedan del lado del galvanómetro. Recorriendo la malla:",
        equations: ["I3r · R1 − Ig · R2 − Ig · R3 = Ig · Rg  (3)"],
      },
      {
        title: "Reemplazando valores (Ig · Rg = 0,01 · 10 = 0,1)",
        equations: [
          "R1 + R2 + R3 = 0,1 / 0,09",
          "0,99 · R1 + 0,99 · R2 − 0,01 · R3 = 0,1",
          "9,99 · R1 − 0,01 · R2 − 0,01 · R3 = 0,1",
        ],
      },
    ],
    result: "R1 ≈ 0,011 Ω, R2 = 0,1 Ω, R3 = 1 Ω.",
  },
  voltmeter: {
    heading: "Resolución propia · Voltímetro con multiplicadoras en cascada",
    analysis:
      "Es un problema de diseño: hay que calcular las resistencias multiplicadoras para cada escala. El galvanómetro (rg = 10 Ω) se desvía a fondo con Ig = 0,001 A. Las resistencias están en cascada (en serie): cada escala mayor agrega una resistencia más. El punto a está conectado a tierra (potencial 0), así que la diferencia de potencial desde a hasta el borne de entrada es directamente el valor de la escala. Se analiza escala por escala, viendo por qué resistencias pasa la corriente en cada caso.",
    sections: [
      {
        title: "Escala 3 V",
        content:
          "La corriente Ig entra por el borne y, para llegar a tierra, pasa por R1 y por rg. Toda la tensión de entrada cae en esas dos resistencias:",
        equations: [
          "ΔVab = Ig · rg + Ig · R1 = 3 V   ⟶   Ig · R1 = 3 − Ig · rg  (1)",
        ],
      },
      {
        title: "Escala 15 V",
        content:
          "Ahora la corriente pasa por R2, R1 y rg (se agregó R2 en serie):",
        equations: [
          "ΔVac = Ig · rg + Ig · R1 + Ig · R2 = 15 V   ⟶   Ig · R1 + Ig · R2 = 15 − Ig · rg  (2)",
        ],
      },
      {
        title: "Escala 150 V",
        content: "Se agrega R3 en serie:",
        equations: [
          "ΔVad = Ig · rg + Ig · R1 + Ig · R2 + Ig · R3 = 150 V   ⟶   Ig · R1 + Ig · R2 + Ig · R3 = 150 − Ig · rg  (3)",
        ],
      },
      {
        title: "Reemplazando valores (Ig · rg = 0,001 · 10 = 0,01)",
        equations: [
          "0,001 · R1 = 2,99   ⟶   R1 = 2990 Ω",
          "0,001 · R1 + 0,001 · R2 = 14,99   ⟶   R2 = 12000 Ω",
          "0,001 · R1 + 0,001 · R2 + 0,001 · R3 = 149,99   ⟶   R3 = 135000 Ω",
        ],
      },
    ],
    result: "R1 = 2990 Ω, R2 = 12000 Ω, R3 = 135000 Ω.",
  },
};
