import type { XYPosition } from "@xyflow/react";

import type { Circuit, Component, NodeId } from "../../lib/engine/model";

import type {
  CircuitFlowEdge,
  CircuitFlowNode,
  ComponentOrientation,
} from "./flow-types";

export type NodePositionMap = Record<NodeId, XYPosition>;

export type CircuitFlowElements = {
  nodes: CircuitFlowNode[];
  edges: CircuitFlowEdge[];
};

type CircuitAdapterOptions = {
  nodePositions?: NodePositionMap;
  branchCurrents?: Record<string, number>;
};

const JUNCTION_SIZE = 22;

const COMPONENT_SIZE = {
  horizontal: { width: 180, height: 104 },
  vertical: { width: 116, height: 180 },
} as const;

function defaultPositions(circuit: Circuit): NodePositionMap {
  const radius = Math.max(260, circuit.nodes.length * 45);
  const center = { x: radius + 120, y: radius + 80 };

  return Object.fromEntries(
    circuit.nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / circuit.nodes.length - Math.PI / 2;
      return [
        node.id,
        {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle),
        },
      ];
    }),
  );
}

function componentOrientation(
  from: XYPosition,
  to: XYPosition,
): ComponentOrientation {
  return Math.abs(to.y - from.y) > Math.abs(to.x - from.x)
    ? "vertical"
    : "horizontal";
}

function isReversed(
  from: XYPosition,
  to: XYPosition,
  orientation: ComponentOrientation,
): boolean {
  return orientation === "horizontal" ? to.x < from.x : to.y < from.y;
}

function componentCenter(from: XYPosition, to: XYPosition): XYPosition {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

function componentNode(
  component: Component,
  positions: NodePositionMap,
): CircuitFlowNode {
  const from = positions[component.nFrom];
  const to = positions[component.nTo];
  if (!from || !to) {
    throw new Error(
      `Falta una posición visual para ${component.nFrom} o ${component.nTo}.`,
    );
  }

  const orientation = componentOrientation(from, to);
  const center = componentCenter(from, to);
  const size = COMPONENT_SIZE[orientation];
  const position = {
    x: center.x - size.width / 2,
    y: center.y - size.height / 2,
  };

  if (component.type === "resistor") {
    return {
      id: `component:${component.label}`,
      type: "resistor",
      position,
      data: {
        label: component.label,
        value: `${formatNumber(component.ohms)} Ω`,
        orientation,
        reversed: isReversed(from, to, orientation),
      },
      zIndex: 2,
      draggable: false,
      selectable: true,
    };
  }

  const isVoltage = component.type === "voltageSource";
  return {
    id: `component:${component.label}`,
    type: "source",
    position,
    data: {
      label: component.label,
      value: isVoltage
        ? `${formatNumber(component.volts)} V`
        : `${formatNumber(component.amps)} A`,
      sourceType: isVoltage ? "voltage" : "current",
      orientation,
      reversed: isReversed(from, to, orientation),
    },
    zIndex: 2,
    draggable: false,
    selectable: true,
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 3,
  }).format(value);
}

function junctionHandle(
  junction: XYPosition,
  componentPosition: XYPosition,
): "top" | "right" | "bottom" | "left" {
  const dx = componentPosition.x - junction.x;
  const dy = componentPosition.y - junction.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}

/**
 * Convierte una netlist del motor en nodos y cables de React Flow. Cada rama
 * se representa con un nodo visual de componente entre sus dos nodos físicos.
 */
export function circuitToFlow(
  circuit: Circuit,
  options: CircuitAdapterOptions = {},
): CircuitFlowElements {
  const positions = options.nodePositions ?? defaultPositions(circuit);
  const maximumCurrent = Math.max(
    0,
    ...Object.values(options.branchCurrents ?? {}).map((current) =>
      Math.abs(current),
    ),
  );
  const nodes: CircuitFlowNode[] = circuit.nodes.map((node) => {
    const center = positions[node.id];
    if (!center) {
      throw new Error(`Falta una posición visual para el nodo ${node.id}.`);
    }
    return {
      id: `junction:${node.id}`,
      type: "junction",
      position: {
        x: center.x - JUNCTION_SIZE / 2,
        y: center.y - JUNCTION_SIZE / 2,
      },
      data: {
        label: node.label ?? node.id,
        isGround: node.id === "0",
      },
      zIndex: 3,
      draggable: false,
      selectable: false,
    };
  });

  const edges: CircuitFlowEdge[] = [];
  for (const component of circuit.components) {
    const visualComponent = componentNode(component, positions);
    nodes.push(visualComponent);

    const from = positions[component.nFrom];
    const to = positions[component.nTo];
    const componentAnchor = componentCenter(from, to);
    const current = options.branchCurrents?.[component.label] ?? 0;
    const normalizedMagnitude =
      maximumCurrent > 0 ? Math.abs(current) / maximumCurrent : 0;
    const wireData = {
      branchLabel: component.label,
      current,
      normalizedMagnitude,
    };

    edges.push(
      {
        id: `wire:${component.label}:from`,
        source: `junction:${component.nFrom}`,
        sourceHandle: junctionHandle(from, componentAnchor),
        target: visualComponent.id,
        targetHandle: "from",
        type: "animatedWire",
        animated: false,
        ariaLabel: `Cable de ${component.label}: ${formatNumber(current)} A`,
        data: wireData,
      },
      {
        id: `wire:${component.label}:to`,
        source: visualComponent.id,
        sourceHandle: "to",
        target: `junction:${component.nTo}`,
        targetHandle: junctionHandle(to, componentAnchor),
        type: "animatedWire",
        animated: false,
        ariaLabel: `Cable de ${component.label}: ${formatNumber(current)} A`,
        data: wireData,
      },
    );
  }

  return { nodes, edges };
}
