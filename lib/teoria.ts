export type TheoryTopic = {
  id: string;
  title: string;
  videoUrl: string;
  development: string | null;
  note?: string;
};

export const theoryTopics: TheoryTopic[] = [
  {
    id: "current-density",
    title: "Corriente eléctrica y densidad de corriente",
    videoUrl: "https://www.youtube.com/watch?v=BrFGjuHUf1M",
    development: null,
  },
  {
    id: "continuity-conductor",
    title: "Ecuaciones de continuidad y modelo de un conductor",
    videoUrl: "https://www.youtube.com/watch?v=chn5hPN89L0",
    development: null,
  },
  {
    id: "ohm-resistivity",
    title: "Ley de Ohm — Resistividad",
    videoUrl: "https://www.youtube.com/watch?v=fRX_6KJVoPg",
    development: null,
  },
  {
    id: "resistor-associations",
    title: "Asociación de resistencias (serie y paralelo)",
    videoUrl: "https://www.youtube.com/watch?v=pZMwtlYw9Hc",
    development: null,
  },
  {
    id: "joule-emf",
    title: "Ley de Joule — Fuerza electromotriz",
    videoUrl: "https://www.youtube.com/watch?v=razJGYVJ98Q",
    development: null,
  },
  {
    id: "kirchhoff",
    title: "Leyes de Kirchhoff",
    videoUrl: "https://www.youtube.com/watch?v=R3LQr8rVXsQ",
    development: null,
  },
  {
    id: "rc-circuits",
    title: "Circuitos RC",
    videoUrl: "https://www.youtube.com/watch?v=0H182aZ_JsQ",
    development: null,
    note: "Tema incluido como complemento teórico de la Unidad 4. El simulador no resuelve circuitos RC.",
  },
];
