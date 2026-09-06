"use client";

import { Activity, ArrowDownToLine, Gauge, Zap } from "lucide-react";
import { useState } from "react";

import type { SolveResult } from "@/lib/engine/kirchhoff";
import type { Circuit, NodeId } from "@/lib/engine/model";
import { buildReferenceCurrentLayout } from "@/lib/engine/reference-currents";

import { AnimatedNumber } from "./AnimatedNumber";

type ResultsPanelProps = {
  circuit: Circuit;
  result: SolveResult;
};

function ResultCard({
  label,
  value,
  unit,
  detail,
  tone = "cyan",
}: {
  label: string;
  value: number;
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
    <article className={`rounded-2xl border p-4 ${colors[tone]}`}>
      <p className="font-mono text-xs text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-50">
        <AnimatedNumber value={value} />{" "}
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </p>
      {detail ? (
        <p className="mt-2 text-[11px] text-slate-500">{detail}</p>
      ) : null}
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
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function defaultNode(
  nodeIds: NodeId[],
  preferred: NodeId,
  fallbackIndex: number,
): NodeId {
  return nodeIds.includes(preferred)
    ? preferred
    : (nodeIds[fallbackIndex] ?? nodeIds[0] ?? "0");
}

export function ResultsPanel({ circuit, result }: ResultsPanelProps) {
  const nodeIds = circuit.nodes.map((node) => node.id);
  const referenceCurrents = buildReferenceCurrentLayout(
    circuit,
    result.branchCurrents,
  );
  const [nodeA, setNodeA] = useState(() => defaultNode(nodeIds, "a", 0));
  const [nodeB, setNodeB] = useState(() => defaultNode(nodeIds, "b", 1));

  const difference =
    (result.nodePotentials[nodeB] ?? 0) - (result.nodePotentials[nodeA] ?? 0);

  return (
    <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            Resultados en vivo
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Lecturas del circuito
          </h2>
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.045] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-300">
            Diferencia de potencial
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              suppressHydrationWarning
              aria-label="Nodo A para diferencia de potencial"
              value={nodeA}
              onChange={(event) => setNodeA(event.currentTarget.value)}
              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-2 font-mono text-sm text-slate-100 outline-none focus:border-violet-400"
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
              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-2 font-mono text-sm text-slate-100 outline-none focus:border-violet-400"
            >
              {nodeIds.map((nodeId) => (
                <option key={nodeId} value={nodeId}>
                  {nodeId}
                </option>
              ))}
            </select>
            <span className="font-mono text-sm text-slate-500">=</span>
            <span className="font-mono text-lg font-semibold text-violet-200">
              <AnimatedNumber value={difference} /> V
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            V({nodeB}) − V({nodeA})
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionTitle
            icon={<Activity className="size-4" />}
            title="Corrientes de rama"
            description="El signo usa el sentido de referencia de cada componente."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {referenceCurrents.groups.map((group) => {
              const current = group.current;
              return (
                <ResultCard
                  key={group.label}
                  label={group.label}
                  value={current}
                  unit="A"
                  detail={
                    current < -1e-9
                      ? "Sentido opuesto al asumido"
                      : group.path.join(" → ")
                  }
                />
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle
            icon={<Gauge className="size-4" />}
            title="Tensiones de nodo"
            description="Referidas al nodo de tierra: V(0) = 0 V."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {nodeIds.map((nodeId) => (
              <ResultCard
                key={nodeId}
                label={`V(${nodeId})`}
                value={result.nodePotentials[nodeId] ?? 0}
                unit="V"
                tone="lime"
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle
            icon={<ArrowDownToLine className="size-4" />}
            title="Caídas de tensión"
            description="Diferencia V(nFrom) − V(nTo) en cada rama."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {circuit.components.map((component) => (
              <ResultCard
                key={component.label}
                label={`V(${component.label})`}
                value={result.branchVoltages[component.label] ?? 0}
                unit="V"
                detail={`${component.nFrom} → ${component.nTo}`}
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
                  detail={power < -1e-9 ? "Entrega energía" : "Absorbe energía"}
                  tone="violet"
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
