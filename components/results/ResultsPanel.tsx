"use client";

import { Activity, ChevronDown, Gauge } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import type { SolveResult } from "@/lib/engine/kirchhoff";
import type { Circuit, Component, NodeId } from "@/lib/engine/model";
import {
  buildReferenceCurrentLayout,
  type ComponentCurrentReference,
} from "@/lib/engine/reference-currents";

import { AnimatedNumber } from "./AnimatedNumber";

type ResultsPanelProps = {
  circuit: Circuit;
  result: SolveResult;
};

function defaultNode(
  nodeIds: NodeId[],
  preferred: NodeId,
  fallbackIndex: number,
): NodeId {
  return nodeIds.includes(preferred)
    ? preferred
    : (nodeIds[fallbackIndex] ?? nodeIds[0] ?? "0");
}

function referenceDirection(
  component: Component,
  reference: ComponentCurrentReference | undefined,
) {
  if (reference?.direction === -1) {
    return `${component.nTo} → ${component.nFrom}`;
  }

  return `${component.nFrom} → ${component.nTo}`;
}

export function ResultsPanel({ circuit, result }: ResultsPanelProps) {
  const nodeIds = circuit.nodes.map((node) => node.id);
  const referenceCurrents = buildReferenceCurrentLayout(
    circuit,
    result.branchCurrents,
  );
  const [nodeA, setNodeA] = useState(() => defaultNode(nodeIds, "a", 0));
  const [nodeB, setNodeB] = useState(() => defaultNode(nodeIds, "b", 1));
  const [areNodeVoltagesVisible, setAreNodeVoltagesVisible] = useState(false);

  const difference =
    (result.nodePotentials[nodeB] ?? 0) - (result.nodePotentials[nodeA] ?? 0);

  return (
    <section className="app-surface mt-6 p-5 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            Resultados en vivo
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Lecturas del circuito
          </h2>
        </div>

        <div className="app-surface-inset border-amber-400/25 bg-amber-400/[0.055] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-300">
            Diferencia de potencial
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              suppressHydrationWarning
              aria-label="Nodo A para diferencia de potencial"
              value={nodeA}
              onChange={(event) => setNodeA(event.currentTarget.value)}
              className="app-input h-10 px-2 font-mono text-sm focus:border-amber-400"
            >
              {nodeIds.map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              ))}
            </select>
            <span className="font-mono text-sm text-slate-500">− V</span>
            <select
              suppressHydrationWarning
              aria-label="Nodo B para diferencia de potencial"
              value={nodeB}
              onChange={(event) => setNodeB(event.currentTarget.value)}
              className="app-input h-10 px-2 font-mono text-sm focus:border-amber-400"
            >
              {nodeIds.map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              ))}
            </select>
            <span className="font-mono text-sm text-slate-500">=</span>
            <span className="font-mono text-lg font-semibold text-amber-200">
              <AnimatedNumber value={difference} /> V
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            V({nodeB}) − V({nodeA})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Activity className="size-4 text-cyan-300" />
        <div>
          <h3 className="font-medium text-slate-100">Mediciones por componente</h3>
          <p className="text-xs text-slate-400">
            Corriente, caída de tensión y potencia de cada rama.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <table className="w-full min-w-[690px] border-separate border-spacing-y-2 text-left">
          <caption className="sr-only">
            Mediciones eléctricas de cada componente del circuito
          </caption>
          <thead className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Componente</th>
              <th className="px-4 py-2 font-medium">
                <span className="block">Corriente</span>
                <span className="normal-case tracking-normal text-slate-500">
                  sentido de referencia
                </span>
              </th>
              <th className="px-4 py-2 font-medium">Caída de tensión</th>
              <th className="px-4 py-2 font-medium">
                <span className="block">Potencia</span>
                <span className="normal-case tracking-normal text-slate-500">
                  + absorbe / − entrega
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {circuit.components.map((component) => {
              const reference = referenceCurrents.byComponent[component.label];
              const current =
                reference?.current ?? result.branchCurrents[component.label] ?? 0;
              const voltage = result.branchVoltages[component.label] ?? 0;
              const power = result.powers[component.label] ?? 0;
              const isDeliveringPower = power < -1e-9;

              return (
                <tr
                  key={component.label}
                  className="bg-slate-900/55 text-sm transition-colors hover:bg-slate-800/70"
                >
                  <th
                    scope="row"
                    className="rounded-l-xl border-y border-l border-slate-700/70 px-4 py-3 font-mono font-semibold text-slate-100"
                  >
                    {component.label}
                  </th>
                  <td className="border-y border-slate-700/70 px-4 py-3">
                    <p className="font-mono font-semibold text-cyan-200">
                      {reference ? (
                        <span className="mr-1 text-cyan-400">
                          {reference.label} =
                        </span>
                      ) : null}
                      <AnimatedNumber value={current} /> A
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {referenceDirection(component, reference)}
                      {current < -1e-9 ? " · opuesto" : ""}
                    </p>
                  </td>
                  <td className="border-y border-slate-700/70 px-4 py-3 font-mono font-semibold text-amber-200">
                    <AnimatedNumber value={voltage} /> V
                  </td>
                  <td
                    className={`rounded-r-xl border-y border-r border-slate-700/70 px-4 py-3 font-mono font-semibold ${
                      isDeliveringPower ? "text-lime-300" : "text-slate-100"
                    }`}
                  >
                    <AnimatedNumber value={power} /> W
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 border-t border-slate-700/70 pt-4">
        <button
          type="button"
          aria-expanded={areNodeVoltagesVisible}
          aria-controls="node-voltages-panel"
          onClick={() => setAreNodeVoltagesVisible((visible) => !visible)}
          className="app-button-secondary inline-flex min-h-10 items-center gap-2 px-3 text-sm"
        >
          <Gauge className="size-4 text-amber-300" />
          {areNodeVoltagesVisible
            ? "Ocultar tensiones de nodo"
            : "Ver tensiones de nodo"}
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              areNodeVoltagesVisible ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {areNodeVoltagesVisible ? (
            <motion.div
              id="node-voltages-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <p className="mb-3 text-xs text-slate-400">
                  Referidas al nodo de tierra: V(0) = 0 V.
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {nodeIds.map((nodeId) => (
                    <div
                      key={nodeId}
                      className="app-surface-inset flex items-center justify-between border-amber-400/15 bg-amber-400/[0.035] px-3 py-2"
                    >
                      <span className="font-mono text-sm text-slate-300">
                        V({nodeId})
                      </span>
                      <span className="font-mono text-sm font-semibold text-amber-200">
                        <AnimatedNumber value={result.nodePotentials[nodeId] ?? 0} /> V
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
