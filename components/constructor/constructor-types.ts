import type { Edge, Node } from "@xyflow/react";

import type {
  AnimatedWireData,
  ComponentOrientation,
  JunctionNodeData,
  ResistorNodeData,
  SourceNodeData,
} from "@/components/circuit/flow-types";

export type ConstructorComponentKind =
  "resistor" | "voltageSource" | "currentSource";
export type ConstructorNodeKind = ConstructorComponentKind | "junction";

type ConstructorComponentMeta = {
  numericValue: number;
};

export type ConstructorResistorNode = Node<
  ResistorNodeData &
    ConstructorComponentMeta & {
      builderKind: "resistor";
    },
  "resistor"
>;

export type ConstructorSourceNode = Node<
  SourceNodeData &
    ConstructorComponentMeta & {
      builderKind: "voltageSource" | "currentSource";
    },
  "source"
>;

export type ConstructorJunctionNode = Node<
  JunctionNodeData & {
    builderKind: "junction";
  },
  "junction"
>;

export type ConstructorFlowNode =
  ConstructorResistorNode | ConstructorSourceNode | ConstructorJunctionNode;

export type ConstructorFlowEdge = Edge<AnimatedWireData, "animatedWire">;

export type SavedConstructorCircuit = {
  version: 1;
  nodes: ConstructorFlowNode[];
  edges: ConstructorFlowEdge[];
};

export const componentOrientation: ComponentOrientation = "horizontal";

export type ComponentRotation = 0 | 90 | 180 | 270;

export function componentRotation(
  orientation: ComponentOrientation,
  reversed: boolean,
): ComponentRotation {
  if (orientation === "horizontal") return reversed ? 180 : 0;
  return reversed ? 270 : 90;
}

export function nextComponentRotation(
  orientation: ComponentOrientation,
  reversed: boolean,
): { orientation: ComponentOrientation; reversed: boolean } {
  const nextRotation = (componentRotation(orientation, reversed) + 90) % 360;
  if (nextRotation === 90) {
    return { orientation: "vertical", reversed: false };
  }
  if (nextRotation === 180) {
    return { orientation: "horizontal", reversed: true };
  }
  if (nextRotation === 270) {
    return { orientation: "vertical", reversed: true };
  }
  return { orientation: "horizontal", reversed: false };
}
