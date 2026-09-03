import { describe, expect, it } from "vitest";

import { solveCircuit } from "../../lib/engine/kirchhoff";
import type { Circuit } from "../../lib/engine/model";
import { problem9 } from "../../lib/problems/phase1-validation";

import { circuitToFlow } from "./circuit-adapter";
import {
  problem9CurrentLabelPlacements,
  problem9Positions,
} from "./example-layouts";

describe("adaptador Circuit -> React Flow", () => {
  it("crea un nodo visual por nodo físico y por componente", () => {
    const flow = circuitToFlow(problem9, { nodePositions: problem9Positions });

    expect(flow.nodes).toHaveLength(
      problem9.nodes.length + problem9.components.length,
    );
    expect(flow.edges).toHaveLength(problem9.components.length * 2);
    expect(flow.nodes.filter((node) => node.type === "resistor")).toHaveLength(
      5,
    );
    expect(flow.nodes.filter((node) => node.type === "source")).toHaveLength(3);
  });

  it("expone valores y lleva la corriente resuelta a los cables animados", () => {
    const result = solveCircuit(problem9);
    const flow = circuitToFlow(problem9, {
      nodePositions: problem9Positions,
      branchCurrents: result.branchCurrents,
      currentLabelPlacements: problem9CurrentLabelPlacements,
    });
    const resistor = flow.nodes.find((node) => node.id === "component:R1");
    const source = flow.nodes.find((node) => node.id === "component:E2");

    expect(resistor?.data).toMatchObject({ label: "R1", value: "25 Ω" });
    expect(source?.data).toMatchObject({
      label: "E2",
      value: "15 V",
      sourceType: "voltage",
    });
    expect(
      flow.nodes.find((node) => node.id === "component:E3")?.data,
    ).toMatchObject({ orientation: "vertical", reversed: true });
    expect(
      flow.nodes.find((node) => node.id === "component:R4")?.data,
    ).toMatchObject({ orientation: "horizontal", reversed: true });
    expect(flow.edges.every((edge) => edge.type === "animatedWire")).toBe(true);
    expect(flow.edges.every((edge) => edge.animated === false)).toBe(true);
    const r1Wire = flow.edges.find((edge) => edge.id === "wire:R1:from");
    expect(r1Wire?.data).toMatchObject({
      branchLabel: "R1",
      current: result.branchCurrents.R1,
    });
    expect(r1Wire?.data?.normalizedMagnitude).toBeCloseTo(
      Math.abs(result.branchCurrents.R1) /
        Math.max(...Object.values(result.branchCurrents).map(Math.abs)),
    );
    const r3Wire = flow.edges.find((edge) => edge.id === "wire:R3:to");
    expect(r3Wire?.data).toMatchObject({
      branchLabel: "R3",
      current: result.branchCurrents.R3,
      normalizedMagnitude: 1,
    });
    expect(
      flow.edges.find((edge) => edge.id === "wire:R4:to")?.data,
    ).toMatchObject({
      referenceLabel: "I0",
      referenceDirection: 1,
      referenceIsOpposite: true,
      referenceLabelNormalOffset: 70,
    });
    expect(
      flow.edges.find((edge) => edge.id === "wire:E2:from")?.data,
    ).toMatchObject({
      referenceLabel: "I1",
      referenceDirection: -1,
      referenceIsOpposite: false,
      referenceLabelNormalOffset: 115,
    });
    expect(
      flow.edges.find((edge) => edge.id === "wire:R2:from")?.data,
    ).toMatchObject({
      referenceLabel: "I2",
      referenceDirection: 1,
      referenceIsOpposite: false,
      referenceLabelTangentOffset: 75,
      referenceLabelNormalOffset: 95,
    });
  });

  it("adapta fuentes de corriente y conserva el sentido de su flecha", () => {
    const currentCircuit: Circuit = {
      nodes: [{ id: "top" }, { id: "bottom" }],
      components: [
        {
          type: "currentSource",
          label: "I1",
          nFrom: "bottom",
          nTo: "top",
          amps: 2.5,
        },
      ],
    };

    const flow = circuitToFlow(currentCircuit, {
      nodePositions: {
        top: { x: 100, y: 0 },
        bottom: { x: 100, y: 300 },
      },
    });

    expect(
      flow.nodes.find((node) => node.id === "component:I1")?.data,
    ).toMatchObject({
      label: "I1",
      value: "2,5 A",
      sourceType: "current",
      orientation: "vertical",
      reversed: true,
    });
  });
});
