"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  CircleHelp,
  Construction,
  MousePointerClick,
  Network,
  PlaySquare,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

type HelpExperience =
  | "simulator"
  | "network-guide"
  | "instrument"
  | "constructor";

type HelpSection = {
  title: string;
  icon: ReactNode;
  items: string[];
};

const commonResultItems = [
  "Las flechas I0, I1, I2… muestran el sentido de referencia usado por el cálculo.",
  "Si una corriente es negativa, circula en el sentido opuesto a la flecha dibujada.",
  "Resultados resume los valores actuales y Paso a paso muestra cómo se plantearon las ecuaciones.",
];

function sectionsFor(experience: HelpExperience): HelpSection[] {
  if (experience === "constructor") {
    return [
      {
        title: "Agregá y acomodá elementos",
        icon: <MousePointerClick className="size-5" />,
        items: [
          "Hacé clic en un componente de la paleta o arrastralo hasta el canvas.",
          "Seleccioná un elemento para editar su etiqueta, valor o rotación en Propiedades.",
          "Arrastrá el fondo para desplazarte y usá la rueda o los controles para cambiar el zoom.",
        ],
      },
      {
        title: "Conectá el circuito",
        icon: <Network className="size-5" />,
        items: [
          "Cada terminal de un componente debe conectarse a un nodo intermedio.",
          "Durante la conexión, los destinos válidos se resaltan en verde y el terminal de origen en ámbar.",
          "Los dos terminales de un componente deben ir a nodos distintos y el circuito necesita una malla cerrada.",
          "El primer nodo queda como tierra; podés elegir otro desde Propiedades.",
        ],
      },
      {
        title: "Probá el ejemplo guiado",
        icon: <BookOpenCheck className="size-5" />,
        items: [
          "Elegí Cargar ejemplo para empezar con una fuente de 9 V y una resistencia de 10 Ω ya conectadas.",
          "Seleccioná la resistencia, cambiá su valor y observá cómo se actualizan la corriente y los resultados.",
          "Después podés mover, desconectar o borrar elementos y reconstruir el circuito siguiendo el indicador de progreso.",
        ],
      },
    ];
  }

  if (experience === "instrument") {
    return [
      {
        title: "Ingresá los datos",
        icon: <SlidersHorizontal className="size-5" />,
        items: [
          "Editá rg, Ig y las tres escalas desde el panel Datos.",
          "Usá valores positivos y respetá la unidad indicada junto a cada campo.",
          "Restablecer valores recupera exactamente los datos originales de la guía.",
        ],
      },
      {
        title: "Leé el resultado",
        icon: <ChartNoAxesCombined className="size-5" />,
        items: [
          "El cálculo se actualiza al instante y muestra las resistencias R1, R2 y R3 para los valores cargados.",
          "La resolución de cátedra conserva el desarrollo del ejercicio original; la app avisa si editaste los datos.",
          "El resumen teórico explica el principio del instrumento sin cambiar ningún valor.",
        ],
      },
    ];
  }

  if (experience === "network-guide") {
    return [
      {
        title: "Probá otros valores",
        icon: <SlidersHorizontal className="size-5" />,
        items: [
          "Modificá cada resistencia o fuente desde Parámetros con el campo numérico, los botones o el slider.",
          "El circuito, los resultados y el desarrollo calculado se actualizan automáticamente.",
          "Restablecer valores recupera los datos originales del ejercicio de la guía.",
        ],
      },
      {
        title: "Explorá el circuito",
        icon: <MousePointerClick className="size-5" />,
        items: [
          "Arrastrá el fondo para desplazar el dibujo y usá la rueda o los controles para cambiar el zoom.",
          "La imagen superior es el enunciado original; el circuito redibujado es la versión interactiva.",
        ],
      },
      {
        title: "Interpretá la respuesta",
        icon: <ChartNoAxesCombined className="size-5" />,
        items: commonResultItems,
      },
    ];
  }

  return [
    {
      title: "Cambiá los parámetros",
      icon: <SlidersHorizontal className="size-5" />,
      items: [
        "Usá el campo numérico, los botones o el slider de cada componente.",
        "El circuito y todos los resultados se recalculan al instante.",
      ],
    },
    {
      title: "Explorá el circuito",
      icon: <MousePointerClick className="size-5" />,
      items: [
        "Arrastrá el fondo para desplazar el dibujo y usá la rueda o los controles para cambiar el zoom.",
        "Este circuito es un ejemplo editable por parámetros; para crear otra red usá el Constructor.",
      ],
    },
    {
      title: "Interpretá la respuesta",
      icon: <ChartNoAxesCombined className="size-5" />,
      items: commonResultItems,
    },
  ];
}

