import { describe, expect, it } from "vitest";

import { editableGraphToCircuit } from "../../lib/engine/graph";
import { solveCircuit } from "../../lib/engine/kirchhoff";
import { buildReferenceCurrentLayout } from "../../lib/engine/reference-currents";

import { createSimpleConstructorExample } from "./constructor-example";

describe("circuito de ejemplo del constructor", () => {
  it("está completo y se resuelve con los valores iniciales", () => {
    const example = createSimpleConstructorExample();
    const validation = editableGraphToCircuit(
      example.nodes.map((node) =>
        node.data.builderKind === "junction"
          ? {
              id: node.id,
              kind: "junction" as const,
              label: node.data.label,
              isGround: node.data.isGround,
            }
          : {
              id: node.id,
              kind: node.data.builderKind,
              label: node.data.label,
              value: node.data.numericValue,
            },
      ),
      example.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    );

    expect(validation.issues).toEqual([]);
    expect(validation.circuit).not.toBeNull();
    const result = solveCircuit(validation.circuit!);
    expect(result.branchCurrents.R1).toBeCloseTo(0.9, 8);
    expect(
      buildReferenceCurrentLayout(validation.circuit!, result.branchCurrents)
        .groups[0].current,
    ).toBeCloseTo(0.9, 8);
  });

  it("entrega una copia editable nueva cada vez", () => {
    const first = createSimpleConstructorExample();
    const second = createSimpleConstructorExample();

    first.nodes[0].position.x = 999;
    expect(second.nodes[0].position.x).toBe(110);
  });
});
