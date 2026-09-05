"use client";

import {
  BatteryCharging,
  CircleDot,
  FolderOpen,
  GitFork,
  Minus,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  Trash2,
  Waves,
  Zap,
} from "lucide-react";
import type { DragEvent, ReactNode } from "react";

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
    tone: "border-amber-400/20 bg-amber-400/[0.06] text-amber-200",
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
        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
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
  selectedNode,
  selectedEdge,
  storageMessage,
  onAdd,
  onUpdateLabel,
  onUpdateValue,
  onSetGround,
  onRotate,
  onDeleteSelection,
  onSave,
  onLoad,
  onClear,
}: {
  selectedNode: ConstructorFlowNode | null;
  selectedEdge: ConstructorFlowEdge | null;
  storageMessage: string | null;
  onAdd: (kind: ConstructorNodeKind) => void;
  onUpdateLabel: (label: string) => void;
  onUpdateValue: (value: number) => void;
  onSetGround: () => void;
  onRotate: () => void;
  onDeleteSelection: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
}) {
  const selectedKind = selectedNode?.data.builderKind;
  const selectedComponent =
    selectedNode && isComponentNode(selectedNode) ? selectedNode : null;
  const maximumValue = 1000;
  const minimumValue = selectedKind === "resistor" ? 0.1 : -1000;
  const valueStep = 0.1;
  const updateBoundedValue = (value: number) => {
    if (!Number.isFinite(value)) return;
    onUpdateValue(Math.min(maximumValue, Math.max(minimumValue, value)));
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
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

      <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
        <h2 className="font-semibold text-slate-100">Propiedades</h2>
        {!selectedNode && !selectedEdge ? (
          <p className="mt-3 rounded-2xl border border-dashed border-slate-700 p-4 text-xs leading-5 text-slate-500">
            Seleccioná un componente, nodo o cable para editarlo o borrarlo.
          </p>
        ) : null}

        {selectedNode ? (
          <div className="mt-4 space-y-3">
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
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 font-mono text-sm text-slate-100 outline-none transition disabled:cursor-not-allowed disabled:text-slate-500 focus:border-cyan-400"
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
                      className="h-10 min-w-0 flex-1 bg-transparent px-3 text-center font-mono text-sm text-slate-100 outline-none"
                    />
                    <span className="grid h-10 min-w-10 place-items-center border-l border-slate-700 px-2 font-mono text-xs text-cyan-200">
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
                  <input
                    aria-label={`Control deslizante de ${selectedComponent.data.label}`}
                    type="range"
                    min={minimumValue}
                    max={maximumValue}
                    step={valueStep}
                    value={selectedComponent.data.numericValue}
                    onChange={(event) =>
                      updateBoundedValue(Number(event.currentTarget.value))
                    }
                    className="block h-2 w-full cursor-pointer accent-cyan-400"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-600">
                  {selectedKind === "resistor"
                    ? "Valor positivo entre 0,1 Ω y 1000 Ω."
                    : `Rango permitido: −1000 a 1000 ${componentUnit(selectedComponent)}.`}
                </p>
              </div>
            ) : null}

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
                <p className="-mt-1 text-center text-[10px] text-slate-600">
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

      <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-xl shadow-black/20">
        <h2 className="font-semibold text-slate-100">Circuito guardado</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Se conserva localmente en este navegador.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <Save className="size-4" /> Guardar
          </button>
          <button
            type="button"
            onClick={onLoad}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40"
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
    </aside>
  );
}
