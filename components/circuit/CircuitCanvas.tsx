"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import type { EdgeTypes, NodeTypes, ReactFlowInstance } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { Circuit } from "@/lib/engine/model";

import { AnimatedWire } from "./AnimatedWire";
import { CircuitMiniMap } from "./CircuitMiniMap";
import { CircuitCanvasFrame } from "./CircuitCanvasFrame";
import { circuitToFlow } from "./circuit-adapter";
import type {
  ComponentPositionMap,
  CurrentLabelPlacementMap,
  NodePositionMap,
} from "./circuit-adapter";
import type { CircuitFlowEdge, CircuitFlowNode } from "./flow-types";
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
  const flowInstanceRef = useRef<ReactFlowInstance<
    CircuitFlowNode,
    CircuitFlowEdge
  > | null>(null);
  const fitView = useCallback(() => {
    window.requestAnimationFrame(() => {
      flowInstanceRef.current?.fitView({
        padding: 0.16,
        minZoom: 0.45,
        maxZoom: 1.15,
        duration: 180,
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", fitView);
    return () => window.removeEventListener("resize", fitView);
  }, [fitView]);

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
    <CircuitCanvasFrame
      title={title}
      subtitle={`${circuit.nodes.length} nodos · ${circuit.components.length} ramas`}
    >
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.35}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.16, minZoom: 0.45, maxZoom: 1.15 }}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
          fitView();
        }}
        colorMode="dark"
        aria-label={title}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#1e293b"
        />
        <CircuitMiniMap />
        <Controls position="bottom-left" showInteractive={false} />
      </ReactFlow>
    </CircuitCanvasFrame>
  );
}
