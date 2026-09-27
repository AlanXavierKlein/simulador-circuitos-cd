import type { Edge, Node } from "@xyflow/react";

export type ComponentOrientation = "horizontal" | "vertical";
export type VoltagePolarity = "positive" | "negative" | "neutral";

export type ConnectionHint = "origin" | "valid" | "invalid";

type ConnectionGuidanceData = {
  connectionActive?: boolean;
  connectionHint?: ConnectionHint;
  connectionHintMessage?: string;
  connectionOriginHandle?: string;
  validTargetHandles?: string[];
  validationHint?: "incomplete" | "unsolvable";
};

export type ResistorNodeData = Record<string, unknown> &
  ConnectionGuidanceData & {
  label: string;
  value: string;
  orientation: ComponentOrientation;
  reversed: boolean;
};

export type SourceNodeData = Record<string, unknown> &
  ConnectionGuidanceData & {
  label: string;
  value: string;
  sourceType: "voltage" | "current";
  orientation: ComponentOrientation;
  reversed: boolean;
  voltagePolarity?: VoltagePolarity;
  };

export type JunctionNodeData = Record<string, unknown> &
  ConnectionGuidanceData & {
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
  referenceLabel?: string;
  referenceDirection?: 1 | -1;
  referenceCurrent?: number;
  referenceIsOpposite?: boolean;
  referenceLabelTangentOffset?: number;
  referenceLabelNormalOffset?: number;
};

export type CircuitFlowEdge = Edge<AnimatedWireData, "animatedWire">;
