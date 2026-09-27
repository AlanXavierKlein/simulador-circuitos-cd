"use client";

import {
  BatteryCharging,
  BookOpenCheck,
  ChevronDown,
  CircleDot,
  FolderOpen,
  GitFork,
  LayoutTemplate,
  Minus,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  Trash2,
  Waves,
  Zap,
} from "lucide-react";
import { useState, type DragEvent, type ReactNode } from "react";

import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
  ConstructorResistorNode,
  ConstructorSourceNode,
  ConstructorNodeKind,
} from "./constructor-types";
import { componentRotation } from "./constructor-types";

const paletteItems: Array<{
  kind: ConstructorNodeKind;
  title: string;
  description: string;
  icon: ReactNode;
  tone: string;
}> = [
  {
    kind: "resistor",
    title: "Resistencia",
    description: "Limita la corriente",
    icon: <Waves className="size-5" />,
    tone: "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-200",
  },
  {
    kind: "voltageSource",
    title: "Fuente de tensión",
    description: "Fija una diferencia de potencial",
    icon: <BatteryCharging className="size-5" />,
    tone: "border-amber-400/20 bg-amber-400/[0.06] text-amber-200",
  },
  {
    kind: "currentSource",
    title: "Fuente de corriente",
    description: "Fija una corriente de rama",
    icon: <Zap className="size-5" />,
    tone: "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-200",
  },
  {
    kind: "junction",
    title: "Nodo / unión",
    description: "Conecta varias ramas",
    icon: <CircleDot className="size-5" />,
    tone: "border-violet-400/20 bg-violet-400/[0.06] text-violet-200",
  },
];

