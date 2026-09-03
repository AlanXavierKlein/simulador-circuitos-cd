import type { Edge, Node } from "@xyflow/react";

export type ComponentOrientation = "horizontal" | "vertical";

export type ResistorNodeData = Record<string, unknown> & {
  label: string;
  value: string;
  orientation: ComponentOrientation;
  reversed: boolean;
};

export type SourceNodeData = Record<string, unknown> & {
  label: string;
  value: string;
  sourceType: "voltage" | "current";
  orientation: ComponentOrientation;
  reversed: boolean;
};

export type JunctionNodeData = Record<string, unknown> & {
  label: string;
  isGround: boolean;
};

export type ResistorFlowNode = Node<ResistorNodeData, "resistor">;
export type SourceFlowNode = Node<SourceNodeData, "source">;
export type JunctionFlowNode = Node<JunctionNodeData, "junction">;
export type CircuitFlowNode =
  ResistorFlowNode | SourceFlowNode | JunctionFlowNode;

export type AnimatedWireData = Record<string, unknown> & {
  branchLabel: string;
  current: number;
  normalizedMagnitude: number;
};

export type CircuitFlowEdge = Edge<AnimatedWireData, "animatedWire">;
