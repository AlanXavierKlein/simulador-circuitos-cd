import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
  SavedConstructorCircuit,
} from "./constructor-types";

export function createSimpleConstructorExample(): SavedConstructorCircuit {
  const nodes: ConstructorFlowNode[] = [
    {
      id: "example:junction:n1",
      type: "junction",
      position: { x: 110, y: 280 },
      data: {
        builderKind: "junction",
        label: "N1",
        isGround: false,
      },
      initialWidth: 44,
      initialHeight: 44,
      zIndex: 3,
    },
    {
      id: "example:junction:ground",
      type: "junction",
      position: { x: 690, y: 280 },
      data: {
        builderKind: "junction",
        label: "0",
        isGround: true,
      },
      initialWidth: 44,
      initialHeight: 44,
      zIndex: 3,
    },
    {
      id: "example:resistor:R1",
      type: "resistor",
      position: { x: 330, y: 460 },
      data: {
        builderKind: "resistor",
        label: "R1",
        numericValue: 10,
        value: "10 Ω",
        orientation: "horizontal",
        reversed: false,
      },
      initialWidth: 180,
      initialHeight: 104,
      zIndex: 2,
    },
    {
      id: "example:source:E1",
      type: "source",
      position: { x: 330, y: 90 },
      data: {
        builderKind: "voltageSource",
        label: "E1",
        numericValue: 9,
        value: "9 V",
        sourceType: "voltage",
        voltagePolarity: "positive",
        orientation: "horizontal",
        reversed: false,
      },
      initialWidth: 180,
      initialHeight: 104,
      zIndex: 2,
    },
  ];

  const edges: ConstructorFlowEdge[] = [
    {
      id: "example:wire:E1:from",
      source: "example:junction:n1",
      sourceHandle: "top",
      target: "example:source:E1",
      targetHandle: "from",
      type: "animatedWire",
      data: { branchLabel: "E1", current: 0, normalizedMagnitude: 0 },
    },
    {
      id: "example:wire:E1:to",
      source: "example:source:E1",
      sourceHandle: "to",
      target: "example:junction:ground",
      targetHandle: "top",
      type: "animatedWire",
      data: { branchLabel: "E1", current: 0, normalizedMagnitude: 0 },
    },
    {
      id: "example:wire:R1:from",
      source: "example:junction:n1",
      sourceHandle: "bottom",
      target: "example:resistor:R1",
      targetHandle: "from",
      type: "animatedWire",
      data: { branchLabel: "R1", current: 0, normalizedMagnitude: 0 },
    },
    {
      id: "example:wire:R1:to",
      source: "example:resistor:R1",
      sourceHandle: "to",
      target: "example:junction:ground",
      targetHandle: "bottom",
      type: "animatedWire",
      data: { branchLabel: "R1", current: 0, normalizedMagnitude: 0 },
    },
  ];

  return { version: 1, nodes, edges };
}