export function HowToUseDialog({
  experience,
  showP9Concepts = false,
}: {
  experience: HelpExperience;
  showP9Concepts?: boolean;
}) {
  const sections = sectionsFor(experience);
  const title =
    experience === "constructor"
      ? "Cómo usar el constructor"
      : experience === "instrument"
        ? "Cómo usar este ejercicio"
        : "Cómo usar el simulador";

  return (
    <Dialog.Root>
      <Dialog.Trigger className="app-button-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
        <CircleHelp className="size-4" />
        Cómo usar
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] min-h-dvh bg-slate-950/75 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-[71] flex min-h-dvh items-center justify-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Popup className="my-auto w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl shadow-black/60 outline-none transition-[opacity,transform] duration-150 data-ending-style:translate-y-1 data-ending-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:opacity-0">
            <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="app-icon size-11">
                  <CircleHelp className="size-5" />
                </span>
                <div>
                  <p className="app-kicker">Ayuda rápida</p>
                  <Dialog.Title className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {title}
                  </Dialog.Title>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Consultala cuando quieras. La ayuda no modifica el circuito
                    ni los valores cargados.
                  </p>
                </div>
              </div>
              <Dialog.Close
                aria-label="Cerrar ayuda"
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-cyan-400/45 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
              >
                <X className="size-5" />
              </Dialog.Close>
            </header>

            <div className="max-h-[min(70dvh,46rem)] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map((section) => (
                  <section
                    key={section.title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4"
                  >
                    <div className="flex items-center gap-2.5 text-cyan-100">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300">
                        {section.icon}
                      </span>
                      <h3 className="font-semibold">{section.title}</h3>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-cyan-300" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              {showP9Concepts ? (
                <section className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                      <Network className="size-5" />
                    </span>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.16em] text-amber-300">
                        Conceptos en la figura del P9
                      </p>
                      <h3 className="mt-1 font-semibold text-amber-50">
                        Dos nodos principales, tres lazos y dos mallas
                        independientes
                      </h3>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-950/45 p-3">
                      <dt className="font-semibold text-amber-200">Nodo</dt>
                      <dd className="mt-1 text-slate-300">
                        Punto de igual potencial donde se unen ramas. En la
                        figura hay dos nodos de unión principales; el redibujado
                        también muestra puntos intermedios entre componentes.
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-950/45 p-3">
                      <dt className="font-semibold text-amber-200">Rama</dt>
                      <dd className="mt-1 text-slate-300">
                        Camino entre esos nodos principales. Hay tres ramas y
                        cada una puede contener varios componentes en serie.
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-950/45 p-3">
                      <dt className="font-semibold text-amber-200">Lazo</dt>
                      <dd className="mt-1 text-slate-300">
                        Recorrido cerrado. Se pueden recorrer el lazo izquierdo,
                        el derecho y el exterior.
                      </dd>
                    </div>
                    <div className="rounded-xl bg-slate-950/45 p-3">
                      <dt className="font-semibold text-amber-200">
                        Malla independiente
                      </dt>
                      <dd className="mt-1 text-slate-300">
                        Lazo mínimo usado para KVL. Solo hay dos independientes;
                        el lazo exterior se obtiene combinándolas.
                      </dd>
                    </div>
                  </dl>
                </section>
              ) : null}

              {experience === "constructor" ? (
                <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/35 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300">
                      <PlaySquare className="size-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-100">
                          Videos de construcción
                        </h3>
                        <span className="rounded-full border border-slate-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                          Próximamente
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Este espacio queda preparado para recorridos de los
                        ejercicios de la guía cuando estén disponibles los
                        videos definitivos.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/45 p-4 text-sm leading-6 text-slate-400">
                <Construction className="mt-0.5 size-5 shrink-0 text-lime-300" />
                <p>
                  Podés cerrar esta ventana en cualquier momento y volver a
                  abrirla desde el botón{" "}
                  <strong className="text-slate-200">Cómo usar</strong>.
                </p>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
