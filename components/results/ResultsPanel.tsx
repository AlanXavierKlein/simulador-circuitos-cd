"use client";

import {
  Activity,
  ArrowDownToLine,
  ChevronDown,
  Gauge,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { SolveResult } from "@/lib/engine/kirchhoff";
import type { Circuit, NodeId } from "@/lib/engine/model";
import { buildReferenceCurrentLayout } from "@/lib/engine/reference-currents";

import { AnimatedNumber } from "./AnimatedNumber";

type ResultsPanelProps = {
  circuit: Circuit;
  result: SolveResult;
  primaryReadings?: PrimaryResultReading[];
};

export type PrimaryResultReading = {
  id: string;
  label: string;
  value: number | null;
  unit: string;
};

function ResultCard({
  label,
  value,
  unit,
  detail,
  tone = "cyan",
}: {
  label: string;
  value: number | null;
  unit: string;
  detail?: string;
  tone?: "cyan" | "lime" | "amber" | "violet";
}) {
  const colors = {
    cyan: "border-cyan-400/15 bg-cyan-400/[0.035] text-cyan-300",
    lime: "border-lime-400/15 bg-lime-400/[0.035] text-lime-300",
    amber: "border-amber-400/15 bg-amber-400/[0.035] text-amber-300",
    violet: "border-violet-400/15 bg-violet-400/[0.035] text-violet-300",
  };

  return (
    <article className={`app-surface-inset p-4 ${colors[tone]}`}>
      <p className="font-mono text-xs text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-50">
        {value === null ? "—" : <AnimatedNumber value={value} />}{" "}
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </p>
      {detail ? <p className="mt-2 text-xs text-slate-400">{detail}</p> : null}
    </article>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="text-cyan-300">{icon}</span>
      <div>
        <h3 className="font-medium text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function defaultNodePair(nodeIds: NodeId[]): [NodeId, NodeId] {
  const referenceNode = nodeIds.includes("0") ? "0" : (nodeIds[0] ?? "0");
  const measuredNode = nodeIds.find((nodeId) => nodeId !== referenceNode);

  return [referenceNode, measuredNode ?? referenceNode];
}

export function ResultsPanel({
  circuit,
  result,
  primaryReadings,
}: ResultsPanelProps) {
  const nodeIds = circuit.nodes.map((node) => node.id);
  const nodeName = (id: NodeId) =>
    circuit.nodes.find((node) => node.id === id)?.label ?? id;
  const referenceCurrents = buildReferenceCurrentLayout(
    circuit,
    result.branchCurrents,
  );
  const [defaultNodeA, defaultNodeB] = defaultNodePair(nodeIds);
  const [nodeA, setNodeA] = useState(defaultNodeA);
  const [nodeB, setNodeB] = useState(defaultNodeB);

  const difference =
    (result.nodePotentials[nodeB] ?? 0) - (result.nodePotentials[nodeA] ?? 0);

  return (
    <section className="app-surface mt-6 p-5 sm:p-6">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
          Resultado actual
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Lecturas con los valores cargados
        </h2>
      </div>

      {primaryReadings?.length ? (
        <div>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title="Resultados que pide el ejercicio"
            description="Se actualizan al cambiar los valores del circuito."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {primaryReadings.map((reading) => (
              <ResultCard
                key={reading.id}
                label={reading.label}
                value={reading.value}
                unit={reading.unit}
                detail={
                  reading.value === null
                    ? "No se puede calcular con estos valores"
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title="Corrientes de rama"
            description="El signo usa el sentido de referencia indicado en el circuito."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {referenceCurrents.groups.map((group) => (
              <ResultCard
                key={JSON.stringify(
                  group.segments.map((segment) => segment.componentLabel),
                )}
                label={group.label}
                value={group.current}
                unit="A"
                detail={
                  group.current < -1e-9
                    ? "Sentido opuesto al asumido"
                    : group.path.map(nodeName).join(" → ")
                }
              />
            ))}
          </div>
        </div>
      )}

      <details className="group mt-5 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/35">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden hover:bg-slate-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:px-5">
          <span>
            <span className="block font-medium text-slate-100">
              Otras magnitudes
            </span>
            <span className="mt-1 block text-xs text-slate-400">
              {primaryReadings?.length
                ? "Corrientes, tensiones, caídas y potencias"
                : "Tensiones, caídas y potencias"}
            </span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>

        <div className="border-t border-slate-800 p-4 sm:p-5">
          <div className="grid gap-6 xl:grid-cols-2">
            {primaryReadings?.length ? (
              <div>
                <SectionTitle
                  icon={<Activity className="size-4" />}
                  title="Corrientes de referencia"
                  description="El signo usa el sentido indicado en el circuito."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {referenceCurrents.groups.map((group) => (
                    <ResultCard
                      key={JSON.stringify(
                        group.segments.map((segment) => segment.componentLabel),
                      )}
                      label={group.label}
                      value={group.current}
                      unit="A"
                      detail={
                        group.current < -1e-9
                          ? "Sentido opuesto al asumido"
                          : group.path.map(nodeName).join(" → ")
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="app-surface-inset border-amber-400/20 bg-amber-400/[0.04] p-4">
              <SectionTitle
                icon={<Gauge className="size-4" />}
                title="Diferencia de potencial"
                description="Elegí dos nodos para comparar sus potenciales."
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  suppressHydrationWarning
                  aria-label="Nodo A para diferencia de potencial"
                  value={nodeA}
                  onChange={(event) => setNodeA(event.currentTarget.value)}
                  className="app-input h-10 px-2 font-mono text-sm focus:border-amber-400"
                >
                  {nodeIds.map((nodeId) => (
                    <option key={nodeId} value={nodeId}>
                      {nodeName(nodeId)}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-sm text-slate-400">− V</span>
                <select
                  suppressHydrationWarning
                  aria-label="Nodo B para diferencia de potencial"
                  value={nodeB}
                  onChange={(event) => setNodeB(event.currentTarget.value)}
                  className="app-input h-10 px-2 font-mono text-sm focus:border-amber-400"
                >
                  {nodeIds.map((nodeId) => (
                    <option key={nodeId} value={nodeId}>
                      {nodeName(nodeId)}
                    </option>
                  ))}
                </select>
                <span className="font-mono text-sm text-slate-400">=</span>
                <span className="font-mono text-lg font-semibold text-amber-200">
                  <AnimatedNumber value={difference} /> V
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                V({nodeName(nodeB)}) − V({nodeName(nodeA)})
              </p>
            </div>

            <div>
              <SectionTitle
                icon={<Gauge className="size-4" />}
                title="Tensiones de nodo"
                description={`Referidas al nodo de tierra: V(${nodeName("0")}) = 0 V.`}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {nodeIds.map((nodeId) => (
                  <ResultCard
                    key={nodeId}
                    label={`V(${nodeName(nodeId)})`}
                    value={result.nodePotentials[nodeId] ?? 0}
                    unit="V"
                    tone="amber"
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionTitle
                icon={<ArrowDownToLine className="size-4" />}
                title="Caídas de tensión"
                description="Diferencia V(nFrom) − V(nTo) en cada componente."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {circuit.components.map((component) => (
                  <ResultCard
                    key={component.label}
                    label={`V(${component.label})`}
                    value={result.branchVoltages[component.label] ?? 0}
                    unit="V"
                    detail={`${nodeName(component.nFrom)} → ${nodeName(component.nTo)}`}
                    tone="amber"
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionTitle
                icon={<Zap className="size-4" />}
                title="Potencias"
                description="Positiva: absorbe. Negativa: entrega energía."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {circuit.components.map((component) => {
                  const power = result.powers[component.label] ?? 0;
                  return (
                    <ResultCard
                      key={component.label}
                      label={`P(${component.label})`}
                      value={power}
                      unit="W"
                      detail={
                        power < -1e-9 ? "Entrega energía" : "Absorbe energía"
                      }
                      tone="violet"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}
