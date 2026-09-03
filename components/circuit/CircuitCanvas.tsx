"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import type { EdgeTypes, NodeTypes } from "@xyflow/react";
import { Maximize2, MousePointer2, Move3d } from "lucide-react";
import { useMemo } from "react";

import type { Circuit } from "@/lib/engine/model";

import { AnimatedWire } from "./AnimatedWire";
import { circuitToFlow } from "./circuit-adapter";
import type {
  ComponentPositionMap,
  CurrentLabelPlacementMap,
  NodePositionMap,
} from "./circuit-adapter";
import { JunctionNode } from "./JunctionNode";
import { ResistorNode } from "./ResistorNode";
import { SourceNode } from "./SourceNode";

const nodeTypes = {
  resistor: ResistorNode,
  source: SourceNode,
  junction: JunctionNode,
} satisfies NodeTypes;

const edgeTypes = {
  animatedWire: AnimatedWire,
} satisfies EdgeTypes;

type CircuitCanvasProps = {
  circuit: Circuit;
  nodePositions?: NodePositionMap;
  componentPositions?: ComponentPositionMap;
  branchCurrents?: Record<string, number>;
  currentLabelPlacements?: CurrentLabelPlacementMap;
  title?: string;
};

export function CircuitCanvas({
  circuit,
  nodePositions,
  componentPositions,
  branchCurrents,
  currentLabelPlacements,
  title = "Circuito",
}: CircuitCanvasProps) {
  const flow = useMemo(
    () =>
      circuitToFlow(circuit, {
        nodePositions,
        componentPositions,
        branchCurrents,
        currentLabelPlacements,
      }),
    [
      branchCurrents,
      circuit,
      componentPositions,
      currentLabelPlacements,
      nodePositions,
    ],
  );

  return (
    <div className="circuit-flow relative h-[min(720px,calc(100vh-13.5rem))] min-h-[500px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-[#080d18] shadow-2xl shadow-black/30">
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={false}
        nodesConnectable
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.35}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.16, minZoom: 0.45, maxZoom: 1.15 }}
        colorMode="dark"
        aria-label={title}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.35}
          color="#263449"
        />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          nodeColor={(node) =>
            node.type === "source"
              ? "#fbbf24"
              : node.type === "resistor"
                ? "#22d3ee"
                : "#a3e635"
          }
          nodeStrokeColor="#020617"
          nodeBorderRadius={10}
          maskColor="rgba(2, 6, 23, 0.72)"
          bgColor="#0f172a"
        />
        <Controls position="bottom-left" showInteractive={false} />

        <Panel position="top-left" className="m-4!">
          <div className="rounded-xl border border-slate-700/80 bg-slate-950/85 px-4 py-3 shadow-xl backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {title}
            </p>
            <p className="mt-1 font-mono text-[11px] text-slate-500">
              {circuit.nodes.length} nodos · {circuit.components.length} ramas
            </p>
          </div>
        </Panel>

        <Panel position="top-right" className="m-4! hidden sm:block">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-[11px] text-slate-400 shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <Move3d className="size-3.5 text-cyan-300" /> mover
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Maximize2 className="size-3.5 text-cyan-300" /> zoom
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <MousePointer2 className="size-3.5 text-cyan-300" /> seleccionar
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
