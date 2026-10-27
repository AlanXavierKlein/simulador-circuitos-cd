import type { LiveNetworkCase } from "./live-network-resolution";

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
  liveCase?: LiveNetworkCase;
};

const p8Analysis =
  'Se resuelve reconociendo qué resistencias están en serie (cuando están en la misma rama y circula la misma corriente por ellas) y cuáles en paralelo (cuando están conectadas entre los mismos dos nodos, con la misma tensión entre sus extremos). Se reduce el circuito por grupos hasta obtener una resistencia equivalente, se calcula la corriente total con la ley de Ohm y, por último, se "vuelve hacia atrás" (retro-sustitución) para hallar la corriente que circula por cada resistencia.';

export const guideNetworkResolutions: Record<
  "p8a" | "p8b" | "p9" | "p11",
  GuideResolution
> = {
  p8a: {
    mode: "replace-kirchhoff",
    liveCase: "p8a",
    explanation: {
      heading: "Resolución por reducción serie/paralelo",
      analysis: p8Analysis,
    },
  },
  p8b: {
    mode: "replace-kirchhoff",
    liveCase: "p8b",
    explanation: {
      heading: "Resolución por reducción serie/paralelo",
      analysis: p8Analysis,
    },
  },
  p9: {
    mode: "prepend-analysis",
    explanation: {
      heading: "Análisis",
      analysis:
        "Las incógnitas I0, I1 e I2 son corrientes de rama. I0 entra en A por la izquierda, I1 entra en A por la rama central e I2 sale de A hacia la derecha y baja al nodo inferior: I0 + I1 − I2 = 0. Se recorren las dos mallas internas en sentido horario: izquierda (subir por la izquierda y bajar por el centro) y derecha (subir por el centro y bajar por la derecha). Una resistencia aporta −R·I al recorrerla a favor de la referencia de corriente y +R·I en contra; una fuente aporta +E de − a + y −E de + a −. El signo de cada corriente calculada indica su sentido real. Para Vb − Va se recorre a → A → r → b, pasando por R1, R2 y E3, con corrientes algebraicas: −I0·R1 − I2·R2 + E3. El cálculo conserva toda la precisión. Con los valores originales resulta aproximadamente 2,1552 V; los 2,154 V del PDF provienen del redondeo intermedio de las corrientes: 0,0172·25 − 0,4138·20 + 10 = 2,154 V.",
    },
  },
  p11: {
    mode: "prepend-analysis",
    liveCase: "p11",
    explanation: {
      heading: "Análisis",
      analysis:
        "Las referencias de Ie e Is representan entrada en a y salida de c, respectivamente. Las tres corrientes de rama desconocidas son I0, I1 e I2. Se plantean dos ecuaciones de nodo y una de la malla resistiva en sentido horario. Las fuentes de corriente son datos conocidos. Cada signo calculado indica si la corriente coincide con su referencia o circula en sentido opuesto.",
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
