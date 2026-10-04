import { describe, expect, it } from "vitest";

import type {
  ConstructorFlowEdge,
  ConstructorFlowNode,
} from "./constructor-types";
import {
  getConstructorProgress,
  isConstructorConnectionAllowed,
} from "./constructor-guidance";

const nodes = [
  {
    id: "R1",
    type: "resistor",
    position: { x: 0, y: 0 },
    data: {
      builderKind: "resistor",
      label: "R1",
      numericValue: 10,
      value: "10 Ω",
      orientation: "horizontal",
      reversed: false,
    },
  },
  {
    id: "E1",
    type: "source",
    position: { x: 0, y: 0 },
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
  },
  {
    id: "N0",
    type: "junction",
    position: { x: 0, y: 0 },
    data: {
      builderKind: "junction",
      label: "0",
      isGround: true,
    },
  },
  {
    id: "N1",
    type: "junction",
    position: { x: 0, y: 0 },
    data: {
      builderKind: "junction",
      label: "N1",
      isGround: false,
    },
  },
] as ConstructorFlowNode[];

function edge(
  id: string,
  source: string,
  sourceHandle: string,
  target: string,
  targetHandle: string,
): ConstructorFlowEdge {
  return {
    id,
    source,
    sourceHandle,
    target,
    targetHandle,
    type: "animatedWire",
    data: { branchLabel: "Rama", current: 0, normalizedMagnitude: 0 },
  };
}

describe("constructor guidance", () => {
  it("acepta solo terminal a nodo, una vez y sin cerrar ambos terminales en el mismo nodo", () => {
    const first = edge("w1", "N0", "right", "R1", "from");
    expect(isConstructorConnectionAllowed(first, nodes, [])).toBe(true);
    expect(isConstructorConnectionAllowed(first, nodes, [first])).toBe(false);
    expect(
      isConstructorConnectionAllowed(
        edge("w2", "R1", "to", "N0", "left"),
        nodes,
        [first],
      ),
    ).toBe(false);
    expect(
      isConstructorConnectionAllowed(
        edge("w3", "R1", "to", "N1", "left"),
        nodes,
        [first],
      ),
    ).toBe(true);
    expect(
      isConstructorConnectionAllowed(
        edge("w4", "R1", "to", "E1", "from"),
        nodes,
        [],
      ),
    ).toBe(false);
  });

  it("actualiza los cuatro pasos sin adelantar estados", () => {
    const openEdges = [
      edge("w1", "N0", "right", "R1", "from"),
      edge("w2", "R1", "to", "N1", "left"),
      edge("w3", "N1", "right", "E1", "from"),
    ];
    expect(getConstructorProgress(nodes, [], false, false)).toEqual({
      basicsAdded: true,
      terminalsConnected: false,
      networkClosed: false,
      solved: false,
    });
    expect(getConstructorProgress(nodes, openEdges, false, false)).toEqual({
      basicsAdded: true,
      terminalsConnected: false,
      networkClosed: false,
      solved: false,
    });

    const closedEdges = [
      ...openEdges,
      edge("w4", "E1", "to", "N0", "left"),
    ];
    expect(getConstructorProgress(nodes, closedEdges, true, false)).toEqual({
      basicsAdded: true,
      terminalsConnected: true,
      networkClosed: true,
      solved: false,
    });
    expect(getConstructorProgress(nodes, closedEdges, true, true).solved).toBe(
      true,
    );
  });
});
