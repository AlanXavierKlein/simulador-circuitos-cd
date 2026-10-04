import { describe, expect, it } from "vitest";

import { editableGraphToCircuit } from "../../lib/engine/graph";
import { solveCircuit } from "../../lib/engine/kirchhoff";

import { createSimpleConstructorExample } from "./constructor-example";
import { getConstructorFeedback } from "./constructor-feedback";
import type {
  ConstructorFlowEdge,
  ConstructorSourceNode,
} from "./constructor-types";

describe("mensajes contextuales del constructor", () => {
  it("identifica el componente y el terminal que quedó suelto", () => {
    const example = createSimpleConstructorExample();
    const edges = example.edges.filter(
      (edge) => edge.id !== "example:wire:R1:to",
    );

    expect(
      getConstructorFeedback(
        example.nodes,
        edges,
        ["R1 tiene el terminal de salida sin conectar."],
        false,
        null,
      ),
    ).toEqual({
      kind: "incomplete",
      title: "Falta conectar R1",
      message: "Conectá su terminal de salida a un nodo resaltado.",
      nodeIds: ["example:resistor:R1"],
    });
  });

  it("explica cuando todos los terminales están unidos pero no hay malla", () => {
    const example = createSimpleConstructorExample();
    const sourceOnlyNodes = example.nodes.filter(
      (node) => node.id !== "example:resistor:R1",
    );
    const sourceOnlyEdges = example.edges.filter(
      (edge) => !edge.id.includes(":R1:"),
    );
    const feedback = getConstructorFeedback(
      sourceOnlyNodes,
      sourceOnlyEdges,
      ["El circuito todavía no forma una malla cerrada."],
      false,
      null,
    );

    expect(feedback?.title).toBe("Falta cerrar la malla");
    expect(feedback?.kind).toBe("incomplete");
  });

  it("distingue una red completa que no tiene solución física válida", () => {
    const example = createSimpleConstructorExample();
    const feedback = getConstructorFeedback(
      example.nodes,
      example.edges,
      [],
      true,
      "El cortocircuito ideal conecta ambos bornes de E1.",
    );

    expect(feedback).toEqual({
      kind: "unsolvable",
      title: "Red completa, pero no resoluble",
      message: "El cortocircuito ideal conecta ambos bornes de E1.",
      nodeIds: ["example:source:E1"],
    });
  });

  it("conserva la explicación específica y marca una resistencia en corto", () => {
    const example = createSimpleConstructorExample();
    const resistor = example.nodes.find(
      (node) => node.id === "example:resistor:R1",
    );
    expect(resistor).toBeDefined();
    if (resistor?.data.builderKind === "resistor") {
      resistor.data.numericValue = 0;
      resistor.data.value = "0 Ω";
    }
    const calculationError =
      "No se puede determinar una solución única con estos cortocircuitos ideales. Dejá al menos una resistencia distinta de 0 Ω en cada camino paralelo.";

    expect(
      getConstructorFeedback(
        example.nodes,
        example.edges,
        [],
        true,
        calculationError,
      ),
    ).toEqual({
      kind: "unsolvable",
      title: "Red completa, pero no resoluble",
      message: calculationError,
      nodeIds: ["example:resistor:R1"],
    });
  });

  it("traduce un sistema real incompatible sin dejar resultados numéricos", () => {
    const example = createSimpleConstructorExample();
    const source = example.nodes.find(
      (node) => node.id === "example:source:E1",
    ) as ConstructorSourceNode | undefined;
    expect(source).toBeDefined();
    const conflictingSource: ConstructorSourceNode = {
      ...structuredClone(source!),
      id: "example:source:E2",
      position: { x: 330, y: 250 },
      data: {
        ...structuredClone(source!.data),
        label: "E2",
        numericValue: 5,
        value: "5 V",
      },
    };
    const nodes = [...example.nodes, conflictingSource];
    const edges: ConstructorFlowEdge[] = [
      ...example.edges,
      {
        ...structuredClone(example.edges[0]),
        id: "example:wire:E2:from",
        target: conflictingSource.id,
        data: {
          branchLabel: "E2",
          current: 0,
          normalizedMagnitude: 0,
        },
      },
      {
        ...structuredClone(example.edges[1]),
        id: "example:wire:E2:to",
        source: conflictingSource.id,
        data: {
          branchLabel: "E2",
          current: 0,
          normalizedMagnitude: 0,
        },
      },
    ];
    const validation = editableGraphToCircuit(
      nodes.map((node) =>
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
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    );

    expect(validation.issues).toEqual([]);
    expect(validation.circuit).not.toBeNull();

    let calculationError: string | null = null;
    try {
      solveCircuit(validation.circuit!);
    } catch (error) {
      calculationError =
        error instanceof Error ? error.message : "No se pudo resolver.";
    }

    expect(calculationError).not.toBeNull();
    const feedback = getConstructorFeedback(
      nodes,
      edges,
      validation.issues,
      true,
      calculationError,
    );
    expect(feedback?.kind).toBe("unsolvable");
    expect(feedback?.message).toContain("condiciones incompatibles");
    expect(feedback?.nodeIds).toEqual([
      "example:source:E1",
      "example:source:E2",
    ]);
  });
});
