import { describe, expect, it } from "vitest";

import type { Circuit } from "../../lib/engine/model";
import { problem9 } from "../../lib/problems/phase1-validation";

import { circuitToFlow } from "./circuit-adapter";
import { problem9Positions } from "./example-layouts";

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

  it("expone etiquetas y valores y mantiene los cables sin animación", () => {
    const flow = circuitToFlow(problem9, { nodePositions: problem9Positions });
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
    expect(flow.edges.every((edge) => edge.animated === false)).toBe(true);
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