function PaletteButton({
  item,
  onAdd,
}: {
  item: (typeof paletteItems)[number];
  onAdd: (kind: ConstructorNodeKind) => void;
}) {
  const startDrag = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("application/reactflow", item.kind);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={startDrag}
      onClick={() => onAdd(item.kind)}
      className={`flex w-full cursor-grab items-center gap-3 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-current active:cursor-grabbing ${item.tone}`}
      aria-label={`Agregar ${item.title}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950/55">
        {item.icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-slate-400">
          {item.description}
        </span>
      </span>
    </button>
  );
}

type ConstructorComponentNode = ConstructorResistorNode | ConstructorSourceNode;

function isComponentNode(
  node: ConstructorFlowNode,
): node is ConstructorComponentNode {
  return node.data.builderKind !== "junction";
}

function componentUnit(node: ConstructorComponentNode): string {
  if (node.data.builderKind === "resistor") return "Ω";
  return node.data.builderKind === "voltageSource" ? "V" : "A";
}

export function ConstructorSidebar({
  section,
  selectedNode,
  selectedEdge,
  storageMessage,
  onAdd,
  onUpdateLabel,
  onUpdateValue,
  onSetGround,
  onRotate,
  onDeleteSelection,
  onLoadExample,
  onSave,
  onLoad,
  onClear,
}: {
  section: "palette" | "properties";
  selectedNode: ConstructorFlowNode | null;
  selectedEdge: ConstructorFlowEdge | null;
  storageMessage: string | null;
  onAdd: (kind: ConstructorNodeKind) => void;
  onUpdateLabel: (label: string) => void;
  onUpdateValue: (value: number) => void;
  onSetGround: () => void;
  onRotate: () => void;
  onDeleteSelection: () => void;
  onLoadExample: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
}) {
  const [showBasicInstructions, setShowBasicInstructions] = useState(true);
  const selectedKind = selectedNode?.data.builderKind;
  const selectedComponent =
    selectedNode && isComponentNode(selectedNode) ? selectedNode : null;
  const maximumValue = 1000;
  const maximumSliderValue = 500;
  const minimumValue = selectedKind === "resistor" ? 0.1 : -1000;
  const minimumSliderValue = selectedKind === "resistor" ? 0.1 : -500;
  const valueStep = 0.1;
  const updateBoundedValue = (value: number) => {
    if (!Number.isFinite(value)) return;
    const boundedValue = Math.min(maximumValue, Math.max(minimumValue, value));
    onUpdateValue(Number(boundedValue.toFixed(3)));
  };
  const sliderValue = selectedComponent
    ? Math.min(
        maximumSliderValue,
        Math.max(minimumSliderValue, selectedComponent.data.numericValue),
      )
    : minimumSliderValue;

  return (
    <aside className="space-y-4 xl:sticky xl:top-24">
      {section === "palette" ? (
        <section className="app-surface p-4">
        <div className="flex items-start gap-3">
          <span className="app-icon size-10">
            <GitFork className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-100">Componentes</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Arrastralos al canvas o hacé clic para agregarlos.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          {paletteItems.map((item) => (
            <PaletteButton key={item.kind} item={item} onAdd={onAdd} />
          ))}
        </div>
        </section>
      ) : null}

      {section === "properties" ? (
        <section className="app-surface p-4">
        <h2 className="font-semibold text-slate-100">Propiedades</h2>
        {!selectedNode && !selectedEdge ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-700 p-4 text-xs leading-5 text-slate-400">
            Seleccioná un componente, nodo o cable para editarlo o borrarlo.
          </p>
        ) : null}

        {selectedNode ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-400">
                  Etiqueta
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={selectedNode.data.label}
                  disabled={
                    selectedKind === "junction" && selectedNode.data.isGround
                  }
                  onChange={(event) => onUpdateLabel(event.currentTarget.value)}
                  className="app-input mt-1.5 h-10 w-full px-3 font-mono text-sm disabled:cursor-not-allowed disabled:text-slate-500"
                />
              </label>

              {selectedComponent ? (
                <div>
                  <span className="text-xs font-medium text-slate-400">
                    Valor
                  </span>
                  <div className="mt-1.5 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 focus-within:border-cyan-400">
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        aria-label={`Disminuir ${selectedComponent.data.label}`}
                        onClick={() =>
                          updateBoundedValue(
                            Number(
                              (
                                selectedComponent.data.numericValue - valueStep
                              ).toFixed(3),
                            ),
                          )
                        }
                        className="grid size-10 shrink-0 place-items-center border-r border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-200"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        aria-label={`Valor de ${selectedComponent.data.label}`}
                        type="number"
                        min={minimumValue}
                        max={maximumValue}
                        step={valueStep}
                        value={selectedComponent.data.numericValue}
                        onChange={(event) => {
                          const value = Number(event.currentTarget.value);
                          updateBoundedValue(value);
                        }}
                        className="h-10 min-w-0 flex-1 bg-transparent px-2 text-center font-mono text-sm text-slate-100 outline-none"
                      />
                      <span className="grid h-10 min-w-8 place-items-center border-l border-slate-700 px-1.5 font-mono text-xs text-cyan-200">
                        {componentUnit(selectedComponent)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Aumentar ${selectedComponent.data.label}`}
                        onClick={() =>
                          updateBoundedValue(
                            Number(
                              (
                                selectedComponent.data.numericValue + valueStep
                              ).toFixed(3),
                            ),
                          )
                        }
                        className="grid size-10 shrink-0 place-items-center border-l border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-200"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <div className="border-t border-slate-700 px-3 py-2">
                      <input
                        aria-label={`Control deslizante de ${selectedComponent.data.label}`}
                        type="range"
                        min={minimumSliderValue}
                        max={maximumSliderValue}
                        step={valueStep}
                        value={sliderValue}
                        onChange={(event) =>
                          updateBoundedValue(Number(event.currentTarget.value))
                        }
                        className="block h-4 w-full cursor-pointer accent-cyan-400"
                      />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {selectedKind === "resistor"
                      ? "Valor positivo entre 0,1 Ω y 1000 Ω."
                      : `Rango permitido: −1000 a 1000 ${componentUnit(selectedComponent)}.`}
                  </p>
                </div>
              ) : null}
            </div>

            {selectedKind === "junction" && !selectedNode.data.isGround ? (
              <button
                type="button"
                onClick={onSetGround}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-lime-400/25 bg-lime-400/[0.06] px-3 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10"
              >
                <CircleDot className="size-4" /> Usar como tierra
              </button>
            ) : null}

            {selectedComponent ? (
              <>
                <button
                  type="button"
                  onClick={onRotate}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-200"
                >
                  <RotateCw className="size-4" /> Rotar 90° · ahora en{" "}
                  {componentRotation(
                    selectedComponent.data.orientation,
                    selectedComponent.data.reversed,
                  )}
                  °
                </button>
                <p className="-mt-1 text-center text-[11px] text-slate-400">
                  También podés usar la tecla R.
                </p>
              </>
            ) : null}

            <button
              type="button"
              onClick={onDeleteSelection}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/[0.06] px-3 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
            >
              <Trash2 className="size-4" /> Borrar elemento
            </button>
          </div>
        ) : null}

        {selectedEdge ? (
          <div className="mt-4">
            <p className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
              Cable seleccionado
            </p>
            <button
              type="button"
              onClick={onDeleteSelection}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-400/[0.06] px-3 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
            >
              <Trash2 className="size-4" /> Borrar cable
            </button>
          </div>
        ) : null}
        </section>
      ) : null}

      {section === "properties" ? (
        <section
          className="app-surface p-4"
          aria-labelledby="connection-guide-title"
        >
          <div className="flex items-start gap-3">
            <span className="app-icon size-10 text-cyan-200">
              <BookOpenCheck className="size-5" />
            </span>
            <div>
              <h2
                id="connection-guide-title"
                className="font-semibold text-slate-100"
              >
                Guía de conexión
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Acciones y reglas rápidas para armar el circuito.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/45">
            <button
              type="button"
              aria-expanded={showBasicInstructions}
              aria-controls="constructor-basic-instructions"
              onClick={() => setShowBasicInstructions((current) => !current)}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-xs font-semibold text-slate-200 transition hover:bg-slate-800/55"
            >
              <span>Cómo usar el constructor</span>
              <ChevronDown
                className={`size-4 shrink-0 text-cyan-300 transition-transform ${
                  showBasicInstructions ? "rotate-180" : ""
                }`}
              />
            </button>
            {showBasicInstructions ? (
              <ol
                id="constructor-basic-instructions"
                className="space-y-3 border-t border-slate-800 px-3.5 py-3 text-xs leading-5 text-slate-400"
              >
                {[
                  {
                    title: "Agregá.",
                    text: "Hacé clic en un elemento de la paleta o arrastralo hasta el canvas.",
                  },
                  {
                    title: "Seleccioná y editá.",
                    text: "Hacé clic en un componente para cambiar su etiqueta, valor o rotación en Propiedades. También podés rotarlo con la tecla R.",
                  },
                  {
                    title: "Conectá.",
                    text: "Arrastrá desde cada terminal del componente hasta un nodo intermedio. Los dos terminales deben quedar conectados.",
                  },
                  {
                    title: "Acomodá la vista.",
                    text: "Arrastrá los elementos para moverlos. Arrastrá el fondo para recorrer el canvas y usá la rueda o los controles para cambiar el zoom.",
                  },
                  {
                    title: "Borrá.",
                    text: "Seleccioná un componente, nodo o cable y presioná Supr/Delete o Retroceso/Backspace. También podés usar el botón rojo de Propiedades.",
                  },
                  {
                    title: "Elegí tierra.",
                    text: "El primer nodo se toma como tierra. Para cambiarlo, seleccioná otro nodo y elegí “Usar como tierra”.",
                  },
                ].map((instruction, index) => (
                  <li key={instruction.title} className="flex gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full border border-cyan-400/25 bg-cyan-400/[0.07] font-mono text-[10px] font-semibold text-cyan-200">
                      {index + 1}
                    </span>
                    <span>
                      <strong className="font-semibold text-slate-200">
                        {instruction.title}
                      </strong>{" "}
                      {instruction.text}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>

          <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Señales al conectar
          </h3>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-300">
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-lime-300 shadow-[0_0_8px_rgba(190,242,100,0.7)]" />
              <span>
                <strong className="font-semibold text-lime-200">Verde</strong>:
                podés soltar el cable en ese destino.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.65)]" />
              <span>
                <strong className="font-semibold text-amber-200">Ámbar</strong>:
                es el terminal desde donde empezaste.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-600" />
              <span>Los destinos atenuados no aceptan esa conexión.</span>
            </li>
          </ul>

          <div className="my-4 h-px bg-slate-800" />

          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Reglas del circuito
          </h3>
          <ul className="space-y-2.5 text-xs leading-5 text-slate-400">
            <li>Cada terminal debe conectarse a un nodo intermedio.</li>
            <li>No conectes dos componentes directamente.</li>
            <li>Cada terminal admite un solo cable.</li>
            <li>Los dos terminales deben ir a nodos distintos.</li>
            <li>Para resolver, cerrá una malla y mantené un nodo como tierra.</li>
          </ul>
        </section>
      ) : null}

      {section === "palette" ? (
        <section className="app-surface p-4">
          <div className="flex items-start gap-3">
            <span className="app-icon size-10 text-lime-200">
              <LayoutTemplate className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-100">
                Circuito de ejemplo
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Una fuente de 9 V y una resistencia de 10 Ω, listas para editar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLoadExample}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-lime-400/25 bg-lime-400/[0.06] px-3 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10"
          >
            <LayoutTemplate className="size-4" /> Cargar ejemplo
          </button>
          <p className="mt-2 text-[11px] leading-4 text-slate-500">
            Podés moverlo, cambiar sus valores o reconectarlo.
          </p>
        </section>
      ) : null}

      {section === "palette" ? (
        <section className="app-surface p-4">
        <h2 className="font-semibold text-slate-100">Circuito guardado</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Se conserva localmente en este navegador.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSave}
            className="app-button-primary inline-flex h-10 items-center justify-center gap-2 px-3 text-xs"
          >
            <Save className="size-4" /> Guardar
          </button>
          <button
            type="button"
            onClick={onLoad}
            className="app-button-secondary inline-flex h-10 items-center justify-center gap-2 px-3 text-xs"
          >
            <FolderOpen className="size-4" /> Cargar
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-400 transition hover:border-rose-400/30 hover:text-rose-200"
        >
          <RefreshCw className="size-4" /> Limpiar canvas
        </button>
        {storageMessage ? (
          <p className="mt-3 text-xs leading-5 text-cyan-200" role="status">
            {storageMessage}
          </p>
        ) : null}
        </section>
      ) : null}
    </aside>
  );
}
